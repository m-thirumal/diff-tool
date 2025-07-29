
import mysql from 'mysql2/promise';
import { Client } from 'pg';

export async function POST(req) {
  try {
    const body = await req.json();
    const { dbType, host, port, db, user, password } = body;

    let tables = [];

    if (dbType === 'MySQL') {
      const conn = await mysql.createConnection({ host, port, user, password, database: db });
      const [rows] = await conn.execute(`SHOW TABLES`);
      tables = rows.map(row => Object.values(row)[0]);
      await conn.end();
    } else if (dbType === 'PostgreSQL') {
      const client = new Client({ host, port, user, password, database: db });
      await client.connect();
      const result = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type='BASE TABLE'
      `);
      tables = result.rows.map(r => r.table_name);
      await client.end();
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported DB type' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ tables }), {
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
