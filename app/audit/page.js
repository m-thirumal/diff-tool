"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TopNav from "../components/TopNav";

export default function AuditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/audit?page=${page}`);
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [page]);

  return (
    <div className="font-sans">
      <TopNav title="Audit Logs" />

      {loading ? (
        <p className="text-center p-4">Loading...</p>
      ) : (
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
                <tr
                  key={log.id}
                  className="border hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="px-2 py-2 border text-center">{log.id}</td>
                  <td className="px-2 py-2 border">{log.db_type}</td>
                  <td className="px-2 py-2 border">{log.env}</td>
                  <td className="px-2 py-2 border">{log.db_name}</td>
                  <td className="px-2 py-2 border">{log.table_name}</td>
                  <td className="px-2 py-2 border">{log.operation_type}</td>
                  <td className="px-2 py-2 border max-w-[300px] truncate">
                    {log.before_data}
                  </td>
                  <td
                    className="px-2 py-2 border max-w-[300px] truncate"
                    title={log.executed_sql}
                  >
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
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() =>
                router.push(`/audit?page=${pageNum}`, { scroll: false })
              }
              className={`px-3 py-1 border rounded ${
                pageNum === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
