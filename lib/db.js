// lib/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

let dbPromise;

async function initDb() {
  const db = await open({
    filename: "./audit.sqlite", // stored in project root
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      db_type TEXT,              -- mysql | postgres | sqlite etc
      env TEXT,                  -- production | staging | development
      db_name TEXT,              -- name of the database
      table_name TEXT,
      operation_type TEXT,       -- INSERT | UPDATE | DELETE
      executed_sql TEXT,
      before_data TEXT,         -- JSON snapshot of row(s) before change
      executed_by TEXT,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

// Singleton pattern (initialize once)
if (!dbPromise) {
  dbPromise = initDb();
}

export default dbPromise;
