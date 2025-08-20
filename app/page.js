"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const body = { name, password };

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error || "Something went wrong");
    else router.push("/environment"); // navigate to environment page after login
  };

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="p-6 bg-white shadow-lg rounded-lg w-80">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login / Register</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Submit
      </button>
    </div>
  </div>
);

}
