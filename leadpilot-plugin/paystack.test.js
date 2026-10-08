import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createPaystackCheckout,validatePaystackWebhook } from './paystack.js';
const accountId='123e4567-e89b-12d3-a456-426614174000';
for(let i=0;i<2;i++){
 await assert.rejects(createPaystackCheckout({email:'buyer@example.com',plan:'pro',accountId}),/not configured/);
 let called=false;
 const fetchImpl=async (url,options)=>{
   called=true;
   assert.equal(url,'https://api.paystack.co/transaction/initialize');
   const b=JSON.parse(options.body);
   assert.equal(b.currency,'USD');assert.equal(b.amount,900);
   assert.equal(b.metadata.leadpilot_plan,'pro');
   return {ok:true,json:async()=>({status:true,data:{authorization_url:'https://checkout.paystack.com/test',reference:b.reference}})};
 };
 const checkout=await createPaystackCheckout({email:'buyer@example.com',plan:'pro',accountId,
  env:{PAYSTACK_SECRET_KEY:'sk_live_test_fixture',LEADPILOT_PAYMENTS_ENABLED:'true',LEADPILOT_USD_APPROVED:'true'},
  fetchImpl});
 assert.equal(called,true);assert.ok(checkout.reference.startsWith('lp_'));
 const raw=Buffer.from(JSON.stringify({event:'charge.success',data:{reference:'lp_test'}}));
 const sig=createHmac('sha256','secret').update(raw).digest('hex');
 assert.equal(validatePaystackWebhook(raw,sig,'secret').event,'charge.success');
 assert.throws(()=>validatePaystackWebhook(raw,'bad','secret'),/Invalid/);
}
console.log('Paystack adapter assertions passed twice');
