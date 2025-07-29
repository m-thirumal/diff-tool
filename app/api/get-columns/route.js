export const runtime = 'nodejs';

import mysql from 'mysql2/promise';
import { Client } from 'pg';

export async function POST(req) {
  try {
    const body = await req.json();
    const { dbType, host, port, db, user, password, table } = body;

    let columns = [];

    if (dbType === 'MySQL') {
      const conn = await mysql.createConnection({ host, port, user, password, database: db });
      const [rows] = await conn.execute(`SHOW COLUMNS FROM \`${table}\``);
      columns = rows.map(row => row.Field);
      await conn.end();
    } else if (dbType === 'PostgreSQL') {
      const client = new Client({ host, port, user, password, database: db });
      await client.connect();
      const result = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      columns = result.rows.map(r => r.column_name);
      await client.end();
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported DB type' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ columns }), {
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
