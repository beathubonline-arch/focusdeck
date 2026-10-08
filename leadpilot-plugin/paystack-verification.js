import assert from 'node:assert/strict';
import { PRICING } from './pricing.js';

export const PAYSTACK_EVENT_TYPES=new Set(['charge.success','subscription.create','subscription.disable','subscription.not_renew','invoice.payment_failed','invoice.update']);

/** Verify transaction server-side; never grant a plan based on redirect or webhook metadata alone. */
export async function verifyPaystackTransaction(reference,{secret,fetchImpl=fetch}) {
 if(!/^lp_[a-f0-9]{32}$/.test(reference)) throw new Error('Invalid checkout reference');
 if(!secret?.startsWith('sk_')) throw new Error('Missing Paystack secret');
 const response=await fetchImpl('https://api.paystack.co/transaction/verify/'+encodeURIComponent(reference),
  {headers:{Authorization:'Bearer '+secret}});
 if(!response.ok) throw new Error('Paystack verification failed');
 const payload=await response.json();
 if(payload.status!==true || !payload.data) throw new Error('Unverified transaction');
 return payload.data;
}

/** Compare against trusted server-side checkout record, not client metadata. */
export function validateVerifiedCharge(transaction,checkout) {
 assert.ok(checkout?.accountId && checkout?.reference && checkout?.plan);
 const expected=PRICING[checkout.plan];
 if(!expected || checkout.plan==='free' || checkout.plan==='currency') return false;
 return transaction?.status==='success' &&
  transaction?.reference===checkout.reference &&
  transaction?.currency==='USD' &&
  transaction?.amount===expected.monthlyUsd*100 &&
  String(transaction?.customer?.email||'').toLowerCase()===checkout.email.toLowerCase();
}

/** Webhook replay safety requires database transaction inserting event key before applying changes. */
export function paystackEventKey(event) {
 const id=event?.data?.id;
 if(!PAYSTACK_EVENT_TYPES.has(event?.event) || (typeof id!=='number' && typeof id!=='string'))
   throw new Error('Unsupported or unidentifiable Paystack event');
 return event.event+':'+String(id);
}
