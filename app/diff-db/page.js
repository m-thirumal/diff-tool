"use client";
import { useEffect, useState } from "react";
import { useDb } from "../context/DbContext";
import MultiSelectDropdown from "../components/MultiSelectDropdown";

export default function SelectTablePage() {
  const { payload } = useDb();
  const { dbType, envA, envB } = payload;
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loading, setLoading] = useState(true);
  // Primary Key
  const [primaryKeys, setPrimaryKeys] = useState([]);
  // Column
  const [columns, setColumns] = useState([]);
  const [selectedKeyColumn, setSelectedKeyColumn] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
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
        // Extract and compare primary keys (optional, if needed)
        const commonPKs = dataA.primaryKeys.filter(pk => dataB.primaryKeys.includes(pk));
        setPrimaryKeys(commonPKs); // <-- You need to define setPrimaryKeys via useState
        
        if (commonColumns.length) {
          setSelectedColumns([commonColumns[0]]);
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
      } finally {
        setLoadingCols(false);
      }
    }
    fetchColumns();
  }, [selectedTable]);

  function generateCompositeKey(row, primaryKeys) {
    return primaryKeys.map(pk => row[pk] ?? '__NULL__').join("||");
  }

  useEffect(() => {
     if (!selectedTable || selectedColumns.length === 0 || primaryKeys.length === 0) return;

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
          
          const rowsA = dataA.data || [];
          const rowsB = dataB.data || [];

          // Create a map of rows by selectedColumn
          const mapA = new Map(rowsA.map(row => [generateCompositeKey(row, primaryKeys), row]));
          const mapB = new Map(rowsB.map(row => [generateCompositeKey(row, primaryKeys), row]));

          const diffs = [];

          for (const [keyValue, rowA] of mapA.entries()) {
            const pkValues = Object.fromEntries(primaryKeys.map(pk => [pk, rowA[pk]]));
            const rowB = mapB.get(keyValue);
            if (!rowB) {
              diffs.push({ type: "INSERT into B", key: keyValue, row: rowA, pkValues });
            } else {
              const diffObjA = {};
              const diffObjB = {};
              let hasDiff = false;

              selectedColumns.forEach((col) => {
                if (rowA[col] !== rowB[col]) {
                  diffObjA[col] = rowA[col];
                  diffObjB[col] = rowB[col];
                  hasDiff = true;
                }
              });

              if (hasDiff) {
                diffs.push({ type: "UPDATE in B", key: keyValue, row: diffObjA, oldRow: diffObjB, pkValues  });
              }
            }
          }

          for (const [keyValue, rowB] of mapB.entries()) {
            if (!mapA.has(keyValue)) {
              const pkValues = Object.fromEntries(primaryKeys.map(pk => [pk, rowA[pk]]));
              diffs.push({ type: "INSERT into A", key: keyValue, row: rowB, pkValues });
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
    }, [selectedColumns, selectedTable, primaryKeys]);

  function generateSQL(diff) {
    if (!diff || !diff.row) return "";

    const newRow = diff.row;
    const oldRow = diff.oldRow || {};

    if (diff.type.startsWith("INSERT")) {
      const keys = Object.keys(newRow).join(", ");
      const values = Object.values(newRow)
        .map((v) => `'${String(v).replace(/'/g, "''")}'`)
        .join(", ");
      return `INSERT INTO ${selectedTable} (${keys}) VALUES (${values});`;
    }

    if (diff.type.startsWith("UPDATE")) {
      const setClause = Object.entries(newRow)
        .map(([k, v]) => `${k}='${String(v).replace(/'/g, "''")}'`)
        .join(", ");

      const whereClause = diff.pkValues
        ? Object.entries(diff.pkValues)
            .map(([pk, val]) => {
              const safeVal =
                typeof val === "number"
                  ? val
                  : `'${String(val).replace(/'/g, "''")}'`;
              return `${pk}=${safeVal}`;
            })
            .join(" AND ")
        : "-- Missing PK values";


      return `UPDATE ${selectedTable} SET ${setClause} WHERE ${whereClause};`;
    }

    return "-- Not supported";
  }

return (
  <div className="p-8">
    <h1 className="text-xl font-bold mb-4">Select Common Table</h1>
    
    {loading ? (
      <p>Loading tables...</p>
    ) : tables.length === 0 ? (
      <p className="text-red-500">No common tables found.</p>
    ) : (
      <>
        <div className="mb-4 flex items-center gap-6 sticky top-0 z-10 bg-white dark:bg-gray-900 py-4">
          {/* Table Dropdown */}
          <div>
            <label htmlFor="tableSelect" className="font-medium mr-2">Table:</label>
            <select
              id="tableSelect"
              className="border px-2 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {tables.map((table) => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          {/* Column Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="columnKeySelect" className="font-medium">
              Column:
            </label>
            {loadingCols ? (
              <span>Loading...</span>
            ) : columns.length === 0 ? (
              <span className="text-red-500">No common columns</span>
            ) : (
              <select
                id="columnKeySelect"
                className="border px-2 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
                options={columns}
                selectedValues={selectedKeyColumn}
                onChange={setSelectedKeyColumn}
              />
            )}
          </div>

          {/* Column Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="columnSelect" className="font-medium">
              Column:
            </label>
            {loadingCols ? (
              <span>Loading...</span>
            ) : columns.length === 0 ? (
              <span className="text-red-500">No common columns</span>
            ) : (
              <MultiSelectDropdown
                options={columns}
                selectedValues={selectedColumns}
                onChange={setSelectedColumns}
              />
            )}
          </div>

        </div>

        {/* Diff column */}
        {diffLoading ? (
          <p>Loading row differences...</p>
        ) : rowDiff.length === 0 ? (
          <p className="text-green-600">No differences found.</p>
        ) : (
          <div className="mt-6 max-w-full overflow-auto">
            <table className="min-w-full border border-gray-300 table-fixed ">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-2 border w-24">Type</th>
                  <th className="px-4 py-2 border w-48">Key ({primaryKeys})</th>
                  <th className="px-4 py-2 border w-1/2">Env A</th>
                  <th className="px-4 py-2 border w-1/2">Env B</th>
                  <th className="px-4 py-2 border w-1/2">Action (SQL)</th>
                </tr>
              </thead>
              <tbody>
                {rowDiff.map((diff, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 border text-xs break-words whitespace-pre-wrap">{diff.type}</td>
                    <td className="px-4 py-2 border text-xs break-words whitespace-pre-wrap">{diff.key}</td>
                    <td className="px-4 py-2 border text-xs break-all whitespace-pre-wrap font-mono text-green-700">
                      {JSON.stringify(diff.row, null, 2)}
                    </td>
                    <td className="px-4 py-2 border text-xs break-words whitespace-pre-wrap font-mono text-red-700">
                      {diff.oldRow ? JSON.stringify(diff.oldRow, null, 2) : "—"}
                    </td>
                    <td className="px-2 py-2 border text-xs whitespace-pre-wrap break-words font-mono text-white-800">
                    {generateSQL(diff)}
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