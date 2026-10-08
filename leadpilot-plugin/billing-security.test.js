import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyHmacSha256, verifiedSubscriptionEvent } from './billing-security.js';
const secret='unit-test-secret';
for(let pass=0;pass<2;pass++){
 const raw=Buffer.from(JSON.stringify({id:'evt_1',type:'subscription.updated'}));
 const sig=createHmac('sha256',secret).update(raw).digest('hex');
 assert.equal(verifyHmacSha256(raw,sig,secret),true);
 assert.equal(verifyHmacSha256(raw,'sha256='+sig,secret),true);
 assert.equal(verifyHmacSha256(Buffer.from('tampered'),sig,secret),false);
 assert.equal(verifyHmacSha256(raw,'garbage',secret),false);
 assert.throws(()=>verifiedSubscriptionEvent(raw,'bad',secret),/Invalid/);
 assert.equal(verifiedSubscriptionEvent(raw,sig,secret).id,'evt_1');
}
console.log('Webhook HMAC verification assertions passed twice');
