import assert from 'node:assert/strict';
import {classifyInbox,filterSalesInbox} from './email-filter.js';
const sample=[
 {id:'1',from:'Paystack <noreply@paystack.com>',subject:'Your integration is live',text:'Start accepting payments',automated:false},
 {id:'2',from:'Alice <alice@example.com>',subject:'Website quote',text:'Could you send a quote for my website?'},
 {id:'3',from:'Bob <bob@example.com>',subject:'Hello',text:'We spoke last week about the project.'},
 {id:'4',from:'News <news@example.com>',subject:'Weekly digest',text:'unsubscribe',automated:true},
 {id:'5',from:'Paystack Support <support@paystack.com>',subject:'Action Required: Security update',text:'We noticed unusual activity on your Paystack account.'},
 {id:'6',from:'Paystack Reviews <reviews@paystack.com>',subject:'Re: Activation Request for One Bob',text:'We would love to learn more about your business during our business review.'},
 {id:'7',from:'Paystack Receipts <receipts@paystack.com>',subject:'Payment of 5.00 from a customer',text:'Transaction details and receipt'},
 {id:'8',from:'M-PESA Business <business@safaricom.co.ke>',subject:'M-PESA Business Till Guide',text:'Thank you for choosing Lipa Na M-PESA'},
 {id:'9',from:'Paystack <noreply@paystack.com>',subject:'Your Paystack One Time Password',text:'OTP: 922586'}
];
const r=classifyInbox(sample);
assert.deepEqual(r.leads.map(x=>x.id),['2']);
assert.deepEqual(r.actionRequired.map(x=>x.id),['5','6']);
assert.deepEqual(r.review.map(x=>x.id),['3']);
assert.deepEqual(r.notifications.map(x=>x.id),['1','7','8','9']);
assert.deepEqual(r.ignored.map(x=>x.id),['4']);
assert.ok(!JSON.stringify(r).includes('922586'),'OTP must not appear in classified output');
assert.equal(filterSalesInbox(sample).candidates.length,1);
console.log('Five-category Gmail classification tests passed');
