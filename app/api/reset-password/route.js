import dbPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { step, name, answer, newPassword } = await req.json();
  const db = await dbPromise;

  const user = await db.get(`SELECT * FROM users WHERE name = ?`, [name]);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  if (step === 1) {
    return new Response(JSON.stringify({ secret_question: user.secret_question }), { status: 200 });
  }

  if (step === 2) {
    const valid = await bcrypt.compare(answer, user.secret_answer);
    if (!valid) return new Response(JSON.stringify({ error: "Incorrect answer" }), { status: 401 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run(`UPDATE users SET password = ? WHERE name = ?`, [hashed, name]);

    return new Response(JSON.stringify({ status: "password_reset" }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Invalid step" }), { status: 400 });
}
