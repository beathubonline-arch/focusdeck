const BUYING = [
  [/(price|cost|quote|quotation|how much)/i, 18, 'pricing interest'],
  [/(buy|purchase|order|subscribe|sign up|start)/i, 24, 'purchase intent'],
  [/(demo|call|meeting|meet|schedule|book)/i, 20, 'meeting intent'],
  [/(today|tomorrow|urgent|asap|this week)/i, 12, 'urgency'],
  [/(interested|sounds good|let.?s do|ready)/i, 18, 'positive intent']
];

function safeText(v='') { return String(v ?? '').trim(); }
function ts(v) { const n = Date.parse(v || ''); return Number.isFinite(n) ? n : 0; }

export function leadScore(message, now = Date.now()) {
  const text = safeText(message.text);
  let score = 10;
  const reasons = [];
  for (const [rx, pts, why] of BUYING) if (rx.test(text)) { score += pts; reasons.push(why); }
  const ageH = message.date ? (now - ts(message.date)) / 36e5 : 999;
  if (ageH <= 24) { score += 8; reasons.push('recent'); }
  else if (ageH <= 72) { score += 4; reasons.push('fairly recent'); }
  if (safeText(message.direction).toLowerCase() === 'inbound') { score += 8; reasons.push('prospect initiated'); }
  return { score: Math.min(score, 100), reasons: [...new Set(reasons)] };
}

export function findLeads({messages=[]}) {
  return messages.map((m, i) => ({ id: m.id ?? `lead-${i+1}`, name: m.name ?? m.from ?? 'Unknown', email: m.email ?? m.from_email ?? null, subject: m.subject ?? '', text: safeText(m.text), date: m.date ?? null, ...leadScore(m) }))
    .filter(x => x.score >= 28)
    .sort((a,b) => b.score-a.score);
}

export function needsReply({conversations=[]}, now=Date.now()) {
  const rows = [];
  for (const c of conversations) {
    const msgs = [...(c.messages || [])].sort((a,b)=>ts(a.date)-ts(b.date));
    if (!msgs.length) continue;
    const last = msgs[msgs.length-1];
    if (safeText(last.direction).toLowerCase() !== 'inbound') continue;
    const ageH = last.date ? Math.max(0,(now-ts(last.date))/36e5) : null;
    rows.push({id:c.id ?? null,name:c.name ?? last.name ?? last.from ?? 'Unknown',email:c.email ?? last.email ?? null,last_message:safeText(last.text),last_message_at:last.date ?? null,hours_waiting:ageH===null?null:Math.round(ageH*10)/10,priority: ageH===null?'normal':ageH>=48?'high':ageH>=12?'medium':'normal'});
  }
  const rank={high:3,medium:2,normal:1};
  return rows.sort((a,b)=>rank[b.priority]-rank[a.priority] || (b.hours_waiting??0)-(a.hours_waiting??0));
}

export function draftFollowups({leads=[]}) {
  return leads.map((l,i)=>{
    const name = safeText(l.name) || 'there';
    const context = safeText(l.last_message || l.text || l.context);
    const intent = /price|cost|quote|quotation|how much/i.test(context) ? 'pricing' : /demo|call|meeting|schedule|book/i.test(context) ? 'meeting' : /interested|ready|buy|purchase|order/i.test(context) ? 'purchase' : 'general';
    let body;
    if (intent==='pricing') body=`Hi ${name}, thanks for your message. I can help with the pricing. Could you share the option or scope you’re considering so I can give you the most relevant next step?`;
    else if (intent==='meeting') body=`Hi ${name}, thanks for reaching out. I’d be happy to continue this conversation. If you share a time window that works for you, I can help coordinate the next step.`;
    else if (intent==='purchase') body=`Hi ${name}, great to hear you’re interested. I can help you move forward. What would you like to confirm before we proceed?`;
    else body=`Hi ${name}, following up on your message. I’m happy to help—what would be the most useful next step for you?`;
    return {id:l.id ?? `draft-${i+1}`,name,email:l.email ?? null,intent,draft:body};
  });
}

export function prepareBooking({lead={}, availability=[]}) {
  const slots = availability.filter(x=>x?.start).slice(0,5).map(x=>({start:x.start,end:x.end??null,label:x.label??null}));
  if (!slots.length) return {status:'needs_availability',lead:{name:lead.name??'Unknown',email:lead.email??null},message:'No verified availability was provided. Fetch or supply real calendar availability before proposing a time.'};
  return {status:'ready_to_offer',lead:{name:lead.name??'Unknown',email:lead.email??null},slots,message:'Offer only these verified slots. Do not create a calendar event until the user/prospect selects a slot and the normal confirmation flow permits the write.'};
}

export function salesBriefing({leads=[], conversations=[]}, now=Date.now()) {
  const ranked = findLeads({messages:leads});
  const replies = needsReply({conversations}, now);
  return {
    generated_at:new Date(now).toISOString(),
    lead_count:ranked.length,
    high_intent_count:ranked.filter(x=>x.score>=60).length,
    awaiting_reply_count:replies.length,
    overdue_reply_count:replies.filter(x=>x.priority==='high').length,
    top_leads:ranked.slice(0,5),
    reply_queue:replies.slice(0,5),
    next_actions:[
      ...(replies.length?[`Reply to ${replies[0].name} first${replies[0].hours_waiting!=null?` (${replies[0].hours_waiting}h waiting)`:''}.`]:[]),
      ...(ranked.length?[`Review ${ranked[0].name}, currently the highest-scoring lead (${ranked[0].score}/100).`]:[]),
      ...(!ranked.length && !replies.length?['No actionable sales activity was supplied for this briefing.']:[])
    ]
  };
}
