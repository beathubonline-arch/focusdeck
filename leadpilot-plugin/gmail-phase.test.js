import assert from 'node:assert/strict';
import {filterSalesInbox} from './email-filter.js';
const sample=[
 {id:'1',from:'Paystack <noreply@paystack.com>',subject:'Your integration is live',text:'Start accepting payments',automated:false},
 {id:'2',from:'Alice <alice@example.com>',subject:'Website quote',text:'Could you send a quote for my website?'},
 {id:'3',from:'Bob <bob@example.com>',subject:'Hello',text:'We spoke last week about the project.'},
 {id:'4',from:'News <news@example.com>',subject:'Weekly digest',text:'unsubscribe',automated:true}
];
const r=filterSalesInbox(sample);
assert.deepEqual(r.candidates.map(x=>x.id),['2']);
assert.deepEqual(r.review.map(x=>x.id),['3']);
assert.deepEqual(r.excluded.map(x=>x.id),['1','4']);
assert.equal(r.candidates[0].email,'alice@example.com');
console.log('Gmail classification tests passed');
