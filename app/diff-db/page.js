"use client";
import { useEffect, useState } from "react";
import { useDb } from "../context/DbContext";
import { useSearchParams } from "next/navigation";

export default function SelectTablePage() {
  const { dbDetails } = useDb();
  const { dbType, envA, envB } = dbDetails;
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommonTables() {
      try {
        const [resA, resB] = await Promise.all([
          fetch("/api/get-tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbType, ...envA }),
          }),
          fetch("/api/get-tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbType, ...envB }),
          }),
        ]);

        const dataA = await resA.json();
        const dataB = await resB.json();

        const commonTables = dataA.tables.filter((t) => dataB.tables.includes(t));
        setTables(commonTables);
        if (commonTables.length) setSelectedTable(commonTables[0]);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCommonTables();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Select Common Table</h1>
      {loading ? (
        <p>Loading tables...</p>
      ) : tables.length === 0 ? (
        <p className="text-red-500">No common tables found.</p>
      ) : (
        <div className="mb-4">
          <label htmlFor="tableSelect" className="font-medium mr-2">Choose Table:</label>
          <select
            id="tableSelect"
            className="border px-2 py-1 rounded"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            {tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
