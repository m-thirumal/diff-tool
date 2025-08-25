// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "THIRUMAL_TAMIL_VENDHAN_ILAYA_VENDHAN";

// Public routes (pages + apis)
const PUBLIC_PATHS = [
  "/",
  "/api/register",
  "/api/reset-password",
  "/api/auth",
  "/api/public",
  "/api/login",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip static files (anything with an extension, like .js, .css, .png, .jpg)
  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  // 1. Allow public paths
  if (pathname.startsWith("/public") || PUBLIC_PATHS.includes(pathname)) {
    console.log("Public path, no auth needed:", pathname);
    return NextResponse.next();
  }

  // 2. Get token from cookie
  const token = req.cookies.get("token")?.value;

  // 3. Protect API routes
  if (pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  }

  // 4. Protect page routes (non-public)
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid or expired token:", pathname, err.message);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
