"use client";

import { createContext, useContext, useState } from "react";

// 1. Create context
const DbContext = createContext();

// 2. Provider component
export const DbProvider = ({ children }) => {
  const [dbDetails, setDbDetails] = useState({
    dbType: "",
    envA: {},
    envB: {},
  });

  return (
    <DbContext.Provider value={{ dbDetails, setDbDetails }}>
      {children}
    </DbContext.Provider>
  );
};

// 3. Custom hook for easy access
export const useDb = () => useContext(DbContext);
