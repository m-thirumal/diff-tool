// app/api/audit/route.js
import dbPromise from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  console.log("Audit log request body:", body);

  const db = await dbPromise;

  await db.run(
    `INSERT INTO audit_log 
      (db_type, env, table_name, operation_type, executed_sql, before_data, executed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      body.dbType,        // ✅ match client
      body.env,
      body.tableName,
      body.operationType,
      body.query,         // ✅ query = executed_sql
      JSON.stringify(body.beforeData || {}),
      body.executedBy,
    ]
  );

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
