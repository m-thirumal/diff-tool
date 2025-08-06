export const runtime = 'nodejs';

import mysql from 'mysql2/promise';
import { Client } from 'pg';

export async function POST(req) {
  try {
    const body = await req.json();
    const { dbType, host, port, db, user, password, table } = body;

    let columns = [];
    let primaryKeys = [];

    if (dbType === 'MySQL') {
      const conn = await mysql.createConnection({ host, port, user, password, database: db });

      // Get all columns
      const [rows] = await conn.execute(`SHOW COLUMNS FROM \`${table}\``);
      columns = rows.map(row => row.Field);

      // Get primary key columns
      const [pkRows] = await conn.execute(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
      `, [db, table]);
      primaryKeys = pkRows.map(row => row.COLUMN_NAME);

      await conn.end();
    } else if (dbType === 'PostgreSQL') {
      const client = new Client({ host, port, user, password, database: db });
      await client.connect();

      // Get all columns
      const result = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      columns = result.rows.map(r => r.column_name);

      // Get primary key columns
      const pkResult = await client.query(`
        SELECT a.attname AS column_name
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `, [table]);
      primaryKeys = pkResult.rows.map(r => r.column_name);

      await client.end();
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported DB type' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ columns, primaryKeys }), {
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
