"use client";
import { useEffect, useState } from "react";
import { useDb } from "../context/DbContext";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import Modal from "../components/Modal";
import { Trash2, Plus, Edit } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { logAudit } from "../utils/audit"; 
import { useRouter } from "next/navigation"; 


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
  // Key Column
  const [selectedKeyColumn, setSelectedKeyColumn] = useState("");
  // Compare Columns
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loadingCols, setLoadingCols] = useState(false);
  // Row
  const [rowDiff, setRowDiff] = useState([]);
  const [diffLoading, setDiffLoading] = useState(false);
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSQL, setSelectedSQL] = useState("");
  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  //router
  const router = useRouter();
  // Previous row snapshot for audit logging
  const [selectedDiff, setSelectedDiff] = useState(null);
  // Set row count variables
  const [rowACount, setRowACount] = useState(0);  
  const [rowBCount, setRowBCount] = useState(0);


  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const openModal = (sql, diff) => {
    setSelectedSQL(sql);
    setIsModalOpen(true);
    setSelectedDiff(diff); // <-- store the diff object too
  };

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
          setSelectedKeyColumn(commonColumns[0]);
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

  const fetchDiffs = async () => {
    if (!selectedTable || selectedColumns.length === 0 || primaryKeys.length === 0 || !selectedKeyColumn) return;
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

      setRowACount(dataA.count);
      setRowBCount(dataB.count);

      // Create a map of rows by selectedColumn
      const mapA = new Map(rowsA.map(row => [row[selectedKeyColumn], row]));
      const mapB = new Map(rowsB.map(row => [row[selectedKeyColumn], row]));

      const diffs = [];

      for (const [keyValue, rowA] of mapA.entries()) {
        const pkValues = Object.fromEntries(primaryKeys.map(pk => [pk, rowA[pk]]));
        const rowB = mapB.get(keyValue);
        if (!rowB) {
            diffs.push({
              type: "INSERT",
              key: keyValue,
              row: rowA,
              buttonName: "INSERT to B",
              buttonClass: "bg-green-600 hover:bg-green-500", // Tailwind classes for green
              pkValues
            });
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
                diffs.push({
                  type: "UPDATE",
                  key: keyValue,
                  row: diffObjA,
                  oldRow: diffObjB,
                  buttonName: "UPDATE to B",
                  buttonClass: "bg-yellow-600 hover:bg-yellow-500", // Tailwind classes for yellow
                  pkValues
                })
          }
        }
      }
      for (const [keyValue, rowB] of mapB.entries()) {
        if (!mapA.has(keyValue)) {
          const pkValues = Object.fromEntries(primaryKeys.map(pk => [pk, rowB[pk]]));
          diffs.push({
            type: "DELETE",
            key: keyValue,
            oldRow: rowB, // showing what would be deleted
            buttonName: "DELETE from B",
            buttonClass: "bg-red-600 hover:bg-red-500", // Tailwind red for delete
            pkValues
          });
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

  useEffect(() => {
    fetchDiffs();
  }, [selectedColumns, selectedTable, primaryKeys, selectedKeyColumn]);

  function generateSQL(diff) {
    console.log("Generating SQL for diff:", diff);
    if (!diff || (!diff.row && !diff.oldRow)) return "";

    const newRow = diff.row;
    const oldRow = diff.oldRow || {};

    if (diff.type.startsWith("INSERT")) {
      console.log("Generating INSERT SQL for diff:", diff);
      const keys = Object.keys(newRow).join(", ");
      const values = Object.values(newRow)
        .map((v) => sqlValueFormatter(v))
        .join(", ");
      return `INSERT INTO ${selectedTable} (${keys}) VALUES (${values});`;
    }

    if (diff.type.startsWith("UPDATE")) {
      console.log("Generating UPDATE SQL for diff:", diff);
      const setClause = Object.entries(newRow)
        .map(([k, v]) => `${k}=${sqlValueFormatter(v)}`)
        .join(", ");

      const whereClause = diff.pkValues
        ? Object.entries(diff.pkValues)
            .map(([pk, val]) => {
              const safeVal =
                typeof val === "number"
                  ? val
                  : `${sqlValueFormatter(v)}`;
              return `${pk}=${safeVal}`;
            })
            .join(" AND ")
        : "-- Missing PK values";


      return `UPDATE ${selectedTable} SET ${setClause} WHERE ${whereClause};`;
    }

    if (diff.type.startsWith("DELETE")) {
      console.log("Generating DELETE SQL for diff:", diff);
      const whereClause = diff.pkValues
        ? Object.entries(diff.pkValues)
            .map(([pk, val]) => {
              const safeVal =
                typeof val === "number"
                  ? val
                  : `${sqlValueFormatter(v)}`;
              return `${pk}=${safeVal}`;
            })
            .join(" AND ")
        : "-- Missing PK values";
      console.log("Where clause:", whereClause);
      return `DELETE FROM ${selectedTable} WHERE ${whereClause};`;
    }

    return "-- Not supported";
  }

  function sqlValueFormatter(value) {
    if (value == null) return "NULL";

    // Detect ISO 8601 date string
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

    if (typeof value === "string" && isoDateRegex.test(value)) {
      const d = new Date(value);
      const pad = (n) => String(n).padStart(2, "0");

      if (dbType?.toLowerCase() === "mysql") {
        // MySQL DATETIME: YYYY-MM-DD HH:MM:SS
        return `'${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}'`;
      }

      if (dbType?.toLowerCase() === "postgresql") {
        // PostgreSQL can accept ISO but let's format to match timestamp style
        return `'${d.toISOString().replace("T", " ").replace("Z", "")}'`;
      }
    }

    // Escape single quotes for safe SQL strings
    return `'${String(value).replace(/'/g, "''")}'`;  
  }

  const handleExecute = async (modifiedSQL) => {
    console.log("Executing SQL:", modifiedSQL);
      try {
        const res = await fetch("/api/modify-row", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dbType, ...envB, sql: modifiedSQL }),
        });

        const result = await res.json();
        if (res.ok) {
          console.log("Execution result:", result.data);
          alert(`Query executed successfully. Rows affected: ${result.data.rowCount}`);
           // ✅ centralised audit log
          await logAudit({
              query: modifiedSQL,
              dbType,
              executedBy: "Thirumal",
              env: envB.name, // or whichever env the change applied
              dbName: envB.db,
              tableName: selectedTable,
              operationType: selectedDiff?.type,
              beforeData:  selectedDiff?.type === "INSERT" 
                ? selectedDiff?.row 
                : selectedDiff?.oldRow || {}
            });
          // Refresh table diff immediately
          await fetchDiffs();
          setIsModalOpen(false);
        } else {
          console.error("Error executing query:", result.error);
          alert(`Error: ${result.error}`);
        }
    } catch (err) {
      console.error("Network error:", err);
      alert(`Network error: ${err.message}`);
    }
   
  };

