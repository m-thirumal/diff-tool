import mysql from "mysql2/promise";
import { Client } from "pg";

export async function POST(req) {
  try {
    const body = await req.json();
    const { dbType, host, port, db, user, password, table } = body;
    let data, count;
    if (dbType === 'MySQL') {
      const conn = await mysql.createConnection({ host, port, user, password, database: db });
      const [rows] = await conn.execute(`SELECT * FROM \`${table}\``);
      // Fetch count
      const [countRes] = await conn.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
      await conn.end();
      data = rows;
      count = countRes[0].cnt;
    } else if (dbType === 'PostgreSQL') {
      const client = new Client({ host, port, user, password, database: db });
      await client.connect();
      const result = await client.query(`SELECT * FROM "${table}"`);
      // Fetch count
      const countResult = await client.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
      await client.end();
      data = result.rows;
      count = Number(countResult.rows[0].cnt);
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported DB type' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Total data fetched:", count);
    // Return data and count
    return new Response(JSON.stringify({ data, count }), {
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
