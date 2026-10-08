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
export const accountPage=page('Your account',`
 <h1>Your LeadPilot account</h1><div class="card"><p id="account-state">Checking your session…</p><button id="logout" class="cta" style="display:none;border:0;cursor:pointer">Sign out</button></div>
 <script>
 const state=document.getElementById('account-state'),button=document.getElementById('logout');
 fetch('/api/me',{credentials:'same-origin'}).then(async r=>{
 if(!r.ok){location.assign('/login');return;}
 const data=await r.json();state.textContent='Signed in as '+data.email+'. Your account is ready. Sales workspace access is coming next.';button.style.display='inline-flex';
 }).catch(()=>{state.textContent='Account service unavailable. Please retry later.'});
 button.addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST',credentials:'same-origin'});location.assign('/login');});
 </script>`);
