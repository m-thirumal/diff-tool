"use client";

import { useRouter } from "next/navigation";
import { Home, ArrowLeft, ClipboardList, LogOut  } from "lucide-react";

export default function TopNav({ title }) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 bg-indigo-600 dark:bg-indigo-700 px-4 py-3 flex items-center justify-between shadow-sm">      {/* Left: Title */}
      <div className="flex items-center gap-3">
        {/* Home Button */}
        <button
          onClick={() => router.push("/environment")}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition"        >
          <Home size={18} />
          Home
        </button>
        {/* 🔹 Audit Logs Button */}
        <button
          onClick={() => router.push("/audit")}
            className="flex gap-2 rounded-lg bg-indigo-500 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition">
            <ClipboardList size={18} />
            Audit Logs
        </button>
      </div>
      {/* Title */}
      <h1 className="text-lg font-semibold text-white text-center flex-1">
        {title}
      </h1>


      {/* Right: Buttons */}
      <div className="flex gap-3">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition">          <ArrowLeft size={18} />
          Back
        </button>
      {/* Logout Button */}
       <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>

 
      </div>
    </div>
  );
}
