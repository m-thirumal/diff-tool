import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbPromise from "@/lib/db";
import bcrypt from "bcryptjs";

// Secret key (store in .env.local)
const JWT_SECRET = process.env.JWT_SECRET || "THIRUMAL_TAMIL_VENDHAN_ILAYA_VENDHAN";


export async function POST(req) {
  const { name, password } = await req.json();
  const db = await dbPromise;

  // check if user exists 
  const user = await db.get(`SELECT * FROM users WHERE name = ?`, [name]);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  
  // Sign JWT with userId
  const token = jwt.sign(
    { userId: user.id, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Store JWT in an HttpOnly cookie
  const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return res;
//  return new Response(JSON.stringify({ status: "logged_in", name: existing.name }), { status: 200 });
}

