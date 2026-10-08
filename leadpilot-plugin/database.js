import pg from 'pg';
const { Pool } = pg;
let pool;
export function databaseConfigured(){ return Boolean(process.env.DATABASE_URL); }
export function getPool(){
 if (!databaseConfigured()) throw new Error('DATABASE_URL not configured');
 if (!pool) pool = new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true},max:5,connectionTimeoutMillis:7000,idleTimeoutMillis:30000});
 return pool;
}
export async function databaseStatus(){
 if(!databaseConfigured()) return {configured:false,connected:false};
 try {
  const r=await getPool().query("select to_regclass('leadpilot_private.accounts') is not null as schema_ready, to_regprocedure('leadpilot_private.consume_usage(uuid,text,integer)') is not null as quota_ready");
  return {configured:true,connected:true,schema_ready:r.rows[0]?.schema_ready===true,quota_ready:r.rows[0]?.quota_ready===true};
 } catch {
  return {configured:true,connected:false};
 }
}
export async function closeDatabase(){if(pool){await pool.end();pool=undefined;}}
