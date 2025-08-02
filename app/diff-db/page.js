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
  // Row
  const [rowDiff, setRowDiff] = useState([]);
  const [diffLoading, setDiffLoading] = useState(false);

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

  useEffect(() => {
    if (!selectedColumn || !selectedTable) return;

    async function fetchDiffs() {
        setDiffLoading(true);
        try {
          const resA = await fetch("/api/get-row-diff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbType, ...envA, table: selectedTable }),
          });

          const resB = await fetch("/api/get-row-diff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dbType, ...envB, table: selectedTable }),
          });

          const dataA = await resA.json();
          const dataB = await resB.json();
          
          const rowsA = dataA.rows || [];
          const rowsB = dataB.rows || [];

          // Create a map of rows by selectedColumn
          const mapA = new Map(rowsA.map(row => [row[selectedColumn], row]));
          const mapB = new Map(rowsB.map(row => [row[selectedColumn], row]));

          const diffs = [];

          // Check for inserts (in A not in B)
          for (const [key, rowA] of mapA.entries()) {
            if (!mapB.has(key)) {
              diffs.push({ type: "INSERT into B", key, row: rowA });
            } else if (JSON.stringify(rowA) !== JSON.stringify(mapB.get(key))) {
              diffs.push({ type: "UPDATE in B", key, row: rowA, oldRow: mapB.get(key) });
            }
          }

          // Check for inserts (in B not in A)
          for (const [key, rowB] of mapB.entries()) {
            if (!mapA.has(key)) {
              diffs.push({ type: "INSERT into A", key, row: rowB });
            }
          }
          console.log("Diffs:", diffs);
          setRowDiff(diffs);
        } catch (err) {
          console.error("Error fetching diff:", err);
        } finally {
          setDiffLoading(false);
        }
      }

      fetchDiffs();
    }, [selectedColumn]);

return (
  <div className="p-8">
    <h1 className="text-xl font-bold mb-4">Select Common Table</h1>
    
    {loading ? (
      <p>Loading tables...</p>
    ) : tables.length === 0 ? (
      <p className="text-red-500">No common tables found.</p>
    ) : (
      <>
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

        {/* Diff column */}
        {diffLoading ? (
          <p>Loading row differences...</p>
        ) : rowDiff.length === 0 ? (
          <p className="text-green-600">No differences found.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Key ({selectedColumn})</th>
                  <th className="px-4 py-2 border">New Row</th>
                  <th className="px-4 py-2 border">Old Row</th>
                </tr>
              </thead>
              <tbody>
                {rowDiff.map((diff, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 border text-sm text-blue-700">{diff.type}</td>
                    <td className="px-4 py-2 border text-sm">{diff.key}</td>
                    <td className="px-4 py-2 border text-xs whitespace-pre-wrap font-mono text-green-700">
                      {JSON.stringify(diff.row, null, 2)}
                    </td>
                    <td className="px-4 py-2 border text-xs whitespace-pre-wrap font-mono text-red-700">
                      {diff.oldRow ? JSON.stringify(diff.oldRow, null, 2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-sm text-gray-600">Total differences: {rowDiff.length}</p>
          </div>
        )}
      </>
    )}
  </div>
);

}
