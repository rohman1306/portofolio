"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRealtimePriceSync } from "@/features/holdings/hooks/useRealtimePriceSync";

interface PriceSyncContextType {
  refreshPrices: () => Promise<void>;
  refreshing: boolean;
}

const PriceSyncContext = createContext<PriceSyncContextType>({
  refreshPrices: async () => {},
  refreshing: false,
});

export function PriceSyncProvider({ children }: { children: ReactNode }) {
  const sync = useRealtimePriceSync();
  return <PriceSyncContext.Provider value={sync}>{children}</PriceSyncContext.Provider>;
}

export function usePriceSync() {
  return useContext(PriceSyncContext);
}
