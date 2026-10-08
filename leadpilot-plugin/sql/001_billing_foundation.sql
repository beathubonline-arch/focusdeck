-- PostgreSQL schema; not applied to production.
CREATE TABLE IF NOT EXISTS leadpilot_accounts (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leadpilot_subscriptions (
  account_id uuid PRIMARY KEY REFERENCES leadpilot_accounts(id),
  provider text NOT NULL,
  provider_customer_id text NOT NULL,
  provider_subscription_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('free','pro','business','agency')),
  status text NOT NULL,
  period_ends_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leadpilot_webhook_events (
  provider text NOT NULL,
  event_id text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(provider,event_id)
);
CREATE TABLE IF NOT EXISTS leadpilot_usage (
  account_id uuid NOT NULL REFERENCES leadpilot_accounts(id),
  period_start date NOT NULL,
  metric text NOT NULL CHECK(metric IN ('monthlyLeads','monthlyDrafts')),
  used bigint NOT NULL DEFAULT 0 CHECK(used >= 0),
  PRIMARY KEY(account_id,period_start,metric)
);
-- Implement atomic usage increments within a transaction after authenticated tenant resolution.
-- The webhook_events unique key must be inserted transactionally with subscription changes.
