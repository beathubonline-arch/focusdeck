import { randomUUID } from 'node:crypto';
import { PRICING } from './pricing.js';
import { verifyHmacSha256 } from './billing-security.js';

const PAYSTACK_API='https://api.paystack.co';
const PAID_PLANS=new Set(['pro','business','agency']);

export function getPaystackConfig(env=process.env) {
  return { secret:env.PAYSTACK_SECRET_KEY || '', enabled:env.LEADPILOT_PAYMENTS_ENABLED==='true',
    usdApproved:env.LEADPILOT_USD_APPROVED==='true' };
}

export async function createPaystackCheckout({email,plan,accountId,callbackUrl,env=process.env,fetchImpl=fetch}) {
  const config=getPaystackConfig(env);
  if(!config.enabled || !config.usdApproved || !config.secret.startsWith('sk_live_'))
    throw new Error('Live USD checkout not configured');
  if(!PAID_PLANS.has(plan)) throw new Error('Invalid paid plan');
  if(typeof email!=='string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('Valid email required');
  if(typeof accountId!=='string' || !/^[0-9a-f-]{36}$/i.test(accountId))
    throw new Error('Authenticated account required');
  const amount=PRICING[plan].monthlyUsd*100;
  const reference='lp_'+randomUUID().replaceAll('-','');
  const response=await fetchImpl(PAYSTACK_API+'/transaction/initialize',{
    method:'POST',headers:{Authorization:'Bearer '+config.secret,'Content-Type':'application/json'},
    body:JSON.stringify({email,amount,currency:'USD',reference,callback_url:callbackUrl,
      metadata:{leadpilot_account_id:accountId,leadpilot_plan:plan}})
  });
  if(!response.ok) throw new Error('Paystack initialization failed');
  const data=await response.json();
  if(data.status!==true || !data.data?.authorization_url || data.data.reference!==reference || !/^https:\/\/checkout\.paystack\.com\//.test(data.data.authorization_url))
    throw new Error('Paystack did not return valid checkout');
  return {authorization_url:data.data.authorization_url,reference:data.data.reference};
}

export function validatePaystackWebhook(rawBody, signature, secret) {
  if(!verifyHmacSha256(rawBody,signature,secret)) throw new Error('Invalid Paystack signature');
  const event=JSON.parse(rawBody.toString('utf8'));
  if(!event || typeof event.event!=='string' || !event.data || typeof event.data!=='object')
    throw new Error('Malformed Paystack event');
  return event;
}

// A charge.success event is not sufficient to grant a recurring subscription.
// Backend must verify transaction with Paystack, validate USD/amount/reference,
// resolve account using trusted server-side checkout record, and persist idempotently.
