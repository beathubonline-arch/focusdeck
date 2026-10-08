export function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | LeadPilot AI</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#effff5;background:#070e13;font-synthesis:none}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 80% 0%,#173b34 0%,transparent 36%),radial-gradient(ellipse at 0% 40%,#12283b 0%,transparent 43%),#070e13;color:#effff5}
.wrap{max-width:1200px;margin:auto;padding:30px 24px 90px}header{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:90px;padding:12px 0;border-bottom:1px solid #ffffff19}.brand{font-size:22px;font-weight:900;letter-spacing:-.7px;color:#eafff1}.brand:before{content:'✦';color:#55e5aa;margin-right:10px}.pill{color:#93e9c2;border:1px solid #55e5aa55;background:#55e5aa13;border-radius:99px;padding:9px 15px;font-size:12px;font-weight:700;letter-spacing:.3px}
h1{font-size:clamp(40px,6vw,78px);line-height:1.04;letter-spacing:-.065em;max-width:940px;margin:0 0 26px;font-weight:900}h2{font-size:clamp(22px,2.5vw,32px);letter-spacing:-.04em;margin:18px 0}p,li{line-height:1.75;color:#b5c8c1;font-size:16px}p{max-width:760px}a{color:#66edb1;text-underline-offset:4px}strong{color:#effff5}
.card{background:linear-gradient(145deg,#ffffff0e,#ffffff05);border:1px solid #ffffff22;border-radius:24px;padding:27px;box-shadow:0 20px 65px #00000025;backdrop-filter:blur(18px)}
.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:16px;margin:40px 0}.pricing .card{transition:transform .2s,border-color .2s}.pricing .card:hover{transform:translateY(-5px);border-color:#56e5a8}.pricing .card:nth-child(2){border-color:#55e5aa99;background:linear-gradient(155deg,#1a493c80,#ffffff08)}
.price{font-size:48px;line-height:1.2;font-weight:900;letter-spacing:-.06em;color:#75ffc0}.muted{font-size:13px;color:#9fb3ab}.cta{display:inline-flex;align-items:center;justify-content:center;padding:14px 22px;background:linear-gradient(120deg,#58e6a5,#a8f7b5);color:#09241b;border-radius:13px;font-weight:800;text-decoration:none;box-shadow:0 12px 32px #46dca52b}
nav{display:flex;gap:22px;flex-wrap:wrap;font-size:14px;margin-top:65px;padding-top:25px;border-top:1px solid #ffffff24}nav a{color:#b4d9c7;text-decoration:none}nav a:hover{color:#79ffc1}
ul{padding-left:23px}li{padding:4px 0}::selection{background:#55e5aa;color:#062018}
@media(max-width:600px){.wrap{padding:16px 18px 65px}header{margin-bottom:60px}.pill{font-size:10px;padding:7px 9px}.card{padding:20px}.pricing{grid-template-columns:1fr 1fr;gap:10px}.pricing .card{padding:16px}.pricing .card h2{font-size:20px}.price{font-size:34px}p,li{font-size:14px}}@media(max-width:380px){.pricing{grid-template-columns:1fr}}

/* Refraxion-inspired visual language: original LeadPilot execution */
body{background:radial-gradient(ellipse at 50% 82%,#273146 0%,transparent 44%),#070911;color:#f1f2f7}
.wrap{max-width:1320px;padding-top:22px}
header{margin-bottom:56px;border:0}
.brand{letter-spacing:.23em;text-transform:uppercase;font-size:20px}
.brand:before{content:'✧';color:#e3c7d7}
.card{border-color:#ffffff24;background:linear-gradient(145deg,#181b2dba,#0e1423db);box-shadow:0 24px 70px #0006}
.cta{background:linear-gradient(105deg,#e9dec5,#d9dfea);color:#161b26;border-radius:99px;box-shadow:0 12px 35px #d5c5d21a}
.pill{border-color:#ddc5d777;background:#e6c7d01a;color:#efdde8}
h1{letter-spacing:-.055em}
a{color:#d7c4ed}
nav a{color:#c4bed0}
.lp-hero{position:relative;overflow:hidden;text-align:center;border:1px solid #ffffff22;border-radius:38px;padding:76px 32px 90px;background:radial-gradient(ellipse at 50% 110%,#49516d88 0%,transparent 52%),radial-gradient(ellipse at 80% 18%,#232b45 0%,transparent 43%),linear-gradient(160deg,#0b0e18,#171c2b 72%,#0a0d16);box-shadow:0 45px 120px #0008}
.lp-hero:before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.33;background-image:radial-gradient(#c9c3dd 0.8px,transparent 0.9px);background-size:26px 28px;mask-image:linear-gradient(#000,transparent 88%)}
.lp-hero>*{position:relative}
.lp-hero h1{margin:16px auto 20px;max-width:850px;font-size:clamp(45px,6.8vw,86px);line-height:1.08}
.lp-gradient{background:linear-gradient(100deg,#e7e8f1,#d7b5d3 65%,#a9b5e2);-webkit-background-clip:text;background-clip:text;color:transparent}
.lp-hero .lp-sub{margin:0 auto 30px;max-width:670px;color:#c9cad9;font-size:clamp(16px,2vw,20px)}
.lp-actions{max-width:580px;margin:0 auto;display:grid;gap:13px}
.lp-actions a{width:100%;min-height:56px;display:flex;align-items:center;justify-content:center}
.lp-outline{border:1px solid #cbd0e355;border-radius:99px;text-decoration:none;color:#f0eefa;font-weight:700;background:#ffffff08}
.lp-trust{font-size:13px!important;color:#c2c6d3!important;margin:22px auto 30px!important}
.lp-monitor{max-width:910px;margin:45px auto 0;text-align:left;padding:12px;border:1px solid #ffffff35;border-radius:23px;background:#101521;box-shadow:0 35px 80px #000a,0 0 55px #b5a4dd18;transform:perspective(1300px) rotateX(4deg)}
.lp-top{display:flex;align-items:center;gap:8px;border-bottom:1px solid #ffffff18;padding:7px 8px 15px;color:#b8c2d6;font-size:12px}
.lp-dot{height:9px;width:9px;border-radius:50%;background:#d4a9b5}
.lp-dot:nth-child(2){background:#d4c7a3}.lp-dot:nth-child(3){background:#9ccbb9}
.lp-body{display:grid;grid-template-columns:170px 1fr;min-height:350px}
.lp-side{padding:20px 14px;border-right:1px solid #ffffff19;color:#9da9bc;font-size:12px}
.lp-side div{padding:10px 8px}.lp-side .active{color:#f3efff;border-radius:9px;background:#ffffff15}
.lp-main{padding:24px;min-width:0}.lp-main h2{margin:0 0 6px;font-size:23px}
.lp-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0}
.lp-kpi{padding:16px;border:1px solid #ffffff20;border-radius:13px;background:#ffffff07}.lp-kpi strong{display:block;font-size:30px;color:#e7d3ec}
.lp-kpi small{color:#aab1c2}
.lp-lead{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid #ffffff20;border-radius:12px;padding:14px;margin:9px 0;background:#ffffff06}
.lp-lead b{font-size:13px}.lp-lead small{display:block;color:#aeb9c8;margin-top:6px;font-size:11px}
.lp-signal{color:#b9f0d4;font-size:11px;white-space:nowrap}
.lp-note{font-size:12px;color:#b9becd;margin-top:12px}
.lp-section{padding:58px 0 20px}
@media(max-width:650px){header{margin-bottom:22px}.brand{font-size:16px;letter-spacing:.14em}.lp-hero{padding:54px 18px 44px;border-radius:29px}.lp-hero h1{font-size:clamp(40px,10vw,58px)}.lp-monitor{margin-top:28px;padding:7px;transform:none}.lp-body{grid-template-columns:1fr;min-height:0}.lp-side{display:none}.lp-main{padding:15px}.lp-kpis{gap:6px;margin:14px 0}.lp-kpi{padding:10px}.lp-kpi strong{font-size:22px}.lp-kpi small{font-size:9px}.lp-lead{padding:10px}.lp-lead b{font-size:11px}.lp-signal{font-size:9px}.lp-hero .lp-sub{font-size:16px}.lp-trust{font-size:11px!important}}
</style></head><body><div class="wrap"><header><div class="brand">LeadPilot AI</div><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><a href="/login">Log in</a><a class="cta" href="/signup">Start free</a></div></header>${body}<nav><a href="/">Home</a><a href="/pricing">Pricing</a><a href="/workspace-preview">Try workspace</a><a href="/signup">Sign up</a><a href="/login">Log in</a><a href="/account">My account</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a><a href="/health">Status</a></nav></div></body></html>`;
}

export const homePage = page('Home', `
<section class="lp-hero">
  <p class="pill" style="display:inline-block">INTRODUCING LEADPILOT AI · EARLY ACCESS</p>
  <h1>The sales opportunity <span class="lp-gradient">hiding in your inbox.</span></h1>
  <p class="lp-sub">One focused workspace to spot promising enquiries, prioritize the next reply, and turn inbox chaos into clear sales actions.</p>
  <div class="lp-actions"><a class="cta" href="/signup">Get started free →</a><a class="lp-outline" href="/workspace-preview">Explore the interactive demo →</a></div>
  <p class="lp-trust">✓ Human-reviewed replies &nbsp; · &nbsp; ✓ No automatic sending &nbsp; · &nbsp; ✓ Privacy-conscious workflow</p>
  <div class="lp-monitor" aria-label="Illustrative LeadPilot workspace preview">
    <div class="lp-top"><span class="lp-dot"></span><span class="lp-dot"></span><span class="lp-dot"></span><span style="margin-left:12px">LEADPILOT / WORKSPACE PREVIEW</span></div>
    <div class="lp-body"><div class="lp-side"><div class="active">◈ Overview</div><div>▤ Inbox signals</div><div>✧ Follow-ups</div><div>◷ Activity</div></div>
    <div class="lp-main"><h2>Sales overview</h2><div class="muted">Your next best actions, at a glance.</div>
      <div class="lp-kpis"><div class="lp-kpi"><strong>12</strong><small>Messages scanned</small></div><div class="lp-kpi"><strong>3</strong><small>Possible leads</small></div><div class="lp-kpi"><strong>2</strong><small>Need a reply</small></div></div>
      <div class="muted" style="margin-bottom:10px">PRIORITY INQUIRIES</div>
      <div class="lp-lead"><div><b>Website project enquiry</b><small>“Could you send a quote this week?”</small></div><span class="lp-signal">✦ HIGH INTENT</span></div>
      <div class="lp-lead"><div><b>Consultation request</b><small>“Are you available for a call?”</small></div><span class="lp-signal">✦ FOLLOW UP</span></div>
      <div class="lp-note">Illustrative sample data — not live customer analytics.</div>
    </div></div>
  </div>
</section>
<section class="lp-section"><p class="pill" style="display:inline-block">DISCOVER · PRIORITIZE · FOLLOW UP</p><h2>Less inbox noise. More meaningful conversations.</h2><div class="pricing"><div class="card"><p class="muted">01 / DISCOVER</p><h2>Find buying signals</h2><p>Spot messages asking for quotes, pricing, demos and services.</p></div><div class="card"><p class="muted">02 / PRIORITIZE</p><h2>Know who needs you</h2><p>Review high-intent enquiries and conversations awaiting replies.</p></div><div class="card"><p class="muted">03 / ACT</p><h2>Reply with confidence</h2><p>Prepare grounded follow-up drafts that you review before sending.</p></div></div></section>
`);

export const privacyPage = page('Privacy Policy', `
  <h1>Privacy Policy</h1><p><strong>Effective: October 6, 2026</strong></p>
  <h2>What LeadPilot processes</h2><p>LeadPilot processes only the sales messages, lead details, conversation snippets, and availability information that a user or authorized client explicitly sends to a LeadPilot tool.</p>
  <h2>What LeadPilot does not do</h2><p>The current public MVP does not independently access Gmail, Google Calendar, contacts, precise location, or a user's full ChatGPT conversation history. It does not sell personal data.</p>
  <h2>Purpose</h2><p>Submitted data is used only to perform the requested lead scoring, reply triage, drafting, booking preparation, or sales briefing operation.</p>
  <h2>Retention</h2><p>The current MVP does not intentionally persist submitted lead content in an application database. Infrastructure providers may retain operational request logs for limited periods for reliability and abuse prevention.</p>
  <h2>Security</h2><p>LeadPilot is served over HTTPS. We minimize requested data and keep externally visible tools read-only in the current MVP.</p>
  <h2>Contact</h2><p>For privacy questions or deletion requests, use the support route linked below. A dedicated support email will be added before public directory submission.</p>
`);

export const termsPage = page('Terms of Use', `
  <h1>Terms of Use</h1><p><strong>Effective: October 6, 2026</strong></p>
  <p>LeadPilot AI is a productivity tool for organizing sales follow-up work. Users remain responsible for reviewing generated drafts, confirming factual accuracy, respecting applicable privacy and marketing laws, and deciding whether to contact a prospect.</p>
  <h2>No automatic sending</h2><p>The current MVP does not send email, create calendar events, charge customers, or make commitments on the user's behalf.</p>
  <h2>No guarantees</h2><p>Lead scores are prioritization signals derived from supplied text, not guarantees that a prospect will purchase.</p>
  <h2>Acceptable use</h2><p>Do not use LeadPilot for spam, deceptive outreach, unlawful profiling, harassment, or processing data you are not authorized to use.</p>
`);

export const supportPage = page('Support', `
  <h1>LeadPilot Support</h1><p>LeadPilot is currently in MVP testing.</p>
  <div class="card"><strong>When reporting a problem</strong><p>Include the tool name, approximate time of the failure, and the error message. Do not include passwords, access tokens, payment credentials, or unnecessary personal information.</p></div>
  <h2>Service checks</h2><p>Use <a href="/health">/health</a> to confirm whether the LeadPilot service is online.</p>
`);

export const pricingPage = page('Pricing', `
 <h1>One assistant. More conversations closed.</h1>
 <p>Start with a free workspace. Upgrade when your pipeline grows. All prices in USD per month; payments are not yet enabled.</p>
 <section class="pricing">
 <div class="card"><h2>Free</h2><div class="price">$0</div><p>25 leads · 10 drafts · 1 seat</p><p class="muted">Explore the five sales tools with your own supplied data.</p></div>
 <div class="card"><h2>Pro</h2><div class="price">$9<span class="muted">/mo</span></div><p>500 leads · 200 drafts · 1 seat</p><p class="muted">For independent sellers building a consistent follow-up routine.</p></div>
 <div class="card"><h2>Business</h2><div class="price">$29<span class="muted">/mo</span></div><p>3,000 leads · 1,500 drafts · 5 seats</p><p class="muted">For small sales teams coordinating outreach.</p></div>
 <div class="card"><h2>Agency</h2><div class="price">$79<span class="muted">/mo</span></div><p>15,000 leads · 7,500 drafts · 20 seats</p><p class="muted">For agencies managing multiple sellers.</p></div>
 </section>
 <div class="card"><strong>Early access</strong><p>LeadPilot currently provides lead scoring, reply triage, draft follow-ups, booking preparation and sales summaries from information you supply. Paid checkout, accounts and automatic sending are not yet available.</p><a class="cta" href="/">Explore LeadPilot</a></div>
`);

export const dashboardPreviewPage = page('Interactive Workspace', `
 <p class="pill" style="display:inline-block">PRIVATE BROWSER WORKSPACE · NO ACCOUNT REQUIRED</p>
 <h1>Turn a lead into <span style="color:#75ffc0">your next action.</span></h1>
 <p>Try the LeadPilot scoring and follow-up workflow with your own message. Processing happens inside your browser; nothing is submitted to our server or saved.</p>
 <div class="card" style="max-width:820px">
  <label for="lead-name" style="display:block;margin-bottom:8px">Prospect name</label>
  <input id="lead-name" maxlength="80" placeholder="e.g. Alex" style="width:100%;background:#091a1d;color:#fff;border:1px solid #42665b;padding:15px;border-radius:12px;margin-bottom:20px">
  <label for="lead-message" style="display:block;margin-bottom:8px">Latest prospect message</label>
  <textarea id="lead-message" maxlength="4000" rows="5" placeholder="Paste a message asking about price, a demo or your service..." style="width:100%;background:#091a1d;color:#fff;border:1px solid #42665b;padding:15px;border-radius:12px;resize:vertical"></textarea>
  <button id="analyze" class="cta" style="border:0;cursor:pointer;margin-top:20px">Analyze lead</button>
  <div id="output" role="status" aria-live="polite" style="margin-top:20px"></div>
 </div>
 <p class="muted">This browser-only preview does not use customer accounts, track usage, send messages, or book meetings. Scoring is an estimate, not a guarantee of purchase.</p>
 <script>
 (() => {
 const input=document.getElementById('lead-message'),name=document.getElementById('lead-name'),output=document.getElementById('output');
 document.getElementById('analyze').addEventListener('click',()=>{
  const message=input.value.trim(),who=name.value.trim()||'there';
  output.replaceChildren();
  if(!message){output.textContent='Enter a prospect message to analyze.';return;}
  const signals=[[/price|cost|quote|quotation|how much/i,18,'Pricing interest'],[/buy|purchase|order|subscribe|sign up|start/i,24,'Purchase intent'],[/demo|call|meeting|meet|schedule|book/i,20,'Meeting intent'],[/today|tomorrow|urgent|asap|this week/i,12,'Urgency'],[/interested|sounds good|let.?s do|ready/i,18,'Positive intent']];
  let score=18;const reasons=[];
  for(const [rx,pts,why] of signals){if(rx.test(message)){score+=pts;reasons.push(why);}}
  score=Math.min(score,100);
  const intent=/price|pricing|cost|quote|quotation|how much/i.test(message)?'pricing':/demo|call|meeting|schedule|book/i.test(message)?'meeting':/interested|ready|buy|purchase|order/i.test(message)?'purchase':'general';
  const drafts={
   pricing:'thanks for your message. I can help with pricing. Could you share the option or scope you are considering?',
   meeting:'thanks for reaching out. If you share a time window that works for you, I can help coordinate the next step.',
   purchase:'great to hear you are interested. What would you like to confirm before we proceed?',
   general:'following up on your message. What would be the most useful next step for you?'
  };
  const title=document.createElement('h2');title.textContent='Lead score: '+score+'/100';output.append(title);
  const detail=document.createElement('p');detail.textContent='Signals: '+(reasons.join(', ')||'No strong buying signals found');output.append(detail);
  const label=document.createElement('strong');label.textContent='Suggested draft (review before sending)';output.append(label);
  const draft=document.createElement('p');draft.textContent='Hi '+who+', '+drafts[intent];output.append(draft);
  const copy=document.createElement('button');copy.className='cta';copy.style.border='0';copy.style.cursor='pointer';copy.textContent='Select draft';
  copy.addEventListener('click',()=>{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(draft);selection.removeAllRanges();selection.addRange(range);});
  output.append(copy);
 });
 })();
 </script>
`);
