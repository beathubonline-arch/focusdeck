import assert from 'node:assert/strict';
import { PRICING, effectivePlan, canConsume } from './pricing.js';
assert.deepEqual(['free','pro','business','agency'].map(p=>PRICING[p].monthlyUsd), [0,9,29,79]);
for (let i=0;i<2;i++) {
  assert.equal(effectivePlan('agency','canceled'), 'free');
  assert.equal(effectivePlan('business','past_due'), 'free');
  assert.equal(effectivePlan('unknown','active'), 'free');
  assert.equal(effectivePlan('pro','active'), 'pro');
  assert.equal(canConsume('free','none','monthlyLeads',24),true);
  assert.equal(canConsume('free','none','monthlyLeads',25),false);
  assert.equal(canConsume('pro','active','monthlyLeads',499),true);
  assert.equal(canConsume('pro','active','monthlyLeads',500),false);
  assert.equal(canConsume('agency','canceled','monthlyLeads',25),false);
  assert.equal(canConsume('pro','active','invalid',0),false);
}
console.log('LeadPilot pricing entitlement unit assertions passed twice');
