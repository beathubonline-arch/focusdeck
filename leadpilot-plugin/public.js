export function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | LeadPilot AI</title><style>
  :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#102117;background:#f6fbf7}body{margin:0}.wrap{max-width:1060px;margin:0 auto;padding:48px 22px 80px}header{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:42px}.brand{font-weight:800;font-size:20px;color:#176b3a}.pill{font-size:13px;background:#e7f5ec;border:1px solid #c8e7d2;border-radius:999px;padding:7px 11px}h1{font-size:42px;line-height:1.05;margin:0 0 18px}h2{margin-top:34px}p,li{line-height:1.65;color:#33463a}a{color:#176b3a}.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin:25px 0}.price{font-size:36px;font-weight:850;color:#123f26}.muted{font-size:13px;color:#64776b}.cta{display:inline-block;background:#176b3a;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700}.card{background:#fff;border:1px solid #dfeae2;border-radius:20px;padding:24px;box-shadow:0 10px 30px rgba(23,107,58,.06)}nav{display:flex;gap:14px;flex-wrap:wrap;font-size:14px;margin-top:34px}
  </style></head><body><div class="wrap"><header><div class="brand">LeadPilot AI</div><div class="pill">Sales follow-up assistant</div></header>${body}<nav><a href="/">Home</a><a href="/pricing">Pricing</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a><a href="/health">Status</a></nav></div></body></html>`;
}

export const homePage = page('Home', `
  <h1>Turn conversations into clear sales follow-ups.</h1>
  <p>LeadPilot AI helps identify high-intent prospects, surface conversations waiting for a reply, draft grounded follow-ups, prepare booking options from verified availability, and summarize sales activity.</p>
  <div class="card"><strong>Privacy-first MVP</strong><p>LeadPilot only processes information explicitly provided to its tools. It does not silently pull your chat history, inbox, contacts, or calendar.</p></div>
  <h2>Current capabilities</h2><ul><li>Lead scoring from supplied message data</li><li>Reply triage</li><li>Follow-up drafting</li><li>Booking preparation using supplied availability</li><li>Daily sales briefings</li></ul>
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
