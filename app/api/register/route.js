import dbPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, password, question, answer } = await req.json();
  const db = await dbPromise;

  // check if user exists already
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
  // Check if question already exists
  let questionRow = await db.get(
    `SELECT id FROM secret_questions WHERE question = ?`,
    [question]
  );

  let questionId;
  if (!questionRow) {
    // Insert custom question
    const result = await db.run(
      `INSERT INTO secret_questions (question) VALUES (?)`,
      [question]
    );
    questionId = result.lastID; // get inserted row ID
  } else {
    questionId = questionRow.id;
  }
  await db.run(`INSERT INTO users (name, password, secret_question_id, secret_answer) VALUES (?, ?, ?, ?)`, [
    name,
    hashedPassword,
    questionId,
    hashedAnswer,
  ]);

  return new Response(JSON.stringify({ status: "registered", name }), {
    status: 200,
  });
}
