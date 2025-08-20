"use client";

import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";

export default function TopNav({ title }) {
  const router = useRouter();

  return (
<div className="sticky top-0 z-50 bg-indigo-600 dark:bg-indigo-700 px-4 py-3 flex items-center justify-between shadow-sm">      {/* Left: Title */}
      <h1 className="text-lg font-semibold text-white dark:text-gray-200">
        {title}
      </h1>

      {/* Right: Buttons */}
      <div className="flex gap-3">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition"        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Home Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition"        >
          <Home size={18} />
          Home
        </button>
      </div>
    </div>
  );
}
