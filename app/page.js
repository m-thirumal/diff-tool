"use client";

import { useState, useEffect } from "react";
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
    else router.push("/environment");
  };

  useEffect(() => {
    // dynamically load particles.js from CDN
    const script = document.createElement("script");
    script.src = "/js/particles.min.js";
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS.load(
          "particles-js", // div id
          "/particles.json", // JSON config
          function () {
            console.log("Particles.js config loaded");
          }
        );
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Particles background */}
      <div id="particles-js" className="absolute inset-0 z-0 w-full"></div>

      {/* Login Form */}
      <div className="relative z-10 p-6 bg-white/60 shadow-lg rounded-lg w-100 h-100 mx-auto my-auto top-1/2 -translate-y-1/2">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login / Register</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-800 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-800 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
        <div className="flex justify-center space-x-4 mt-4">
          <p
            className="text-left text-sm mt-1 text-blue-800 cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            New User? Register here
          </p>
          <p
            className="text-righ text-sm mt-1 text-blue-800 cursor-pointer hover:underline"
            onClick={() => router.push("/reset-password")}
          >
            Forgot password?
          </p>
      </div>
      </div>
    </div>
  );
}
