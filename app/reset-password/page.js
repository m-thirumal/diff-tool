"use client";

import { useState, useEffect } from "react";

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchQuestion = async () => {
    setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 1, name }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else {
      setQuestion(data.secret_question);
      setStep(2);
    }
  };

  const resetPassword = async () => {
    setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 2, name, answer, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setSuccess("Password reset successful!");
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
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* Particles background */}
      <div id="particles-js" className="absolute inset-0 z-0 w-full"></div>

      {/* Reset form container */}
      <div className="relative z-10 p-6 bg-white/70 shadow-lg rounded-lg text-center w-96">
        {success ? (
          <p className="text-green-600 text-lg">{success}</p>
        ) : step === 1 ? (
          <>
            <h2 className="text-2xl mb-4 font-bold text-gray-800">Enter your username</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
              className="mb-4 px-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              onClick={fetchQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded w-full hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl mb-4 font-bold text-gray-800">Enter answer for {question}</h2>
            <div className="text-left">
              <div className="mb-1">
                <label className="block mb-1 font-medium text-gray-700">Answer</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Answer"
                  className="mb-3 px-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-1">
                <label className="block mb-1 font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                className="mb-3 px-3 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              </div>
            </div>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              onClick={resetPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded w-full hover:bg-blue-700 transition-colors"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
