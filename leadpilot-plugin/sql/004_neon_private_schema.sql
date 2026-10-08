-- Run once in the dedicated LeadPilot Neon database, using its SQL editor.
-- Private application tables are deliberately NOT in public schema.
BEGIN;
CREATE SCHEMA IF NOT EXISTS leadpilot_private;
CREATE TABLE IF NOT EXISTS leadpilot_private.accounts(
 id uuid PRIMARY KEY,
 email text NOT NULL UNIQUE,
 password_hash text NOT NULL,
 email_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leadpilot_private.sessions(
 id uuid PRIMARY KEY,
 account_id uuid NOT NULL REFERENCES leadpilot_private.accounts(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leadpilot_sessions_account_idx ON leadpilot_private.sessions(account_id);
CREATE TABLE IF NOT EXISTS leadpilot_private.subscriptions(
 account_id uuid PRIMARY KEY REFERENCES leadpilot_private.accounts(id) ON DELETE CASCADE,
 provider text NOT NULL DEFAULT 'none',
 provider_customer_id text,
 provider_subscription_id text UNIQUE,
 plan text NOT NULL DEFAULT 'free' CHECK(plan IN ('free','pro','business','agency')),
 status text NOT NULL DEFAULT 'inactive',
 period_ends_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leadpilot_private.usage(
 account_id uuid NOT NULL REFERENCES leadpilot_private.accounts(id) ON DELETE CASCADE,
 period_start date NOT NULL,
 metric text NOT NULL CHECK(metric IN ('monthlyLeads','monthlyDrafts')),
 used bigint NOT NULL DEFAULT 0 CHECK(used >= 0),
 PRIMARY KEY(account_id,period_start,metric)
);
CREATE TABLE IF NOT EXISTS leadpilot_private.webhook_events(
 provider text NOT NULL,
 event_id text NOT NULL,
 processed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(provider,event_id)
);
REVOKE ALL ON SCHEMA leadpilot_private FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA leadpilot_private FROM PUBLIC;
COMMIT;
