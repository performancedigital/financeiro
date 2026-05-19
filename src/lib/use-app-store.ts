"use client";

import { useState } from "react";
import { getStore, saveStore, type AppStore } from "@/lib/local-store";

export function useAppStore() {
  const [store, setStore] = useState<AppStore>(() => getStore());

  const update = (next: AppStore) => {
    setStore(next);
    saveStore(next);
  };

  return { store, update };
}
