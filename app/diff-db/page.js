"use client";
import { useEffect, useState } from "react";
import { useDb } from "../context/DbContext";

export default function SelectTablePage() {
  const { payload } = useDb();
  const { dbType, envA, envB } = payload;
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loading, setLoading] = useState(true);
  // Column
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loadingCols, setLoadingCols] = useState(false);

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

  useEffect(() => {
    if (!selectedTable) return;

    async function fetchColumns() {
      setLoadingCols(true);
      try {
        const [resA, resB] = await Promise.all([
          fetch("/api/get-columns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbType, ...envA, table: selectedTable }),
          }),
          fetch("/api/get-columns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbType, ...envB, table: selectedTable }),
          }),
        ]);

        const dataA = await resA.json();
        const dataB = await resB.json();

        const commonColumns = dataA.columns.filter((t) => dataB.columns.includes(t));
        setColumns(commonColumns);
        if (commonColumns.length) setSelectedColumn(commonColumns[0]);
      } catch (error) {
        console.error("Error fetching columns:", error);
      } finally {
        setLoadingCols(false);
      }
    }
    fetchColumns();
  }, [selectedTable]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Select Common Table</h1>
      {loading ? (
        <p>Loading tables...</p>
      ) : tables.length === 0 ? (
        <p className="text-red-500">No common tables found.</p>
      ) : (
          <div className="mb-4 flex items-center gap-6">
            {/* Table Dropdown */}
            <div>
              <label htmlFor="tableSelect" className="font-medium mr-2">Table:</label>
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

            {/* Column Dropdown */}
            <div>
              <label htmlFor="columnSelect" className="font-medium mr-2">Column:</label>
              {loadingCols ? (
                <span>Loading...</span>
              ) : columns.length === 0 ? (
                <span className="text-red-500">No common columns</span>
              ) : (
                <select
                  id="columnSelect"
                  className="border px-2 py-1 rounded"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
      )}
    </div>
  );
}
