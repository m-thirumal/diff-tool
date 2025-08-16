import dbPromise from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const db = await dbPromise;

  await db.run(
    `INSERT INTO audit_log 
      (db_type, env, table_name, operation_type, executed_sql, before_data, executed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      body.db_type,
      body.env,
      body.table_name,
      body.operation_type,
      body.executed_sql,
      JSON.stringify(body.before_data || {}),
      body.executed_by,
    ]
  );

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
