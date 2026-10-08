-- Execute in the dedicated Neon LeadPilot database.
-- A single statement reserves a bounded amount of usage without race conditions.
CREATE OR REPLACE FUNCTION leadpilot_private.consume_usage(
 p_account_id uuid,p_metric text,p_quantity integer
) RETURNS TABLE(allowed boolean, used bigint, quota bigint, plan text)
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,leadpilot_private AS $$
DECLARE v_plan text:='free';v_limit bigint;v_used bigint;
BEGIN
 IF p_metric NOT IN ('monthlyLeads','monthlyDrafts') OR p_quantity<1 OR p_quantity>1000 THEN
  RAISE EXCEPTION 'Invalid usage request';
 END IF;
 PERFORM 1 FROM leadpilot_private.accounts WHERE id=p_account_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Account missing'; END IF;
 SELECT s.plan INTO v_plan FROM leadpilot_private.subscriptions s
 WHERE s.account_id=p_account_id AND s.status IN ('active','trialing')
 AND (s.period_ends_at IS NULL OR s.period_ends_at>now());
 v_plan:=COALESCE(v_plan,'free');
 v_limit:=CASE v_plan
  WHEN 'agency' THEN CASE p_metric WHEN 'monthlyLeads' THEN 15000 ELSE 7500 END
  WHEN 'business' THEN CASE p_metric WHEN 'monthlyLeads' THEN 3000 ELSE 1500 END
  WHEN 'pro' THEN CASE p_metric WHEN 'monthlyLeads' THEN 500 ELSE 200 END
  ELSE CASE p_metric WHEN 'monthlyLeads' THEN 25 ELSE 10 END END;
 SELECT u.used INTO v_used FROM leadpilot_private.usage u
 WHERE u.account_id=p_account_id AND u.period_start=date_trunc('month',now() AT TIME ZONE 'UTC')::date AND u.metric=p_metric;
 v_used:=COALESCE(v_used,0);
 IF v_used+p_quantity>v_limit THEN
  RETURN QUERY SELECT false,v_used,v_limit,v_plan;RETURN;
 END IF;
 INSERT INTO leadpilot_private.usage(account_id,period_start,metric,used)
 VALUES(p_account_id,date_trunc('month',now() AT TIME ZONE 'UTC')::date,p_metric,p_quantity)
 ON CONFLICT(account_id,period_start,metric) DO UPDATE SET used=leadpilot_private.usage.used+EXCLUDED.used;
 RETURN QUERY SELECT true,v_used+p_quantity,v_limit,v_plan;
END $$;
REVOKE ALL ON FUNCTION leadpilot_private.consume_usage(uuid,text,integer) FROM PUBLIC;
