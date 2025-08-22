import dbPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, password, question, answer } = await req.json();
  const db = await dbPromise;

  // check if user exists (just take first one)
  const existing = await db.get(`SELECT * FROM users WHERE name = ?`, [name]);

  if (existing) {
    return new Response(
      JSON.stringify({ error: "User is already registered" }),
      { status: 409 }
    );
  }
  // first user → register
  if (!name || !password || !question || !answer) {
    return new Response(
      JSON.stringify({ error: "Name, password, question, and answer are required" }),
      { status: 400 }
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedAnswer = await bcrypt.hash(answer, 10);
  await db.run(`INSERT INTO users (name, password, secret_question, secret_answer) VALUES (?, ?, ?, ?)`, [
    name,
    hashedPassword,
    question,
    hashedAnswer,
  ]);

  return new Response(JSON.stringify({ status: "registered", name }), {
    status: 200,
  });
}
