const automated=/^(?:no[._-]?reply|do[._-]?not[._-]?reply|mailer-daemon|postmaster|notifications?|newsletter|marketing|updates?)@/i;
const sales=/(?:quote|quotation|pricing|price|cost|budget|proposal|estimate|book a (?:call|demo|meeting)|schedule a (?:call|demo|meeting)|interested in (?:your|the)|can you (?:provide|send|share)|would like to (?:buy|purchase|hire)|how much|availability|need your services)/i;
const noise=/(?:unsubscribe|view in browser|manage preferences|password reset|verify your email|account activation|payment receipt|transaction alert|weekly digest|special offer|course categories)/i;
export function filterSalesInbox(messages){
 const excluded=[],candidates=[],review=[];
 for(const m of messages){
  const from=String(m.from||'');
  const address=(from.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}/)||[])[0]||'';
  const subject=String(m.subject||''),body=String(m.text||''),content=subject+' '+body;
  const base={...m,name:from.replace(/<[^>]+>/g,'').replace(/^["']|["']$/g,'').trim()||address,email:address};
  if(m.automated||automated.test(address)||noise.test(content)){excluded.push({...base,reason:'automated, marketing or transactional'});continue;}
  if(!address){review.push({...base,reason:'sender address missing'});continue;}
  if(!sales.test(content)){review.push({...base,reason:'sales intent unclear'});continue;}
  candidates.push(base);
 }
 return {candidates,excluded,review};
}
