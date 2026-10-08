import { randomUUID, createHash } from 'node:crypto';
import { getPool } from './database.js';
import { hashPassword, verifyPassword } from './auth.js';
import { findLeads, draftFollowups } from './core.js';

const digest = token => createHash('sha256').update(token).digest('hex');
const cookieName='leadpilot_session';
const sessions=new Map();
function respond(res,status,body,headers={}){
 res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});
 res.end(JSON.stringify(body));
}
async function body(req){
 let size=0, chunks=[];
 for await(const chunk of req){
  size+=chunk.length;
  if(size>16384) throw new Error('Request too large');
  chunks.push(chunk);
 }
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new Error('Invalid JSON');}
}
function cookie(req){const raw=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='));return raw?.slice(cookieName.length+1)||'';}
function setCookie(token,secure=true){return cookieName+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400'+(secure?'; Secure':'');}
function isOriginAllowed(req){
 const origin=req.headers.origin;
 if(!origin)return true;
 try{return new URL(origin).host===req.headers.host;}catch{return false;}
}
function throttle(req){
 const key=req.socket.remoteAddress||'unknown', now=Date.now();
 for(const [k,v] of sessions)if(v.until<now)sessions.delete(k);
 const item=sessions.get(key)||{count:0,until:now+60000};
 if(item.until<now){item.count=0;item.until=now+60000;}
 item.count++;sessions.set(key,item);return item.count<=15;
}
async function account(req){
 const token=cookie(req);
 if(!/^[0-9a-f-]{36}$/i.test(token))return null;
 const {rows}=await getPool().query(`SELECT a.id,a.email,s.id AS session_id FROM leadpilot_private.sessions s JOIN leadpilot_private.accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>now() AND s.revoked_at IS NULL`,[digest(token)]);
 return rows[0]||null;
}
export const getAuthenticatedAccount=account;
export async function accountApi(req,res,path){
 if(!path.startsWith('/api/'))return false;
 if(!['GET','POST'].includes(req.method)){respond(res,405,{error:'Method not allowed'});return true;}
 if(req.method==='POST'&&(!isOriginAllowed(req)||!throttle(req))){respond(res,403,{error:'Request rejected'});return true;}
 try{
  if(path==='/api/signup'&&req.method==='POST'){
   const data=await body(req);
   const email=String(data.email||'').trim().toLowerCase(), password=data.password;
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length<12||password.length>1024){respond(res,400,{error:'Valid email and password of at least 12 characters required'});return true;}
   const id=randomUUID(),hash=hashPassword(password);
   try{await getPool().query('INSERT INTO leadpilot_private.accounts(id,email,password_hash) VALUES($1,$2,$3)',[id,email,hash]);}
   catch(e){if(e.code==='23505'){respond(res,409,{error:'Account already exists'});return true;}throw e;}
   respond(res,201,{created:true,message:'Account created. Sign in to continue.'});return true;
  }
  if(path==='/api/login'&&req.method==='POST'){
   const data=await body(req);
   const email=String(data.email||'').trim().toLowerCase(),password=data.password;
   if(email.length>254||typeof password!=='string'){respond(res,401,{error:'Invalid email or password'});return true;}
   const {rows}=await getPool().query('SELECT id,email,password_hash FROM leadpilot_private.accounts WHERE email=$1',[email]);
   if(!rows[0]||!verifyPassword(password,rows[0].password_hash)){respond(res,401,{error:'Invalid email or password'});return true;}
   const token=randomUUID();
   await getPool().query(`INSERT INTO leadpilot_private.sessions(id,account_id,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '1 day')`,[randomUUID(),rows[0].id,digest(token)]);
   respond(res,200,{authenticated:true,email:rows[0].email},{'set-cookie':setCookie(token,process.env.NODE_ENV!=='test')});return true;
  }
  if(path==='/api/me'&&req.method==='GET'){
   const user=await account(req);if(!user){respond(res,401,{authenticated:false});return true;}
   respond(res,200,{authenticated:true,email:user.email,id:user.id});return true;
  }
  if((path==='/api/leads/rank'||path==='/api/followups/draft')&&req.method==='POST'){
   const user=await account(req);
   if(!user){respond(res,401,{error:'Sign in required'});return true;}
   const data=await body(req);
   const ranking=path==='/api/leads/rank',items=ranking?data.messages:data.leads;
   if(!Array.isArray(items)||items.length<1||items.length>100||items.some(x=>!x||typeof x!=='object'||Array.isArray(x))){
    respond(res,400,{error:'Provide 1 to 100 valid items'});return true;
   }
   const fields=ranking?['text','name','email','date','direction','id','subject','from']:['last_message','text','context','name','email','id'];
   if(items.some(item=>Object.entries(item).some(([key,value])=>fields.includes(key)&& (typeof value!=='string'||value.length>4000)))){
    respond(res,400,{error:'Invalid item fields or text exceeds 4000 characters'});return true;
   }
   const metric=ranking?'monthlyLeads':'monthlyDrafts';
   const {rows}=await getPool().query('SELECT * FROM leadpilot_private.consume_usage($1,$2,$3)',[user.id,metric,items.length]);
   const usage=rows[0];
   if(!usage.allowed){respond(res,429,{error:'Monthly plan limit reached',usage});return true;}
   respond(res,200,{...(ranking?{leads:findLeads({messages:items})}:{drafts:draftFollowups({leads:items})}),usage});
   return true;
  }
  if(path==='/api/usage'&&req.method==='GET'){
   const user=await account(req);
   if(!user){respond(res,401,{error:'Sign in required'});return true;}
   const {rows}=await getPool().query(`SELECT metric,used FROM leadpilot_private.usage WHERE account_id=$1 AND period_start=date_trunc('month',now() AT TIME ZONE 'UTC')::date`,[user.id]);
   const {rows:plans}=await getPool().query("SELECT plan,status,period_ends_at FROM leadpilot_private.subscriptions WHERE account_id=$1",[user.id]);
   const subscription=plans[0]||{plan:'free',status:'active',period_ends_at:null};
   respond(res,200,{usage:rows,subscription});return true;
  }
  if(path==='/api/logout'&&req.method==='POST'){
   const user=await account(req);
   if(user)await getPool().query('UPDATE leadpilot_private.sessions SET revoked_at=now() WHERE id=$1',[user.session_id]);
   respond(res,200,{authenticated:false},{'set-cookie':setCookie('',process.env.NODE_ENV!=='test').replace('Max-Age=86400','Max-Age=0')});return true;
  }
  respond(res,404,{error:'Not found'});return true;
 }catch(e){
  if(e.message==='Request too large'){respond(res,413,{error:'Request too large'});return true;}
  if(e.message==='Invalid JSON'){respond(res,400,{error:'Invalid JSON'});return true;}
  console.error('[leadpilot] account API failed',e.code||e.message);
  respond(res,503,{error:'Account service unavailable'});return true;
 }
}
