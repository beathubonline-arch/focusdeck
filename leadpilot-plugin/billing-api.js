import {getPool} from './database.js';
import {createPaystackCheckout,getPaystackConfig,validatePaystackWebhook} from './paystack.js';
import {PRICING} from './pricing.js';
import {getAuthenticatedAccount} from './account-api.js';

const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));};
const plans=new Set(['pro','business','agency']);
async function readBody(req,max=65536){let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>max)throw new Error('Payload too large');chunks.push(c);}return Buffer.concat(chunks);}
function trustedOrigin(req){
 const origin=req.headers.origin;
 if(origin && origin!=='https://leadpilot-ai-beathub.onrender.com')return false;
 return true;
}
async function verifyTransaction(reference,secret){
 const response=await fetch('https://api.paystack.co/transaction/verify/'+encodeURIComponent(reference),{headers:{Authorization:'Bearer '+secret}});
 if(!response.ok)throw new Error('Paystack verification unavailable');
 const json=await response.json();
 if(json.status!==true||!json.data)throw new Error('Paystack verification failed');
 return json.data;
}
async function settle(reference,secret){
 const pool=getPool();
 const {rows}=await pool.query('SELECT reference,account_id,plan,amount,currency,status FROM leadpilot_private.checkout_intents WHERE reference=$1',[reference]);
 const intent=rows[0];
 if(!intent)return false;
 const payment=await verifyTransaction(reference,secret);
 if(payment.status!=='success'||payment.reference!==intent.reference||payment.currency!==intent.currency||Number(payment.amount)!==intent.amount)return false;
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const lock=await client.query('SELECT status FROM leadpilot_private.checkout_intents WHERE reference=$1 FOR UPDATE',[reference]);
  if(lock.rows[0]?.status==='paid'){await client.query('COMMIT');return true;}
  // Each successful checkout buys 30 days of access, not an automatically recurring subscription.
  await client.query(`INSERT INTO leadpilot_private.subscriptions(account_id,provider,plan,status,period_ends_at,updated_at)
   VALUES($1,'paystack',$2,'active',now()+interval '30 days',now())
   ON CONFLICT(account_id) DO UPDATE SET provider='paystack',plan=EXCLUDED.plan,status='active',
   period_ends_at=GREATEST(COALESCE(leadpilot_private.subscriptions.period_ends_at,now()),now())+interval '30 days',updated_at=now()`,[intent.account_id,intent.plan]);
  await client.query("UPDATE leadpilot_private.checkout_intents SET status='paid',paid_at=now() WHERE reference=$1",[reference]);
  await client.query('COMMIT');
  return true;
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
export async function billingApi(req,res,path,url){
 try{
  const config=getPaystackConfig();
  if(path==='/api/billing/config'&&req.method==='GET'){send(res,200,{enabled:config.enabled&&config.usdApproved&&config.secret.startsWith('sk_live_'),currency:'USD',billing:'30-day access, renew manually'});return;}
  if(path==='/api/paystack/webhook'&&req.method==='POST'){
   if(!config.secret){send(res,503,{error:'Billing not configured'});return;}
   const raw=await readBody(req);
   let event;
   try{event=validatePaystackWebhook(raw,String(req.headers['x-paystack-signature']||''),config.secret);}
   catch{send(res,401,{error:'Invalid signature'});return;}
   if(event.event==='charge.success'&&typeof event.data.reference==='string'&&/^lp_[a-f0-9]{32}$/.test(event.data.reference))
    await settle(event.data.reference,config.secret);
   send(res,200,{received:true});return;
  }
  if(path==='/api/billing/checkout'&&req.method==='POST'){
   if(!trustedOrigin(req)){send(res,403,{error:'Origin rejected'});return;}
   if(!config.enabled||!config.usdApproved||!config.secret.startsWith('sk_live_')){send(res,503,{error:'Live USD checkout not enabled'});return;}
   const user=await getAuthenticatedAccount(req);
   if(!user){send(res,401,{error:'Sign in required'});return;}
   const input=JSON.parse((await readBody(req,4096)).toString('utf8'));
   if(!plans.has(input.plan)){send(res,400,{error:'Choose a paid plan'});return;}
   const result=await createPaystackCheckout({email:user.email,accountId:user.id,plan:input.plan,callbackUrl:'https://leadpilot-ai-beathub.onrender.com/account'});
   await getPool().query('INSERT INTO leadpilot_private.checkout_intents(reference,account_id,plan,amount,currency) VALUES($1,$2,$3,$4,$5)',[result.reference,user.id,input.plan,PRICING[input.plan].monthlyUsd*100,'USD']);
   send(res,200,{authorization_url:result.authorization_url});return;
  }
  if(path==='/api/billing/verify'&&req.method==='POST'){
   const user=await getAuthenticatedAccount(req);
   if(!user){send(res,401,{error:'Sign in required'});return;}
   const input=JSON.parse((await readBody(req,4096)).toString('utf8'));
   if(typeof input.reference!=='string'||!/^lp_[a-f0-9]{32}$/.test(input.reference)){send(res,400,{error:'Invalid reference'});return;}
   const {rows}=await getPool().query('SELECT 1 FROM leadpilot_private.checkout_intents WHERE reference=$1 AND account_id=$2',[input.reference,user.id]);
   if(!rows.length){send(res,404,{error:'Payment not found'});return;}
   const paid=await settle(input.reference,config.secret);
   send(res,200,{paid});return;
  }
  send(res,405,{error:'Method not allowed'});
 }catch(e){console.error('[leadpilot] billing error',e.message);send(res,503,{error:'Billing unavailable. No upgrade was granted.'});}
}
