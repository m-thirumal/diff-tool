import dbPromise from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const db = await dbPromise;

    const logs = await db.all(
      `SELECT a.*, u.name AS executed_by
       FROM audit_log AS a
       LEFT JOIN users AS u ON u.id = a.user_id
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const { count } = await db.get(`SELECT COUNT(*) as count FROM audit_log`);
    const totalPages = Math.ceil(count / limit);

    return Response.json({ logs, totalPages, totalCount: count, page });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
