-- Run in Neon production and staging before enabling Paystack checkout.
CREATE TABLE IF NOT EXISTS leadpilot_private.checkout_intents(
 reference text PRIMARY KEY,
 account_id uuid NOT NULL REFERENCES leadpilot_private.accounts(id) ON DELETE CASCADE,
 plan text NOT NULL CHECK(plan IN ('pro','business','agency')),
 amount integer NOT NULL CHECK(amount>0),
 currency text NOT NULL CHECK(currency='USD'),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid')),
 created_at timestamptz NOT NULL DEFAULT now(),
 paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS leadpilot_checkout_account_idx ON leadpilot_private.checkout_intents(account_id);
REVOKE ALL ON leadpilot_private.checkout_intents FROM PUBLIC;
