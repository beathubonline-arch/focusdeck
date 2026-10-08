import { ImapFlow } from 'imapflow';
import { getAuthenticatedAccount } from './account-api.js';
import { getPool } from './database.js';
import { findLeads, draftFollowups } from './core.js';

const providers=Object.freeze({
 gmail:{host:'imap.gmail.com',label:'Gmail / Google Workspace'},
 outlook:{host:'outlook.office365.com',label:'Outlook / Microsoft 365'},
 yahoo:{host:'imap.mail.yahoo.com',label:'Yahoo Mail'},
 icloud:{host:'imap.mail.me.com',label:'iCloud Mail'},
 zoho:{host:'imap.zoho.com',label:'Zoho Mail'},
 aol:{host:'imap.aol.com',label:'AOL Mail'},
 fastmail:{host:'imap.fastmail.com',label:'Fastmail'}
});
function reply(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));}
async function read(req){let bytes=0,parts=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>8192)throw Error('Payload too large');parts.push(chunk);}return JSON.parse(Buffer.concat(parts).toString('utf8'));}
function plain(input){return String(input||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,2000);}
function allowed(req){const origin=req.headers.origin;return !origin||origin==='https://leadpilot-ai-beathub.onrender.com';}
export async function emailApi(req,res,path){
 if(path==='/api/email/providers'&&req.method==='GET'){reply(res,200,{providers:Object.entries(providers).map(([id,p])=>({id,label:p.label})),mode:'On-demand IMAP scan. Gmail and Microsoft OAuth is recommended; password-based IMAP may be blocked by these providers.'});return;}
 if(path!=='/api/email/scan'||req.method!=='POST'){reply(res,404,{error:'Not found'});return;}
 if(!allowed(req)){reply(res,403,{error:'Origin rejected'});return;}
 let client;
 try{
  const account=await getAuthenticatedAccount(req);
  if(!account){reply(res,401,{error:'Sign in required'});return;}
  const data=await read(req);
  const provider=providers[data.provider];
  if(!provider){reply(res,400,{error:'Choose a supported email provider'});return;}
  if(data.provider==='outlook'){reply(res,422,{error:'Microsoft requires OAuth for most accounts. Outlook connection is not yet available; do not enter your account password.'});return;}
  const email=String(data.email||'').trim(),password=String(data.appPassword||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8||password.length>256){reply(res,400,{error:'Enter a valid email and app-specific password'});return;}
  client=new ImapFlow({host:provider.host,port:993,secure:true,auth:{user:email,pass:password},logger:false,greetingTimeout:10000,connectionTimeout:10000,socketTimeout:20000});
  await client.connect();
  const lock=await client.getMailboxLock('INBOX');
  let messages=[];
  try{
   const count=client.mailbox.exists||0;
   if(count){const start=Math.max(1,count-24);for await(const msg of client.fetch(start+':'+count,{envelope:true,source:true},{uid:false})){
    const from=msg.envelope?.from?.[0];
    const source=msg.source?.toString('utf8')||'';
    const split=source.search(/\r?\n\r?\n/);
    messages.push({id:String(msg.uid||messages.length+1),from:from?.address||'',name:from?.name||'',subject:plain(msg.envelope?.subject),date:msg.envelope?.date?.toISOString?.()||'',text:plain(split>=0?source.slice(split+2):''),direction:'inbound'});
   }}
  }finally{lock.release();}
  const ranked=findLeads({messages});
  if(ranked.length){const {rows}=await getPool().query('SELECT * FROM leadpilot_private.consume_usage($1,$2,$3)',[account.id,'monthlyLeads',ranked.length]);if(!rows[0]?.allowed){reply(res,429,{error:'Monthly lead allowance reached. Upgrade to scan more leads.'});return;}}
  reply(res,200,{scanned:messages.length,leads:ranked,drafts:draftFollowups({leads:ranked.slice(0,5).map(m=>({...m,last_message:m.text}))}),note:'Review all drafts before sending. This scan does not send or store email.'});
 }catch(e){console.error('[leadpilot] email scan failed',e.code||e.message);reply(res,503,{error:'Unable to scan inbox. Check provider settings, app password and IMAP access.'});}
 finally{if(client)try{await client.logout();}catch{}}
}
