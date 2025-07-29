"use client";

import { useState } from "react";

export default function Home() {
  const dbTypes = ['PostgreSQL', 'MySQL'];
  const [dbType, setDbType] = useState('PostgreSQL');
  const [envA, setEnvA] = useState({ host: "", port: "", user: "", password: "", db: "" });
  const [envB, setEnvB] = useState({ host: "", port: "", user: "", password: "", db: "" });

  const handleEnvChange = (setEnv, field, value) => {
    setEnv((prev) => ({ ...prev, [field]: value }));
  };

  return (
   <div className="p-8 font-sans">
      <center><h1 className="text-2xl font-bold mb-6">Database Comparison Tool</h1></center>
      <div className="mb-8">
        <label className="font-medium" htmlFor="dbType">Select Database Type:</label>
        <select className="ml-4 border border-gray-300 rounded px-2 py-1" value={dbType} onChange={e => setDbType(e.target.value)}>
          {dbTypes.map(type => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>
      <hr />
      <div className="flex flex-col md:flex-row gap-12">
        <div style={{ flex: 1 }}>
          <h2 className="text-xl font-semibold mb-4">Environment A</h2>
          {renderEnvInputs(envA, setEnvA, "envA")}
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="text-xl font-semibold mb-4">Environment B</h2>
          {renderEnvInputs(envB, setEnvB, "envB")}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button 
          className="mt-8 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            console.log("Selected DB Type:", dbType);
            console.log("Env A:", envA);
            console.log("Env B:", envB);
          }}
        >
          Continue to Compare
        </button>
      </div>
   </div>
  );
}

function renderEnvInputs(env, setEnv, prefix) {
  const fields = [
    { name: "host", label: "Host / IP" },
    { name: "port", label: "Port" },
    { name: "db", label: "Database Name" },
    { name: "user", label: "Username" },
    { name: "password", label: "Password", type: "password" },
  ];

  return fields.map((field) => (
    <div key={field.name} className="flex items-center mb-4">
      <label
        htmlFor={`${prefix}-${field.name}`}
        className="w-40 font-medium text-gray-700"
      >
        {field.label}
      </label>
      <input
        id={`${prefix}-${field.name}`}
        type={field.type || "text"}
        placeholder={field.label}
        value={env[field.name]}
        onChange={(e) =>
          setEnv((prev) => ({ ...prev, [field.name]: e.target.value }))
        }
        className="flex-1 border border-gray-300 rounded px-3 py-1"
      />
    </div>
  ));
}