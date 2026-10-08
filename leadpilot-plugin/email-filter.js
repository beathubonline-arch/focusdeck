const automated=/\b(?:no[._-]?reply|do[._-]?not[._-]?reply|mailer-daemon|postmaster|notifications?|newsletter|marketing|updates?)@/i;
const sales=/\b(?:quote|quotation|pricing|price|cost|budget|proposal|estimate|book a (?:call|demo|meeting)|schedule a (?:call|demo|meeting)|interested in (?:your|the)|can you (?:provide|send|share)|would like to (?:buy|purchase|hire)|how much|availability|need your services)\b/i;
const noise=/\b(?:unsubscribe|view in browser|manage preferences|password reset|verify your email|account activation|payment receipt|transaction alert|weekly digest|special offer|course categories)\b/i;
export function filterSalesInbox(messages){
 const excluded=[],candidates=[];
 for(const m of messages){
  const from=String(m.from||''),email=(from.match(/<([^<>\s]+@[^<>\s]+)>/)||from.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)||[])[1]||'';
  const address=email||((from.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)||[])[0]||'');
  const subject=String(m.subject||''),body=String(m.text||''),content=subject+' '+body;
  const reason=automated.test(address)?'automated sender':noise.test(content)?'newsletter or transactional notification':!sales.test(content)?'no clear sales inquiry':null;
  if(reason){excluded.push({id:m.id,reason});continue;}
  candidates.push({...m,name:from.replace(/<[^>]+>/g,'').replace(/^["']|["']$/g,'').trim()||address,email:address});
 }
 return {candidates,excluded};
}
