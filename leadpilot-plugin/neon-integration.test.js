// Run manually against the dedicated Neon database:
// DATABASE_URL=... node neon-integration.test.js
// Creates a disposable account and rolls back all changes.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getPool, closeDatabase } from './database.js';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const client=await getPool().connect();
const id=randomUUID(), email='leadpilot-test-'+id+'@example.invalid';
try {
 await client.query('BEGIN');
 const ready=await client.query("SELECT to_regclass('leadpilot_private.accounts') IS NOT NULL AS accounts, to_regprocedure('leadpilot_private.consume_usage(uuid,text,integer)') IS NOT NULL AS quotas");
 assert.equal(ready.rows[0].accounts,true);assert.equal(ready.rows[0].quotas,true);
 await client.query('INSERT INTO leadpilot_private.accounts(id,email,password_hash) VALUES($1,$2,$3)',[id,email,'test-only']);
 const consume=async(metric,quantity)=>(await client.query('SELECT * FROM leadpilot_private.consume_usage($1,$2,$3)',[id,metric,quantity])).rows[0];
 const first=await consume('monthlyLeads',24);
 assert.equal(first.allowed,true);assert.equal(Number(first.used),24);assert.equal(Number(first.quota),25);
 const rejected=await consume('monthlyLeads',2);
 assert.equal(rejected.allowed,false);assert.equal(Number(rejected.used),24);
 const last=await consume('monthlyLeads',1);
 assert.equal(last.allowed,true);assert.equal(Number(last.used),25);
 const drafts=await consume('monthlyDrafts',10);
 assert.equal(drafts.allowed,true);assert.equal(Number(drafts.quota),10);
 const blocked=await consume('monthlyDrafts',1);
 assert.equal(blocked.allowed,false);
 console.log('PASS: Neon schema, lead quota boundary, draft quota boundary and atomic usage transaction');
} finally {
 try{await client.query('ROLLBACK');}finally{client.release();await closeDatabase();}
}
