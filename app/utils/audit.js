export async function logAudit({
  query,
  dbType,
  executedBy = "Thirumal",
  env = "development",
  tableName = "",
  operationType = "",
  beforeData = null,
}) {
  try {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        dbType,
        executedBy,
        env,
        tableName,
        operationType,
        beforeData,
      }),
    });
    console.log("Audit log response:", res);
    if (!res.ok) {
      const err = await res.json();
      console.error("Audit log failed:", err.error);
    }
  } catch (err) {
    console.error("Network error logging audit:", err);
  }
}
