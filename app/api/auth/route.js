import dbPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, password } = await req.json();
  const db = await dbPromise;

  // check if user exists 
  const existing = await db.get(`SELECT * FROM users WHERE name = ?`, [name]);
  if (!existing) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }
  const valid = await bcrypt.compare(password, existing.password);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
  }
  return new Response(JSON.stringify({ status: "logged_in", name: existing.name }), { status: 200 });
}

