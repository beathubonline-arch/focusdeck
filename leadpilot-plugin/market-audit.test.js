import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {createPaystackCheckout,validatePaystackWebhook,kesAmount} from './paystack.js';
import {canConsume} from './pricing.js';

// Market readiness regression: no real payment API calls or customer data.
const env={PAYSTACK_SECRET_KEY:'sk_live_TEST_ONLY_NOT_A_REAL_KEY',LEADPILOT_PAYMENTS_ENABLED:'true',LEADPILOT_PRO_KES:'1200'};
let requests=0;
const fakeFetch=async(url,options)=>{
 requests++;
 assert.equal(url,'https://api.paystack.co/transaction/initialize');
 assert.equal(options.method,'POST');
 const body=JSON.parse(options.body);
 assert.equal(body.amount,120000);
 assert.equal(body.currency,'KES');
 assert.match(body.reference,/^lp_[a-f0-9]{32}$/);
 assert.equal(body.metadata.leadpilot_plan,'pro');
 return {ok:true,json:async()=>({status:true,data:{reference:body.reference,authorization_url:'https://checkout.paystack.com/test-only'}})};
};
for(let pass=1;pass<=2;pass++){
 const checkout=await createPaystackCheckout({email:'test@example.com',plan:'pro',accountId:'123e4567-e89b-12d3-a456-426614174000',callbackUrl:'https://example.com/callback',env,fetchImpl:fakeFetch});
 assert.match(checkout.authorization_url,/^https:\/\/checkout\.paystack\.com\//);
 assert.equal(kesAmount('pro',env),120000);
 const body=Buffer.from(JSON.stringify({event:'charge.success',data:{reference:'lp_test'}}));
 const sig=createHmac('sha256',env.PAYSTACK_SECRET_KEY).update(body).digest('hex');
 assert.equal(validatePaystackWebhook(body,sig,env.PAYSTACK_SECRET_KEY).event,'charge.success');
 assert.throws(()=>validatePaystackWebhook(body,'bad',env.PAYSTACK_SECRET_KEY));
 assert.equal(canConsume('free','none','monthlyLeads',24),true);
 assert.equal(canConsume('free','none','monthlyLeads',25),false);
 console.log('Market audit pass '+pass+': mocked checkout, webhook authentication, quota boundary');
}
assert.equal(requests,2);
