const senderAddress=from=>(String(from||'').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}/)||[])[0]||'';
const sales=/(?:request (?:a |for )?(?:quote|proposal)|quotation|pricing|price list|how much|project estimate|budget for|book a (?:call|demo|meeting)|schedule a (?:call|demo|meeting)|interested in (?:your|the) (?:service|product)|would like to (?:buy|purchase|hire)|need your services|can you (?:build|design|develop|provide)|looking to (?:hire|buy)|ready to (?:order|purchase))/i;
const security=/(?:unusual (?:account |sign.in |login )?activity|unauthori[sz]ed (?:access|activity)|suspicious (?:activity|login)|account (?:compromised|suspended|restricted|locked)|security (?:alert|warning|update)|reset your password|credentials? (?:exposed|leaked)|api key(?:s)? (?:compromised|exposed)|fraudulent (?:transaction|activity))/i;
const business=/(?:activation request|business review|compliance review|verification (?:required|pending)|action required|response required|documents? (?:required|requested)|provide (?:additional |more )?(?:information|documents)|account (?:approval|verification)|deadline to (?:respond|submit)|review (?:your|our) business)/i;
const transactional=/(?:payment of [\d.,]+|payment (?:received|successful|confirmation)|transaction (?:details|receipt|alert)|your (?:order|purchase) confirmation|invoice (?:paid|receipt)|one.time.password|\botp\b|verification code|till guide|welcome to (?:lipa na )?m.pesa|your integration is live|account recovered successfully|new sign.in|settings were updated)/i;
const promotion=/(?:unsubscribe|view in browser|manage preferences|weekly digest|daily job alert|job alerts?|new jobs posted|friend suggestion|new notifications|special offer|course categories|newsletter|exclusive deal|limited.time offer|prime day|marketing update|webinar invitation)/i;
const automatedSender=/^(?:no[._-]?reply|do[._-]?not[._-]?reply|mailer-daemon|postmaster|notifications?|newsletter|marketing|updates?|receipts?)@/i;
const safeText=value=>String(value||'').replace(/(?:\b(?:otp|one.time.password|verification code|security code)\b[^\n]{0,55}?)(?:\b\d{4,8}\b)/gi,'[security code redacted]').replace(/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]+\b/g,'[API key redacted]');
export function classifyInbox(messages){
 const groups={leads:[],actionRequired:[],review:[],notifications:[],ignored:[]};
 for(const m of messages){
  const from=String(m.from||''),address=senderAddress(from),subject=String(m.subject||''),body=String(m.text||''),content=subject+' '+body;
  const base={...m,name:from.replace(/<[^>]+>/g,'').replace(/^["']|["']$/g,'').trim()||address,email:address,text:safeText(body)};
  // Prioritize actionable security and compliance even when messages have marketing footers.
  if(security.test(content)){groups.actionRequired.push({...base,reason:'Security warning — verify in the official account',priority:'high'});continue;}
  if(business.test(content)&&!transactional.test(subject)){groups.actionRequired.push({...base,reason:'Business or compliance response may be needed',priority:'high'});continue;}
  if(transactional.test(content)||/^(?:receipts?|billing|payments?)@/i.test(address)){groups.notifications.push({...base,reason:'Transaction or account notification'});continue;}
  if(m.automated||automatedSender.test(address)||promotion.test(content)){groups.ignored.push({...base,reason:'Marketing, newsletter or automated update'});continue;}
  if(!address){groups.review.push({...base,reason:'Sender address missing'});continue;}
  if(sales.test(content)){groups.leads.push({...base,reason:'Potential customer inquiry'});continue;}
  groups.review.push({...base,reason:'Intent unclear — review manually'});
 }
 return groups;
}
// Preserve existing caller compatibility while migrating to five-category inbox.
export function filterSalesInbox(messages){
 const groups=classifyInbox(messages);
 return {candidates:groups.leads,excluded:groups.ignored,review:groups.review,actionRequired:groups.actionRequired,notifications:groups.notifications};
}
