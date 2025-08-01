"use client";

import { createContext, useContext, useState } from "react";

const defaultPayload = {
  dbType: "PostgreSQL", //MySQL
  envA: {
    host: "",
    port: "3306",
    db: "",
    user: "",
    password: "",
  },
  envB: {
    host: "",
    port: "3306",
    db: "",
    user: "",
    password: "",
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
