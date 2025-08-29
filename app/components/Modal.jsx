// components/Modal.jsx
import { useState, useEffect } from "react";
import AceEditor from "react-ace";

// Import Ace Editor SQL mode & themes
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";

export default function Modal({ isOpen, onClose, onExecute, initialSQL }) {
  const [sqlText, setSqlText] = useState(initialSQL);
  const [copied, setCopied] = useState(false); // ✅ Copy state

  useEffect(() => {
    setSqlText(initialSQL);
  }, [initialSQL, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-[9999]">
      <div className="bg-gray-500 text-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[300vh] overflow-auto relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-800 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          SQL Query
        </h3>

        {/* SQL Code Editor */}
        <AceEditor
          mode="sql"
          theme={document.documentElement.classList.contains("dark") ? "monokai" : "github"}
          value={sqlText}
          onChange={(val) => setSqlText(val)}
          name="sql-editor"
          fontSize={16}
          width="100%"
          height="500px"
          wrapEnabled={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            showLineNumbers: true,
            tabSize: 2,
            wrap: true, // ✅ enables line wrapping
            indentedSoftWrap: false
          }}
          className="border border-gray-300 dark:border-gray-700 rounded"
        />

        {/* Footer buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-400 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
           <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {copied ? "Copied ✅" : "Copy"}
          </button>
          <button
            onClick={() => onExecute(sqlText)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
