import assert from 'node:assert/strict';
import {findLeads,needsReply,draftFollowups,prepareBooking,salesBriefing} from './core.js';
import {homePage,privacyPage,termsPage,supportPage} from './public.js';

const now=Date.parse('2026-10-06T02:00:00Z');
const messages=[
 {id:'m1',name:'Jane',email:'jane@example.com',text:'I am interested. How much does it cost and can we book a demo this week?',date:'2026-10-06T01:00:00Z',direction:'inbound'},
 {id:'m2',name:'Newsletter',text:'October newsletter',date:'2026-10-06T01:00:00Z',direction:'inbound'}
];
const conversations=[{id:'c1',name:'Jane',email:'jane@example.com',messages:[{text:'Can we meet tomorrow?',date:'2026-10-04T00:00:00Z',direction:'inbound'}]},{id:'c2',name:'Bob',messages:[{text:'Interested',date:'2026-10-04T00:00:00Z',direction:'inbound'},{text:'Sure, here is info',date:'2026-10-04T02:00:00Z',direction:'outbound'}]}];

for(let pass=1;pass<=2;pass++){
 const leads=findLeads({messages});assert.equal(leads.length,1);assert.equal(leads[0].name,'Jane');assert.ok(leads[0].score>=60);
 const nr=needsReply({conversations},now);assert.equal(nr.length,1);assert.equal(nr[0].name,'Jane');
 const drafts=draftFollowups({leads:nr});assert.equal(drafts.length,1);assert.ok(drafts[0].draft.includes('Jane'));
 assert.equal(prepareBooking({lead:nr[0],availability:[]}).status,'needs_availability');
 assert.equal(prepareBooking({lead:nr[0],availability:[{start:'2026-10-07T09:00:00+03:00'}]}).status,'ready_to_offer');
 const brief=salesBriefing({leads:messages,conversations},now);assert.equal(brief.lead_count,1);assert.equal(brief.awaiting_reply_count,1);
 for(const p of [homePage,privacyPage,termsPage,supportPage]){assert.ok(p.includes('<!doctype html>'));assert.ok(p.includes('LeadPilot'));}
 console.log(`PASS ${pass}: five tools + public policy pages`);
}
