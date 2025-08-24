"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
const [questionType, setQuestionType] = useState(""); // dropdown selection
const [question, setQuestion] = useState("");         // actual question text
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, question, answer }),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error || "Registration failed");
    else {
      setSuccess("Registration successful! You can now login.");
      setTimeout(() => router.push("/"), 1500);
    }
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
    
    <div className="flex items-center justify-center h-screen bg-gray-50">
              {/* Particles background */}
      <div id="particles-js" className="absolute inset-0 z-0 w-full"></div>
      <div className="relative z-10 bg-white/60 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        <div className="mb-1">
          <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
            type="text"
            placeholder="Name"
            className="w-full border rounded px-3 py-2 mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
        </div>
        <div className="mb-1">
          <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2 mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <div className="mb-1">
          <label className="block mb-1 font-medium text-gray-700">Question</label>
        <select
          className="w-full border rounded px-3 py-2 mb-3"
          value={questionType}
          onChange={(e) => {
            setQuestionType(e.target.value);
            if (e.target.value !== "Custom") {
              setQuestion(e.target.value); // set directly if not custom
            } else {
              setQuestion(""); // reset for custom
            }
          }}
        >
          <option value="">Select a secret question</option>
          <option value="What is your first pet’s name?">What is your first pet’s name?</option>
          <option value="What is your first school name?">What is your first school name?</option>
          <option value="In which city were you born?">In which city were you born?</option>
          <option value="Custom">Custom (type below)</option>
        </select>

        {questionType === "Custom" && (
          <input
            type="text"
            placeholder="Enter your custom question"
            className="w-full border rounded px-3 py-2 mb-3"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        )}
      </div>
        <div className="mb-1">
          <label className="block mb-1 font-medium text-gray-700">Answer</label>
          <input
            type="text"
            placeholder="Answer"
            className="w-full border rounded px-3 py-2 mb-4"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <div className="flex justify-center space-x-6 mt-4">
            <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
            Cancel
            </button>

            <button
            onClick={handleRegister}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
            Register
            </button>
        </div>
      </div>
    </div>
  );
}
