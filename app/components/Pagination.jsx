"use client";
import { useState } from "react";

export default function Pagination({
  totalItems,
  itemsPerPageOptions = [10, 20, 30],
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setItemsPerPage(value);
    onItemsPerPageChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white sticky bottom-0 z-40 border-t shadow-md">
      {/* Items per page */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <label className="font-medium">Items per page:</label>
        <select
          value={itemsPerPage}
          onChange={handlePerPageChange}
          className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {itemsPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-gray-600">
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⏮
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="px-3">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
