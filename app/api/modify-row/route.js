import mysql from "mysql2/promise";
import { Client } from "pg";
import dbPromise from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const userId = req.headers.get("x-user-id"); // <- secure, from middleware

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { dbType, host, port, db, user, password, sql, tableName, operationType, beforeData, env } = body;

    let data;
    if (dbType === 'MySQL') {
      const conn = await mysql.createConnection({ host, port, user, password, database: db });
      const [result] = await conn.execute(sql);
      await conn.end();
      data = { rowCount: result.affectedRows, rows: [] };
    } else if (dbType === 'PostgreSQL') {
      const client = new Client({ host, port, user, password, database: db });
      await client.connect();
      data = await client.query(sql);
      await client.end();
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported DB type' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    // Log the operation to audit_log table
        // ✅ Log audit in SQLite
    const auditDb = await dbPromise;
    await auditDb.run(
      `INSERT INTO audit_log
        (user_id, db_type, env, db_name, table_name, operation_type, executed_sql, before_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        dbType,
        body.env || "unknown",
        db,
        tableName || "",
        operationType || "",
        sql,
        JSON.stringify(beforeData || {})
      ]
    );
    // Return the result of the SQL execution
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
