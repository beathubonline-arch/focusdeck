# LeadPilot AI global launch

Proposed monthly USD tiers: Free $0, Pro $9, Business $29, Agency $79. Prices are not activated in checkout.

## Current state
This branch adds an isolated pricing policy and repeatable tests, but **does not** enable billing, persist usage, or gate MCP calls. Do not claim payment functionality or paid entitlement enforcement.

## Before public paid launch
1. Confirm billing provider and account supports international USD payments.
2. Implement customer authentication and account-to-tenant mapping.
3. Create provider-side prices and hosted checkout; never trust client-provided plan or status.
4. Verify webhook signatures, replay protection and idempotency; persist subscription state in a durable database.
5. Enforce limits atomically per authenticated tenant on all five MCP tools, with appropriate privacy safeguards.
6. Implement billing portal, refunds/cancellation policies, invoices, support, privacy and terms.
7. Verify plugin listing policy and required account-linking flows.
8. Test sign-up, paid upgrade, cancellation, expired subscription, webhook replay, limit exhaustion and free access twice.
9. Deploy, smoke-test public endpoints and monitor logs before enabling checkout.
