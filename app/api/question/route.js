import { NextResponse } from "next/server";
import dbPromise from "@/lib/db";

// GET: list all questions
export async function GET() {
  const db = await dbPromise;
  const rows = await db.all(`SELECT id, question FROM secret_questions`);
  console.log("Seeded questions:", rows);
  return new Response(JSON.stringify(rows), { status: 200 });
}

// POST: add custom question
export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO secret_questions (question) VALUES (?)",
      [question]
    );

    return NextResponse.json({
      id: result.lastID,
      question,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
