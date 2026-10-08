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
</style></head><body><div class="wrap"><header><div class="brand">LeadPilot AI</div><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><a href="/login">Log in</a><a class="cta" href="/signup">Start free</a></div></header>${body}<nav><a href="/">Home</a><a href="/pricing">Pricing</a><a href="/workspace-preview">Try workspace</a><a href="/signup">Sign up</a><a href="/login">Log in</a><a href="/account">My account</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a><a href="/health">Status</a></nav></div></body></html>`;
}

export const homePage = page('Home', `
  <p class="pill" style="display:inline-block;margin-bottom:22px">YOUR AI SALES EMPLOYEE · AVAILABLE 24/7</p><h1>Every lead matters. <span style="color:#6df5b6">Never miss the next sale.</span></h1>
  <p>LeadPilot AI helps identify high-intent prospects, surface conversations waiting for a reply, draft grounded follow-ups, prepare booking options from verified availability, and summarize sales activity.</p>
  <p><a class="cta" href="/workspace-preview">Try the interactive demo →</a> <a href="/pricing" style="margin-left:16px">Explore plans</a></p><div class="card"><strong>Privacy-first MVP</strong><p>LeadPilot only processes information explicitly provided to its tools. It does not silently pull your chat history, inbox, contacts, or calendar.</p></div>
  <div class="pricing"><div class="card"><p class="muted">01 / DISCOVER</p><h2>Spot high-intent buyers in supplied messages</h2><p>Score messages for real buying signals and urgency.</p></div><div class="card"><p class="muted">02 / ACT</p><h2>Know exactly who to reply to</h2><p>Identify waiting conversations and prepare grounded drafts.</p></div><div class="card"><p class="muted">03 / GROW</p><h2>Make every follow-up count</h2><p>Review a focused briefing and prepare meeting options.</p></div></div><h2>Everything your sales pipeline needs</h2><ul><li>Lead scoring from supplied message data</li><li>Reply triage</li><li>Follow-up drafting</li><li>Booking preparation using supplied availability</li><li>Daily sales briefings</li></ul>
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
