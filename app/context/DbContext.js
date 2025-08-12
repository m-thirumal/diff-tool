"use client";

import { createContext, useContext, useState } from "react";

const defaultPayload = {
  dbType: "PostgreSQL", //MySQL
  envA: {
    name: process.env.NEXT_PUBLIC_ENV_A_NAME,
    host: process.env.NEXT_PUBLIC_DB_DEV_HOST,
    port: process.env.NEXT_PUBLIC_DB_DEV_PORT,
    db: process.env.NEXT_PUBLIC_DB_DEV_NAME,
    user: process.env.NEXT_PUBLIC_DB_DEV_USER,
    password: process.env.NEXT_PUBLIC_DB_DEV_PASS
  },
  envB: {
    name: process.env.NEXT_PUBLIC_ENV_B_NAME,
    host: process.env.NEXT_PUBLIC_DB_PROD_HOST,
    port: process.env.NEXT_PUBLIC_DB_PROD_PORT,
    db: process.env.NEXT_PUBLIC_DB_PROD_NAME,
    user: process.env.NEXT_PUBLIC_DB_PROD_USER,
    password: process.env.NEXT_PUBLIC_DB_PROD_PASS,
  }
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
