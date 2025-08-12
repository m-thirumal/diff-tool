"use client";

import { createContext, useContext, useState } from "react";

const defaultPayload = {
  dbType: "PostgreSQL", //MySQL
  envA: {
    name: "DEV",
    host: "localhost",
    port: "5432",
    db: "dev",
    user: "postgres",
    password: "thirumal",
  },
  envB: {
    name: "PRO",
    host: "localhost",
    port: "5432",
    db: "pro",
    user: "postgres",
    password: "thirumal",
  },
  envC: {
    host: "UAT",
    port: "5432",
    db: "uat",
    user: "postgres",
    password: "thirumal",
  },
};

// 1. Create context
const DbContext = createContext();

// 2. Provider component
export const DbProvider = ({ children }) => {
  const [payload, setPayload] = useState(defaultPayload);

  return (
    <DbContext.Provider value={{ payload, setPayload }}>
      {children}
    </DbContext.Provider>
  );
};

// 3. Custom hook for easy access
export const useDb = () => useContext(DbContext);
