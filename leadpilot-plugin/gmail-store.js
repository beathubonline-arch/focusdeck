import {getPool} from './database.js';
let initialized;
async function ensure(){
 if(!initialized)initialized=getPool().query(`CREATE TABLE IF NOT EXISTS leadpilot_private.gmail_connections (
 account_id uuid PRIMARY KEY, refresh_token text NOT NULL, gmail_address text, updated_at timestamptz NOT NULL DEFAULT now()
 );
 CREATE TABLE IF NOT EXISTS leadpilot_private.gmail_scan_history (
 id bigserial PRIMARY KEY, account_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 scanned integer NOT NULL, qualified integer NOT NULL, review integer NOT NULL, ignored integer NOT NULL,
 results jsonb NOT NULL
 );
 CREATE INDEX IF NOT EXISTS gmail_scan_history_account ON leadpilot_private.gmail_scan_history(account_id,created_at DESC)`);
 try{await initialized;}catch(e){initialized=undefined;throw e;}
}
export async function saveConnection(accountId,encryptedToken,email){
 await ensure();await getPool().query(`INSERT INTO leadpilot_private.gmail_connections(account_id,refresh_token,gmail_address) VALUES($1,$2,$3)
 ON CONFLICT(account_id) DO UPDATE SET refresh_token=EXCLUDED.refresh_token,gmail_address=EXCLUDED.gmail_address,updated_at=now()`,[accountId,encryptedToken,email]);
}
export async function loadConnection(accountId){await ensure();return (await getPool().query('SELECT refresh_token,gmail_address FROM leadpilot_private.gmail_connections WHERE account_id=$1',[accountId])).rows[0]||null;}
export async function deleteConnection(accountId){await ensure();await getPool().query('DELETE FROM leadpilot_private.gmail_connections WHERE account_id=$1',[accountId]);}
export async function saveScan(accountId,result){
 await ensure();await getPool().query(`INSERT INTO leadpilot_private.gmail_scan_history(account_id,scanned,qualified,review,ignored,results) VALUES($1,$2,$3,$4,$5,$6)`,[accountId,result.scanned,result.qualified,result.review.length,result.ignored.length,JSON.stringify(result)]);
}
export async function recentScans(accountId){
 await ensure();const r=await getPool().query('SELECT id,created_at,scanned,qualified,review,ignored,results FROM leadpilot_private.gmail_scan_history WHERE account_id=$1 ORDER BY created_at DESC LIMIT 10',[accountId]);
 return r.rows;
}
