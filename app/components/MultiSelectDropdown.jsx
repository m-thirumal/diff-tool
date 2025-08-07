// components/MultiSelectDropdown.jsx
import { useState, useRef, useEffect } from "react";

export default function MultiSelectDropdown({ options, selectedValues, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
  <div className="relative w-64" ref={dropdownRef}>
    <div
      className="border px-3 py-2 rounded cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-600"
      onClick={() => setIsOpen(!isOpen)}
    >
      {selectedValues.length > 0 ? selectedValues.join(", ") : "Select column(s)"}
    </div>

    {isOpen && (
      <div className="absolute left-0 right-0 z-[999] mt-1 max-h-60 overflow-auto border rounded bg-white dark:bg-gray-900 dark:border-gray-700 shadow-lg">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <input
              type="checkbox"
              className="mr-2"
              checked={selectedValues.includes(option)}
              onChange={() => toggleValue(option)}
            />
            {option}
          </label>
        ))}
      </div>
    )}
  </div>
  );
}
