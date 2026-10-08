-- Authentication storage extension; apply after 001_billing_foundation.sql.
ALTER TABLE leadpilot_accounts ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE leadpilot_accounts ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
CREATE TABLE IF NOT EXISTS leadpilot_sessions (
 id uuid PRIMARY KEY,
 account_id uuid NOT NULL REFERENCES leadpilot_accounts(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS leadpilot_sessions_account_idx ON leadpilot_sessions(account_id);
CREATE TABLE IF NOT EXISTS leadpilot_checkout_intents (
 reference text PRIMARY KEY,
 account_id uuid NOT NULL REFERENCES leadpilot_accounts(id),
 email text NOT NULL,
 plan text NOT NULL CHECK(plan IN ('pro','business','agency')),
 amount_minor integer NOT NULL CHECK(amount_minor>0),
 currency text NOT NULL DEFAULT 'USD' CHECK(currency='USD'),
 created_at timestamptz NOT NULL DEFAULT now(),
 verified_at timestamptz,
 CONSTRAINT leadpilot_checkout_amount_matches_plan CHECK(
 (plan='pro' AND amount_minor=900) OR
 (plan='business' AND amount_minor=2900) OR
 (plan='agency' AND amount_minor=7900))
);
-- The application must check email verification and use server-side sessions.
-- Never return password_hash, token_hash, or billing secrets to a client.
