"use client";

import { AppStoreProvider } from "@/lib/store-context";

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}
