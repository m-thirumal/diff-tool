import { useState } from "react";

export default function ExpandableCell({ text, maxLength = 80, copyable = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return <span className="text-gray-400 italic">NULL</span>;

  const isLong = text.length > maxLength;
  const displayText = expanded || !isLong ? text : text.slice(0, maxLength) + "…";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-[400px] whitespace-pre-wrap break-words flex items-start gap-2">
      <span>{displayText}</span>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:underline text-xs"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
      {copyable && (
        <button
          onClick={copyToClipboard}
          className="text-green-600 hover:underline text-xs"
        >
          Copy
        </button>
      )}
    </div>
  );
}
