export function logAudit({
  userId,
  query,
  dbType,
  env = "development",
  dbName,
  tableName = "",
  operationType = "",
  beforeData = null,
}) {
  try {
    const res =  fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        query,
        dbType,
        env,
        dbName,
        tableName,
        operationType,
        beforeData,
      }),
    });
    console.log("Audit log response:", res);
    if (!res.ok) {
      const err = res.json();
      console.error("Audit log failed:", err.error);
    }
  } catch (err) {
    console.error("Network error logging audit:", err);
  }
}
