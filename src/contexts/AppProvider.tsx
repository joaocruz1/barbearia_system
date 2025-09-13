"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { DataProvider } from "./DataContext";
import { CashFlowProvider } from "./CashFlowContext";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <DataProvider>
        <CashFlowProvider>{children}</CashFlowProvider>
      </DataProvider>
    </AuthProvider>
  );
}
