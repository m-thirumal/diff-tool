import mysql from "mysql2/promise";
import { Client } from "pg";

export async function POST(req) {
  try {
    const body = await req.json();
    const { dbType, host, port, db, user, password, sql } = body;
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
