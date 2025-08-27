// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "THIRUMAL_TAMIL_VENDHAN_ILAYA_VENDHAN";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Public routes (pages + apis)
const PUBLIC_PATHS = [
  "/",
  "/register", "/api/register", "/api/question",
  "/reset-password", "/api/reset-password",
  "/auth", "/api/auth",
  "/public",
];

// Verify JWT safely with jose
async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;// contains claims (userId, roles, etc.)
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}

export async function middleware(req) {
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

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // attach claims to request headers
    const headers = new Headers(req.headers);
    if (payload.userId) headers.set("x-user-id", payload.userId);

    return NextResponse.next({ request: { headers } });
  }

  // 4. Protect page routes (non-public)
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    console.error("Invalid or expired token:", pathname);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
