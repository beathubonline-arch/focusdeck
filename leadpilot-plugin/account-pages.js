import {page} from './public.js';
const style='<style>form{display:grid;gap:14px;max-width:480px}input{background:#0d2020;border:1px solid #567469;color:#fff;padding:15px;border-radius:12px;font-size:16px}button{border:0;cursor:pointer}.notice{min-height:30px;color:#91e8c1}</style>';
function formPage(kind){
 const signup=kind==='signup';
 return page(signup?'Create account':'Sign in',`
 ${style}<div class="card" style="max-width:570px;margin:0 auto"><p class="pill" style="display:inline-block">${signup?'START FREE':'WELCOME BACK'}</p><h1 style="font-size:clamp(36px,5vw,54px)">${signup?'Create your account':'Sign in to LeadPilot'}</h1>
 <p>${signup?'Start with the free plan. No payment details required.':'Access your LeadPilot account.'}</p>
 <form id="account-form"><label>Email address<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>Password<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="12" required></label><button class="cta" type="submit">${signup?'Create free account':'Sign in'}</button></form>
 <p class="notice" role="status" id="notice"></p><p>${signup?'Already registered? <a href="/login">Sign in</a>':'New to LeadPilot? <a href="/signup">Create a free account</a>'}</p></div>
 <script>
 const form=document.getElementById('account-form'),notice=document.getElementById('notice');
 form.addEventListener('submit',async e=>{
 e.preventDefault();notice.textContent='Please wait…';
 try{
 const response=await fetch('${signup?'/api/signup':'/api/login'}',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(Object.fromEntries(new FormData(form)))});
 const data=await response.json();
 if(!response.ok){notice.textContent=data.error||'Please try again';return;}
 if(${signup}){notice.textContent='Account created. Redirecting to sign in…';location.assign('/login');}
 else{location.assign('/account');}
 }catch{notice.textContent='Unable to connect. Please retry.';}
 });
 </script>`);
}
export const signupPage=formPage('signup');
export const loginPage=formPage('login');
export const accountPage=page('Sales workspace',`
 <h1>Your sales workspace</h1>
 <p id="account-state">Checking your account…</p>
 <div class="card"><h2>Plans & upgrades</h2><p>You can upgrade at any time; you do not need to exhaust your free leads.</p><div id="upgrade-plans"><a href="/pricing" class="cta">Explore paid plans →</a></div><p id="upgrade-notice" aria-live="polite" class="muted">Secure checkout is being finalized. No payment will be charged from this page yet.</p></div>
 <div class="pricing">
 <section class="card"><h2>Rank sales leads</h2><p>Paste one prospect message per line. Each submitted message counts toward your monthly lead allowance.</p><textarea id="lead-input" rows="7" placeholder="Hi, can you send your pricing?\\nI'd like to book a demo tomorrow." style="width:100%;padding:14px;border-radius:12px;background:#0d2020;color:white;border:1px solid #567469"></textarea><p><button id="rank" class="cta" style="border:0;cursor:pointer">Rank leads</button></p></section>
 <section class="card"><h2>Draft follow-ups</h2><p>Enter one prospect message per line. Drafts are suggestions only; nothing is sent.</p><textarea id="draft-input" rows="7" placeholder="Could you send me a quote?" style="width:100%;padding:14px;border-radius:12px;background:#0d2020;color:white;border:1px solid #567469"></textarea><p><button id="draft" class="cta" style="border:0;cursor:pointer">Prepare drafts</button></p></section>
 </div>
 <div class="card"><h2>Results</h2><pre id="results" style="white-space:pre-wrap;overflow-wrap:anywhere;color:#bdecd6">Results will appear here.</pre></div>
 <p id="usage" aria-live="polite">Loading usage…</p><button id="logout" class="cta" style="display:none;border:0;cursor:pointer">Sign out</button>
 <script>
 const state=document.getElementById('account-state'),results=document.getElementById('results'),usage=document.getElementById('usage'),button=document.getElementById('logout');
 async function refreshUsage(){
 try{const r=await fetch('/api/usage',{credentials:'same-origin'});if(r.ok){const d=await r.json();const counts=Object.fromEntries(d.usage.map(x=>[x.metric,Number(x.used)]));const tier=d.subscription?.status==='active'||d.subscription?.status==='trialing'?d.subscription.plan:'free';const caps={free:[25,10],pro:[500,200],business:[3000,1500],agency:[15000,7500]};const limits=caps[tier]||caps.free;usage.textContent='Plan: '+tier+' · This month: '+(counts.monthlyLeads||0)+'/'+limits[0]+' leads · '+(counts.monthlyDrafts||0)+'/'+limits[1]+' drafts.';}}
 catch{usage.textContent='Usage currently unavailable';}
 }
 fetch('/api/me',{credentials:'same-origin'}).then(async r=>{
 if(!r.ok){location.assign('/login');return;}
 const data=await r.json();state.textContent='Signed in as '+data.email;button.style.display='inline-flex';refreshUsage();
 }).catch(()=>{state.textContent='Account service unavailable. Please retry later.'});
 async function run(kind){
 const ranking=kind==='rank',input=document.getElementById(ranking?'lead-input':'draft-input');
 const lines=input.value.split('\\n').map(x=>x.trim()).filter(Boolean);
 if(!lines.length||lines.length>100){results.textContent='Enter 1 to 100 messages.';return;}
 const payload=ranking?{messages:lines.map((text,i)=>({id:'lead-'+(i+1),name:'Prospect '+(i+1),text,direction:'inbound'}))}:{leads:lines.map((text,i)=>({id:'lead-'+(i+1),name:'Prospect '+(i+1),last_message:text}))};
 results.textContent='Processing…';
 try{
 const r=await fetch(ranking?'/api/leads/rank':'/api/followups/draft',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
 const d=await r.json();results.textContent=r.ok?JSON.stringify(ranking?d.leads:d.drafts,null,2):(d.error||'Request failed');if(r.status===429){document.getElementById('upgrade-notice').textContent='Free allowance reached. View paid plans above; checkout will be available once enabled.';document.getElementById('upgrade-plans').scrollIntoView({behavior:'smooth'});}refreshUsage();
 }catch{results.textContent='Service unavailable. Please retry.';}
 }
 document.getElementById('rank').addEventListener('click',()=>run('rank'));
 document.getElementById('draft').addEventListener('click',()=>run('draft'));
 button.addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST',credentials:'same-origin'});location.assign('/login');});
 </script>`);
