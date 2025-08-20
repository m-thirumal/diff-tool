import dbPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, password } = await req.json();
  const db = await dbPromise;

  // check if user exists (just take first one)
  const existing = await db.get(`SELECT * FROM users LIMIT 1`);

  if (!existing) {
    // first user → register
    if (!name || !password) {
      return new Response(JSON.stringify({ error: "Name and password required" }), { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.run(`INSERT INTO users (name, password) VALUES (?, ?)`, [name, hashed]);

    return new Response(JSON.stringify({ status: "registered", name }), { status: 200 });
  } else {
    // login flow
    const valid = await bcrypt.compare(password, existing.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
    }

    return new Response(JSON.stringify({ status: "logged_in", name: existing.name }), { status: 200 });
  }
}

