"use client";

import { ReactNode, useEffect, useState } from "react";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Zustand store provider
 */

export function StoreProvider({ children }: StoreProviderProps) {
  // Handle hydration mismatch with localStorage
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This ensures the code only runs on client
    setIsHydrated(true);
  }, []);

  // If not hydrated yet, render children but hide them to avoid UI flicker
  if (!isHydrated) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}
