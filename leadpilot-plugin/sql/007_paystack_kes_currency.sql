-- Run on the LeadPilot production Neon database before enabling KES checkout.
ALTER TABLE leadpilot_private.checkout_intents DROP CONSTRAINT IF EXISTS checkout_intents_currency_check;
ALTER TABLE leadpilot_private.checkout_intents ADD CONSTRAINT checkout_intents_currency_check CHECK(currency='KES');
