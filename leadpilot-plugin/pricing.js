export const PRICING = Object.freeze({
  currency: 'USD',
  free: Object.freeze({ monthlyUsd: 0, monthlyLeads: 25, monthlyDrafts: 10, seats: 1 }),
  pro: Object.freeze({ monthlyUsd: 9, monthlyLeads: 500, monthlyDrafts: 200, seats: 1 }),
  business: Object.freeze({ monthlyUsd: 29, monthlyLeads: 3000, monthlyDrafts: 1500, seats: 5 }),
  agency: Object.freeze({ monthlyUsd: 79, monthlyLeads: 15000, monthlyDrafts: 7500, seats: 20 })
});
export function effectivePlan(plan, status) {
  if (!Object.hasOwn(PRICING, plan) || plan === 'currency') return 'free';
  return plan === 'free' || ['active', 'trialing'].includes(status) ? plan : 'free';
}
export function canConsume(plan, status, metric, used) {
  const tier = PRICING[effectivePlan(plan, status)];
  return Number.isSafeInteger(used) && used >= 0 &&
    ['monthlyLeads', 'monthlyDrafts', 'seats'].includes(metric) &&
    used < tier[metric];
}
