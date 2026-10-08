import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PRICING, effectivePlan, canConsume } from './pricing.js';
import { createHmac } from 'node:crypto';
import { hashPassword,verifyPassword,issueSession,verifySession } from './auth.js';
import { verifyHmacSha256, verifiedSubscriptionEvent } from './billing-security.js';
import {findLeads,needsReply,draftFollowups,prepareBooking,salesBriefing} from './core.js';
import {homePage,privacyPage,termsPage,supportPage,pricingPage,dashboardPreviewPage} from './public.js';

const now=Date.parse('2026-10-06T02:00:00Z');
const messages=[
 {id:'m1',name:'Jane',email:'jane@example.com',text:'I am interested. How much does it cost and can we book a demo this week?',date:'2026-10-06T01:00:00Z',direction:'inbound'},
 {id:'m2',name:'Newsletter',text:'October newsletter',date:'2026-10-06T01:00:00Z',direction:'inbound'}
];
const conversations=[{id:'c1',name:'Jane',email:'jane@example.com',messages:[{text:'Can we meet tomorrow?',date:'2026-10-04T00:00:00Z',direction:'inbound'}]},{id:'c2',name:'Bob',messages:[{text:'Interested',date:'2026-10-04T00:00:00Z',direction:'inbound'},{text:'Sure, here is info',date:'2026-10-04T02:00:00Z',direction:'outbound'}]}];

function validateSubmissionPackage(){
 const manifest=JSON.parse(fs.readFileSync(new URL('./plugin.json',import.meta.url),'utf8'));
 const i=manifest.extensions?.['com.openai']?.interface;
 assert.equal(manifest.version,'0.6.0');
 assert.ok(i);
 for(const k of ['displayName','shortDescription','longDescription','developerName','category','websiteURL','supportURL','privacyPolicyURL','termsOfServiceURL','logo','composerIcon']) assert.ok(i[k],`missing ${k}`);
 assert.ok(i.shortDescription.length<=30);
 assert.ok(i.displayName.length<=30);
 assert.ok(i.longDescription.length<=4000);
 for(const u of [i.websiteURL,i.supportURL,i.privacyPolicyURL,i.termsOfServiceURL]) assert.ok(u.startsWith('https://'));
 for(const p of [i.logo,i.composerIcon]){
   assert.ok(p.startsWith('./assets/'));
   const svg=fs.readFileSync(new URL(p,import.meta.url),'utf8');
   assert.match(svg,/viewBox="0 0 (128|512) (128|512)"/);
 }
 const review=JSON.parse(fs.readFileSync(new URL('./review-tests.json',import.meta.url),'utf8'));
 assert.equal(manifest.extensions?.['com.openai']?.review?.test_cases?.positive?.length,5);
 assert.equal(manifest.extensions?.['com.openai']?.review?.test_cases?.negative?.length,3);
}

for(let pass=1;pass<=2;pass++){
 const leads=findLeads({messages});assert.equal(leads.length,1);assert.equal(leads[0].name,'Jane');assert.ok(leads[0].score>=60);
 const nr=needsReply({conversations},now);assert.equal(nr.length,1);assert.equal(nr[0].name,'Jane');
 const drafts=draftFollowups({leads:nr});assert.equal(drafts.length,1);assert.ok(drafts[0].draft.includes('Jane'));
 assert.equal(prepareBooking({lead:nr[0],availability:[]}).status,'needs_availability');
 assert.equal(prepareBooking({lead:nr[0],availability:[{start:'2026-10-07T09:00:00+03:00'}]}).status,'ready_to_offer');
 const brief=salesBriefing({leads:messages,conversations},now);assert.equal(brief.lead_count,1);assert.equal(brief.awaiting_reply_count,1);
 for(const p of [homePage,privacyPage,termsPage,supportPage,pricingPage,dashboardPreviewPage]){assert.ok(p.includes('<!doctype html>'));assert.ok(p.includes('LeadPilot'));}
 const body=Buffer.from(JSON.stringify({id:'evt_test',type:'subscription.updated'}));
 const sig=createHmac('sha256','test-only-secret').update(body).digest('hex');
 assert.equal(verifyHmacSha256(body,sig,'test-only-secret'),true);
 assert.equal(verifyHmacSha256(Buffer.from('tampered'),sig,'test-only-secret'),false);
 assert.equal(verifiedSubscriptionEvent(body,sig,'test-only-secret').id,'evt_test');
 assert.ok(dashboardPreviewPage.includes('PRIVATE BROWSER WORKSPACE'));
 assert.ok(pricingPage.includes('$79'));
 assert.ok(pricingPage.includes('payments are not yet enabled'));
 const pw=hashPassword('correct horse battery staple');
 assert.equal(verifyPassword('correct horse battery staple',pw),true);
 assert.equal(verifyPassword('wrong',pw),false);
 const sid='123e4567-e89b-12d3-a456-426614174000';
 const token=issueSession(sid,'12345678901234567890123456789012',now);
 assert.equal(verifySession(token,'12345678901234567890123456789012',now),sid);
 assert.equal(verifySession(token,'12345678901234567890123456789012',now+86400001),null);
 validateSubmissionPackage();
 assert.deepEqual(['free','pro','business','agency'].map(p=>PRICING[p].monthlyUsd),[0,9,29,79]);
 assert.equal(effectivePlan('agency','canceled'),'free');
 assert.equal(effectivePlan('pro','active'),'pro');
 assert.equal(canConsume('free','none','monthlyLeads',25),false);
 assert.equal(canConsume('pro','active','monthlyLeads',499),true);
 console.log(`PASS ${pass}: five tools + policy pages + submission package`);
}
