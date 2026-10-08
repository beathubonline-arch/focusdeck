import { createHmac, timingSafeEqual } from 'node:crypto';

/** Verify a signed raw webhook body. Caller must also check provider event type and persist idempotency key. */
export function verifyHmacSha256(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || !secret || typeof signature !== 'string') return false;
  const provided = signature.replace(/^sha256=/i, '');
  if (!/^[0-9a-f]{64}$/i.test(provided)) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(provided, 'hex'));
}

/** Never accept plan, account ID or subscription state from unsigned client requests. */
export function verifiedSubscriptionEvent(rawBody, signature, secret) {
  if (!verifyHmacSha256(rawBody, signature, secret)) throw new Error('Invalid webhook signature');
  const event = JSON.parse(rawBody.toString('utf8'));
  if (!event || typeof event !== 'object' || typeof event.id !== 'string' || !event.id ||
      typeof event.type !== 'string' || !event.type) throw new Error('Malformed webhook event');
  return event;
}
