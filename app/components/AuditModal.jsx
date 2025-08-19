"use client";

import { useState, useEffect } from "react";

export default function AuditModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/audit")
        .then((res) => res.json())
        .then((data) => setLogs(data.slice(0, 10))); // show last 10
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold mb-4">Recent Audit Logs</h2>
        <table className="min-w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-2 py-1 border">ID</th>
              <th className="px-2 py-1 border">DB Type</th>
              <th className="px-2 py-1 border">Operation</th>
              <th className="px-2 py-1 border">SQL</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border">
                <td className="px-2 py-1 border">{log.id}</td>
                <td className="px-2 py-1 border">{log.db_type}</td>
                <td className="px-2 py-1 border">{log.operation_type}</td>
                <td className="px-2 py-1 border">{log.executed_sql}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
