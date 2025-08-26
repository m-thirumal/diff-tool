// app/api/audit/route.js
import dbPromise from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  console.log("Audit log request body:", body);

  const db = await dbPromise;

  await db.run(
    `INSERT INTO audit_log 
      (user_id, db_type, env, db_name, table_name, operation_type, executed_sql, before_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.userId,      // user_id
      body.dbType,        
      body.env,
      body.dbName,       // 
      body.tableName,
      body.operationType,
      body.query,         // executed_sql
      JSON.stringify(body.beforeData || {}),
      body.executedBy,
    ]
  );

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