return (
  <div className="p-2 font-sans">
  <h1 className="text-xl font-bold mb-4">Select Common Table</h1>
  
  {loading ? (
    <p>Loading tables...</p>
  ) : tables.length === 0 ? (
    <p className="text-red-500">No common tables found.</p>
  ) : (
    <>
      <div className="mb-4 flex items-center gap-6 sticky top-0 z-10 bg-white dark:bg-gray-900 py-1 px-2 shadow">
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

        {/* Column Dropdown for key */}
        <div className="flex items-center gap-2">
          <label htmlFor="columnKeySelect" className="font-medium">
          Key Column:</label>
        <select
            id="columnKeySelect"
            className="border px-2 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={selectedKeyColumn}
            onChange={(e) => setSelectedKeyColumn([e.target.value])}
          >
            <option value="">-- Select Key Column --</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

        </div>

        {/* Column Dropdown */}
        <div className="flex items-center gap-2 relative z-20">
          <label htmlFor="columnSelect" className="font-medium">
            Compare Column (Optional):
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

        {/* 🔹 Refresh Button */}
        <button
          type="button"
          onClick={fetchDiffs}
          className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded shadow"
        >
          Refresh
        </button>
        {/* 🔹 Audit Logs Button */}
        <button
          onClick={() => router.push("/audit")}
          className="bg-indigo-600 hover:bg-indigo-900 text-white px-2 py-2 rounded shadow"
        >
          Audit Logs
        </button>

      </div>

      {/* Diff column */}
      {diffLoading ? (
        <p>Loading row differences...</p>
      ) : rowDiff.length === 0 ? (
        <p className="text-green-600">No differences found.</p>
      ) : (
        <div className="mt-6 max-w-full overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-600 table-auto z-10">
            <thead className="bg-green-900 text-white sticky top-0 z-0">
              <tr>
                {/* <th className="px-4 py-2 border dark:border-gray-600 min-w-[60px]">Type</th> */}
                <th className="px-2 py-1 border dark:border-gray-600 min-w-[120px]">
                  PK {primaryKeys.join(", ")}
                </th>
                <th className="px-2 py-1 border dark:border-gray-600 min-w-[300px]">
                  {envA ? envA.name : "Env A"}
                  <div className="text-xs text-gray-200">
                    Rows: {rowACount ?? "—"}
                  </div>
                </th>
                <th className="px-2 py-1 border dark:border-gray-600 min-w-[300px]">
                  {envB ? envB.name : "Env B"}
                  <div className="text-xs text-gray-200">
                    Rows: {rowBCount ?? "—"}
                  </div>
                </th>
                <th className="px-2 py-1 border dark:border-gray-600 min-w-[300px]">SQL</th>
                <th className="px-2 py-1 border dark:border-gray-600 min-w-[130px]">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 text-black dark:text-gray-100">
              {rowDiff.map((diff, index) => (
                <tr key={index} className="border-t dark:border-gray-700">
                  {/* <td className="px-4 py-2 border dark:border-gray-700 text-xs break-words whitespace-pre-wrap">
                    {diff.type}
                  </td> */}
                  <td className="px-4 py-2 border dark:border-gray-700 text-xs break-all whitespace-pre-wrap">
                    {diff.key}
                  </td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-xs break-all whitespace-pre-wrap font-mono text-green-700 dark:text-green-400">
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language="json"
                        style={isDarkMode ? oneDark : oneLight}
                        wrapLongLines={true}
                        PreTag="div" // <- important: replaces <pre> so white-space rules can apply
                        codeTagProps={{
                          style: {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                          },
                        }}
                        customStyle={{
                          fontSize: "0.75rem",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
                          margin: 0,
                        }}
                      >
                        {JSON.stringify(diff.row, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  </td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-xs break-all whitespace-pre-wrap font-mono text-red-700 dark:text-red-400">
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language="json"
                        style={isDarkMode ? oneDark : oneLight}
                        wrapLongLines={true}
                        PreTag="div" // <- important: replaces <pre> so white-space rules can apply
                        codeTagProps={{
                          style: {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                          },
                        }}
                        customStyle={{
                          fontSize: "0.75rem",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
                          margin: 0,
                        }}
                      >
                        {diff.oldRow ? JSON.stringify(diff.oldRow, null, 2) : "—"}
                      </SyntaxHighlighter>
                    </div>
                  </td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-xs whitespace-pre-wrap break-all font-mono dark:text-indigo-300">
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language="sql"
                        style={isDarkMode ? oneDark : oneLight}
                        wrapLongLines={true}
                        PreTag="div" // <- important: replaces <pre> so white-space rules can apply
                        codeTagProps={{
                          style: {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                          },
                        }}
                        customStyle={{
                          fontSize: "0.75rem",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
                          margin: 0,
                        }}
                      >
                        {generateSQL(diff)}
                      </SyntaxHighlighter>
                    </div>
                    
                  </td>
                  <td className="px-4 py-2 border dark:border-gray-700 text-xs whitespace-pre-wrap break-all font-mono dark:text-indigo-300">
                    <button className={`${diff.buttonClass} text-white px-2 py-2 rounded`}
                    onClick={() => openModal(generateSQL(diff), diff)}>
                       {diff.type === "DELETE" ? (
                          <span className="flex items-center gap-1">
                            <Trash2 size={16} />
                            <span>from B</span>
                          </span>
                        ) : diff.type === "INSERT" ? (
                          <span className="flex items-center gap-1">
                            <Plus size={16} />
                            <span>to B</span>
                          </span>
                        ) : diff.type === "UPDATE" ? (
                          <span className="flex items-center gap-1">
                            <Edit size={16} />
                            <span>to B</span>
                          </span>
                        ) : null}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Total differences: {rowDiff.length}
          </p>
          {/* Modal */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onExecute={handleExecute}
            initialSQL={selectedSQL}
            >
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              SQL Query
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto text-gray-800 dark:text-gray-200">
              {selectedSQL}
            </pre>
          </Modal>
        </div>

      )}

    </>
  )}
</div>
);

}