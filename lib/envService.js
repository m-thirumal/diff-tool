import dbPromise from "./db.js";

export async function getEnvironmentsByUser(userId) {
  const db = await dbPromise;
  return db.all(
    "SELECT * FROM environments WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
}

export async function saveEnvironment(env, userId) {
  const db = await dbPromise;
  await db.run(
    `INSERT INTO environments 
        (user_id, name, db_type, host, port, db_name, user, password) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, name) 
    DO UPDATE SET 
        db_type = excluded.db_type,
        host = excluded.host,
        port = excluded.port,
        db_name = excluded.db_name,
        user = excluded.user,
        password = excluded.password,
        updated_at = CURRENT_TIMESTAMP`,
    [userId, env.name, env.dbType, env.host, env.port, env.db, env.user, env.password]
    );
    return db.get(
        "SELECT * FROM environments WHERE user_id = ? AND name = ?",
        [userId, env.name]
    );
}
