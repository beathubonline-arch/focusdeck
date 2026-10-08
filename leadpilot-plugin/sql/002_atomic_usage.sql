-- PostgreSQL atomic per-account quota consumption.
-- Apply only after 001_billing_foundation.sql, and only with trusted server-side DB credentials.
-- The account ID must come from authenticated server session, NEVER from request JSON.
CREATE OR REPLACE FUNCTION leadpilot_consume_usage(
  p_account_id uuid,
  p_metric text,
  p_period_start date DEFAULT date_trunc('month', now() AT TIME ZONE 'UTC')::date
) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE
  v_plan text;
  v_status text;
  v_limit bigint;
  v_used bigint;
BEGIN
  IF p_metric NOT IN ('monthlyLeads','monthlyDrafts') OR p_account_id IS NULL THEN
    RETURN false;
  END IF;
  -- Serialize account subscription changes and quota consumption.
  PERFORM 1 FROM leadpilot_accounts WHERE id=p_account_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT plan,status INTO v_plan,v_status FROM leadpilot_subscriptions WHERE account_id=p_account_id;
  IF v_plan NOT IN ('pro','business','agency') OR v_status NOT IN ('active','trialing') THEN
    v_plan:='free';
  END IF;
  v_limit:=CASE
    WHEN p_metric='monthlyLeads' THEN CASE v_plan
      WHEN 'pro' THEN 500 WHEN 'business' THEN 3000 WHEN 'agency' THEN 15000 ELSE 25 END
    ELSE CASE v_plan
      WHEN 'pro' THEN 200 WHEN 'business' THEN 1500 WHEN 'agency' THEN 7500 ELSE 10 END
  END;
  INSERT INTO leadpilot_usage(account_id,period_start,metric,used)
    VALUES(p_account_id,p_period_start,p_metric,1)
  ON CONFLICT(account_id,period_start,metric)
    DO UPDATE SET used=leadpilot_usage.used+1
    WHERE leadpilot_usage.used < v_limit
  RETURNING used INTO v_used;
  RETURN v_used IS NOT NULL;
END $$;

-- Revoke default PUBLIC execution; grant only to dedicated trusted backend role after provisioning.
REVOKE ALL ON FUNCTION leadpilot_consume_usage(uuid,text,date) FROM PUBLIC;
