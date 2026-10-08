import {createHmac,randomBytes,createCipheriv,createDecipheriv,createHash,timingSafeEqual} from 'node:crypto';
import {getAuthenticatedAccount} from './account-api.js';
import {findLeads,draftFollowups} from './core.js';
import {filterSalesInbox} from './email-filter.js';
import {saveConnection,loadConnection,deleteConnection,saveScan,recentScans} from './gmail-store.js';
const BASE='https://leadpilot-ai-beathub.onrender.com';
const SCOPE='https://www.googleapis.com/auth/gmail.readonly';
const key=()=>createHash('sha256').update(process.env.LEADPILOT_OAUTH_SECRET||'').digest();
const ready=()=>Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&(process.env.LEADPILOT_OAUTH_SECRET||'').length>=32);
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));};
const cookie=(req,name)=>String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
const secureCookie=(name,value,age)=>name+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age;
const seal=(obj)=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv),encrypted=Buffer.concat([cipher.update(JSON.stringify(obj)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');};
const unseal=(str)=>{const data=Buffer.from(str,'base64url');if(data.length<29)throw Error('Invalid token');const decipher=createDecipheriv('aes-256-gcm',key(),data.subarray(0,12));decipher.setAuthTag(data.subarray(12,28));return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)),decipher.final()]).toString());};
async function scan(token){
 const headers={Authorization:'Bearer '+token};
 const r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in%3Ainbox',{headers});
 if(!r.ok)throw Error('Gmail access expired or revoked');
 const ids=(await r.json()).messages||[];
 const messages=[],threads=new Map();
 for(const item of ids){
  const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+encodeURIComponent(item.id)+'?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=List-Unsubscribe&metadataHeaders=Auto-Submitted',{headers});
  if(!response.ok)continue;
  const msg=await response.json(),hs=msg.payload?.headers||[];
  const header=n=>hs.find(h=>h.name.toLowerCase()===n.toLowerCase())?.value||'';
  messages.push({id:item.id,threadId:msg.threadId,from:header('from'),subject:header('subject'),date:header('date'),text:msg.snippet||'',direction:'inbound',automated:!!(header('List-Unsubscribe')||header('Auto-Submitted'))});
  if(msg.threadId&&!threads.has(msg.threadId))threads.set(msg.threadId,[]);
 }
 // Thread context determines whether the latest response came from the prospect or the account owner.
 const profile=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile',{headers});
 const owner=profile.ok?String((await profile.json()).emailAddress||'').toLowerCase():'';
 const threadStates=new Map();
 for(const id of [...threads.keys()].slice(0,50)){
  const tr=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/threads/'+encodeURIComponent(id)+'?format=metadata&metadataHeaders=From&metadataHeaders=Date',{headers});
  if(!tr.ok)continue;
  const items=(await tr.json()).messages||[];
  const last=items[items.length-1];
  const from=last?.payload?.headers?.find(h=>h.name.toLowerCase()==='from')?.value||'';
  const address=(from.match(/[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}/)||[])[0]?.toLowerCase()||'';
  threadStates.set(id,{awaitingReply:!!address&&address!==owner,messageCount:items.length});
 }
 const {candidates,excluded,review}=filterSalesInbox(messages);
 const actionable=candidates.filter(m=>threadStates.get(m.threadId)?.awaitingReply!==false);
 const leads=findLeads({messages:actionable}).map(m=>({...m,threadId:messages.find(x=>x.id===m.id)?.threadId||null,priority:m.score>=65?'high':m.score>=45?'medium':'normal',nextAction:'Review and reply'}));
 const drafts=draftFollowups({leads:leads.slice(0,10).map(m=>({...m,last_message:m.text}))});
 return {scanned:messages.length,qualified:leads.length,review,ignored:excluded,leads,drafts,threadContext:true,note:'Read-only Gmail access. No emails were sent.'};
}
async function refreshAccess(accountId){
 const record=await loadConnection(accountId);
 if(!record)return null;
 const stored=unseal(record.refresh_token);
 if(stored.id!==accountId)throw Error('Invalid saved connection');
 const body=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,refresh_token:stored.refresh,grant_type:'refresh_token'});
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
 if(!response.ok)throw Error('Google authorization expired. Reconnect your Gmail account.');
 return (await response.json()).access_token;
}
export async function googleEmailApi(req,res,path,url){
 try{
  if(path==='/api/google/status'){const user=await getAuthenticatedAccount(req);let persistent=false;if(user&&ready()){try{persistent=!!(await loadConnection(user.id));}catch{}}json(res,200,{configured:ready(),connected:ready()&&(Boolean(cookie(req,'lp_google'))||persistent),persistent});return;}
  if(!ready()){json(res,503,{error:'Google sign-in not configured. Administrator must add OAuth credentials.'});return;}
  if(path==='/api/google/connect'&&req.method==='GET'){
   const user=await getAuthenticatedAccount(req);if(!user){res.writeHead(302,{location:'/login'});res.end();return;}
   const state=seal({id:user.id,nonce:randomBytes(12).toString('hex'),exp:Date.now()+600000});
   const params=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:BASE+'/api/google/callback',response_type:'code',scope:SCOPE,state,access_type:'offline',prompt:'consent'});
   res.writeHead(302,{location:'https://accounts.google.com/o/oauth2/v2/auth?'+params,'set-cookie':secureCookie('lp_google_state',createHash('sha256').update(state).digest('hex'),600),'cache-control':'no-store'});res.end();return;
  }
  if(path==='/api/google/callback'&&req.method==='GET'){
   const user=await getAuthenticatedAccount(req);
   const state=url.searchParams.get('state')||'',expected=cookie(req,'lp_google_state');
   const actual=createHash('sha256').update(state).digest('hex');
   if(!user||!expected||expected.length!==actual.length||!timingSafeEqual(Buffer.from(expected),Buffer.from(actual))||url.searchParams.has('error'))throw Error('OAuth state invalid');
   const payload=unseal(state);
   if(payload.id!==user.id||payload.exp<Date.now()||!url.searchParams.get('code'))throw Error('OAuth expired');
   const body=new URLSearchParams({code:url.searchParams.get('code'),client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:BASE+'/api/google/callback',grant_type:'authorization_code'});
   const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
   if(!response.ok)throw Error('Google token exchange failed');
   const tokens=await response.json();
   if(!tokens.access_token)throw Error('Google access unavailable');
   if(tokens.refresh_token){const profile=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile',{headers:{Authorization:'Bearer '+tokens.access_token}});const address=profile.ok?(await profile.json()).emailAddress||'':'';await saveConnection(user.id,seal({id:user.id,refresh:tokens.refresh_token}),address);}
   const token=seal({id:user.id,access:tokens.access_token,exp:Date.now()+Math.min(Number(tokens.expires_in||3600),3600)*1000});
   res.writeHead(302,{location:'/account?gmail=connected','cache-control':'no-store','set-cookie':[secureCookie('lp_google',token,Math.min(Number(tokens.expires_in||3600),3600)),secureCookie('lp_google_state','',0)]});res.end();return;
  }
  if(path==='/api/google/scan'&&req.method==='POST'){
   const user=await getAuthenticatedAccount(req);if(!user){json(res,401,{error:'Sign in required'});return;}
   const origin=req.headers.origin;if(origin&&origin!==BASE){json(res,403,{error:'Origin rejected'});return;}
   let access;try{const token=unseal(cookie(req,'lp_google'));if(token.id===user.id&&token.exp>Date.now()+30000)access=token.access;}catch{}
   if(!access)access=await refreshAccess(user.id);
   if(!access)throw Error('Connect Gmail first');
   const result=await scan(access);await saveScan(user.id,result);json(res,200,result);return;
  }
  if(path==='/api/google/history'&&req.method==='GET'){const user=await getAuthenticatedAccount(req);if(!user){json(res,401,{error:'Sign in required'});return;}json(res,200,{scans:await recentScans(user.id)});return;}
  if(path==='/api/google/disconnect'&&req.method==='POST'){
   const user=await getAuthenticatedAccount(req);if(!user){json(res,401,{error:'Sign in required'});return;}const origin=req.headers.origin;if(origin&&origin!==BASE){json(res,403,{error:'Origin rejected'});return;}await deleteConnection(user.id);
   res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','set-cookie':secureCookie('lp_google','',0)});res.end(JSON.stringify({disconnected:true}));return;
  }
  json(res,404,{error:'Not found'});
 }catch(e){console.error('[leadpilot] Google OAuth:',e.message);json(res,503,{error:'Google connection failed or expired. Reconnect and try again.'});}
}
