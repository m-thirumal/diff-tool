import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "THIRUMAL_TAMIL_VENDHAN_ILAYA_VENDHAN";

export function verifyAuth(req) {
  const token = req.cookies.get("token")?.value; // from cookie
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET); // returns { userId, name, iat, exp }
  } catch (err) {
    return null;
  }
}
