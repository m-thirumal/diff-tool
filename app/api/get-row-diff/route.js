import mysql from "mysql2/promise";
import { Client } from "pg";

export const runtime = "nodejs";

async function fetchRows(dbType, config, table) {
  if (dbType === "MySQL") {
    const conn = await mysql.createConnection({ ...config });
    const [rows] = await conn.execute(`SELECT * FROM \`${table}\``);
    await conn.end();
    return rows;
  } else if (dbType === "PostgreSQL") {
    const client = new Client({ ...config });
    await client.connect();
    const result = await client.query(`SELECT * FROM "${table}"`);
    await client.end();
    return result.rows;
  }
  throw new Error("Unsupported DB type");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { dbType, envA, envB, table, keyColumn } = body;

    const rowsA = await fetchRows(dbType, envA, table);
    const rowsB = await fetchRows(dbType, envB, table);

    const mapA = Object.fromEntries(rowsA.map(row => [row[keyColumn], row]));
    const mapB = Object.fromEntries(rowsB.map(row => [row[keyColumn], row]));

    const insertToA = [];
    const insertToB = [];
    const updateInA = [];
    const updateInB = [];

    const allKeys = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);

    for (let key of allKeys) {
      const a = mapA[key];
      const b = mapB[key];

      if (a && !b) insertToB.push(a);
      else if (!a && b) insertToA.push(b);
      else if (a && b) {
        const aJson = JSON.stringify(a);
        const bJson = JSON.stringify(b);
        if (aJson !== bJson) {
          updateInA.push(b); // update A using B's value
          updateInB.push(a); // update B using A's value
        }
      }
    }

    return new Response(JSON.stringify({
      insertToA, insertToB, updateInA, updateInB
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
