// app/audit/page.jsx
import dbPromise from "@/lib/db";

export default async function AuditPage() {
  const db = await dbPromise;
  const logs = await db.all(`
    SELECT * FROM audit_log
    ORDER BY executed_at DESC
  `);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
        {/* Table wrapper for horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 table-auto text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-2 py-2 border">ID</th>
              <th className="px-2 py-2 border">DB Type</th>
              <th className="px-2 py-2 border">Env</th>
              <th className="px-2 py-2 border">Db Name</th>
              <th className="px-2 py-2 border">Table</th>
              <th className="px-2 py-2 border">Operation</th>
              <th className="px-2 py-2 border">Before Data</th>
              <th className="px-2 py-2 border">Executed SQL</th>
              <th className="px-2 py-2 border">Executed By</th>
              <th className="px-2 py-2 border">Executed At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-2 py-2 border text-center">{log.id}</td>
                <td className="px-2 py-2 border">{log.db_type}</td>
                <td className="px-2 py-2 border">{log.env}</td>
                <td className="px-2 py-2 border">{log.db_name}</td>
                <td className="px-2 py-2 border">{log.table_name}</td>
                <td className="px-2 py-2 border">{log.operation_type}</td>
                <td className="px-2 py-2 border  max-w-[300px] truncate">{log.before_data}</td>
                <td className="px-2 py-2 border max-w-[300px] truncate" title={log.executed_sql}>
                  {log.executed_sql}
                </td>
                <td className="px-2 py-2 border">{log.executed_by}</td>
                <td className="px-2 py-2 border">
                  {new Date(log.executed_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
