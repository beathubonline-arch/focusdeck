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
</style></head><body><div class="wrap"><header><div class="brand">LeadPilot AI</div><div class="pill">Sales follow-up assistant</div></header>${body}<nav><a href="/">Home</a><a href="/pricing">Pricing</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a><a href="/health">Status</a></nav></div></body></html>`;
}

export const homePage = page('Home', `
  <p class="pill" style="display:inline-block;margin-bottom:22px">YOUR AI SALES EMPLOYEE · AVAILABLE 24/7</p><h1>Every lead matters. <span style="color:#6df5b6">Never miss the next sale.</span></h1>
  <p>LeadPilot AI helps identify high-intent prospects, surface conversations waiting for a reply, draft grounded follow-ups, prepare booking options from verified availability, and summarize sales activity.</p>
  <div class="card"><strong>Privacy-first MVP</strong><p>LeadPilot only processes information explicitly provided to its tools. It does not silently pull your chat history, inbox, contacts, or calendar.</p></div>
  <h2>Everything your sales pipeline needs</h2><ul><li>Lead scoring from supplied message data</li><li>Reply triage</li><li>Follow-up drafting</li><li>Booking preparation using supplied availability</li><li>Daily sales briefings</li></ul>
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

export const dashboardPreviewPage = page('Workspace Preview', `
 <p class="pill" style="display:inline-block">WORKSPACE PREVIEW · DEMO DATA ONLY</p>
 <h1>Your sales command center, <span style="color:#75ffc0">beautifully simple.</span></h1>
 <p>Preview the upcoming LeadPilot workspace. The numbers below are illustrative—not real leads, messages or revenue. Account login and persistent data are still being built.</p>
 <div class="pricing">
  <div class="card"><p class="muted">Leads to prioritize</p><div class="price">12</div><p>Illustrative sample</p></div>
  <div class="card"><p class="muted">Replies awaiting attention</p><div class="price">4</div><p>Illustrative sample</p></div>
  <div class="card"><p class="muted">Follow-up drafts</p><div class="price">8</div><p>Illustrative sample</p></div>
  <div class="card"><p class="muted">Booking options</p><div class="price">3</div><p>Illustrative sample</p></div>
 </div>
 <div class="card"><h2>Five tools. One focused workflow.</h2><p>Prioritize → Reply → Follow up → Prepare bookings → Review your sales briefing.</p><p class="muted">No customer information is loaded in this preview. The live MCP tools continue to operate only on explicitly supplied context.</p><a class="cta" href="/pricing">Explore plans</a></div>
`);
