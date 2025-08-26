"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import Pagination from "../components/Pagination";

export default function AuditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/audit?page=${page}&limit=${limit}`);
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [page, limit]);

  return (
    <div className="font-sans">
      <TopNav title="Audit Logs" />
      <div className="flex flex-col h-[calc(100vh-120px)] relative"> 
      {loading ? (
        <p className="text-center p-4">Loading...</p>
      ) : (
        <div className="flex-1 overflow-y-auto">
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
      <div className="sticky bottom-0 bg-white border-t shadow-sm">
        <Pagination
          totalItems={totalCount}
          currentPage={page}
          onPageChange={(newPage) =>
            router.push(`/audit?page=${newPage}&limit=${limit}`, { scroll: false })
          }
          onItemsPerPageChange={(newLimit) => {
            router.push(`/audit?page=1&limit=${newLimit}`, { scroll: false });
          }}
        />
      </div>
    </div>
    </div>
  );
}
