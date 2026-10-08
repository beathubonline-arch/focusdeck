import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {randomUUID} from 'node:crypto';
// Requires DATABASE_URL and uses a disposable user. Run against staging, not production.
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required');
const port=31000+Math.floor(Math.random()*2000),base='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['server.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',NODE_ENV:'test'},stdio:'ignore'});
let cookie='',email='leadpilot-e2e-'+randomUUID()+'@example.invalid',password='Test!'+randomUUID()+'ab';
async function call(path,method='GET',payload){
 const res=await fetch(base+path,{method,headers:{...(payload?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},body:payload?JSON.stringify(payload):undefined});
 if(path==='/api/login'&&res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];
 return {status:res.status,body:await res.json()};
}
try{
 let ready=false;
 for(let i=0;i<50;i++){if(child.exitCode!==null)throw new Error('Server exited before ready');try{const r=await fetch(base+'/health/database');if(r.ok){ready=true;break;}}catch{}await delay(200);}
 assert.ok(ready,'Database health must be ready');
 assert.equal((await call('/api/me')).status,401);
 assert.equal((await call('/api/signup','POST',{email,password})).status,201);
 assert.equal((await call('/api/login','POST',{email,password:'wrong-password'})).status,401);
 assert.equal((await call('/api/login','POST',{email,password})).status,200);
 assert.equal((await call('/api/me')).status,200);
 const messages=Array.from({length:25},(_,i)=>({name:'Prospect '+i,text:'Can you send pricing?'}));
 assert.equal((await call('/api/leads/rank','POST',{messages})).status,200);
 assert.equal((await call('/api/leads/rank','POST',{messages:[messages[0]]})).status,429);
 const leads=Array.from({length:10},(_,i)=>({name:'Prospect '+i,last_message:'Can we arrange a demo?'}));
 assert.equal((await call('/api/followups/draft','POST',{leads})).status,200);
 assert.equal((await call('/api/followups/draft','POST',{leads:[leads[0]]})).status,429);
 const usage=await call('/api/usage');
 assert.equal(usage.status,200);
 assert.equal((await call('/api/logout','POST')).status,200);
 assert.equal((await call('/api/me')).status,401);
 console.log('PASS signup, login, session, leads quota, drafts quota, logout');
}finally{child.kill('SIGTERM');}
