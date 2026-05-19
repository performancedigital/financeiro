"use client";

import { useCallback, useRef, useState } from "react";
import type { AccountInput, ClientInput, ContractInput, PayableInput, ReceivableInput, TransactionInput } from "@/lib/validators";
import type { DbSnapshot } from "@/lib/db-types";

export function useAppStore() {
  const [store, setStore] = useState<DbSnapshot | null>(null);
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const response = await fetch("/api/snapshot", { cache: "no-store" });
    const data = (await response.json()) as DbSnapshot;
    setStore(data);
    loadingRef.current = false;
  }, []);

  const ensureLoaded = () => {
    if (store || loadingRef.current) return;
    void refresh();
  };

  const mutate = async (url: string, init: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    const data = await response.json();
    await refresh();
    return data;
  };

  return {
    store,
    ensureLoaded,
    refresh,
    createAccount: (payload: AccountInput) =>
      mutate("/api/accounts", { method: "POST", body: JSON.stringify(payload) }),
    deleteAccount: (id: string) => mutate(`/api/accounts/${id}`, { method: "DELETE" }),

    createTransaction: (payload: TransactionInput) =>
      mutate("/api/transactions", { method: "POST", body: JSON.stringify(payload) }),
    deleteTransaction: (id: string) => mutate(`/api/transactions/${id}`, { method: "DELETE" }),

    createClient: (payload: ClientInput) =>
      mutate("/api/clients", { method: "POST", body: JSON.stringify(payload) }),
    deleteClient: (id: string) => mutate(`/api/clients/${id}`, { method: "DELETE" }),

    createContract: (payload: ContractInput) =>
      mutate("/api/contracts", { method: "POST", body: JSON.stringify(payload) }),
    deleteContract: (id: string) => mutate(`/api/contracts/${id}`, { method: "DELETE" }),

    createReceivable: (payload: ReceivableInput) =>
      mutate("/api/receivables", { method: "POST", body: JSON.stringify(payload) }),
    markReceivablePaid: (id: string) => mutate(`/api/receivables/${id}/paid`, { method: "PATCH" }),
    deleteReceivable: (id: string) => mutate(`/api/receivables/${id}`, { method: "DELETE" }),

    createPayable: (payload: PayableInput) =>
      mutate("/api/payables", { method: "POST", body: JSON.stringify(payload) }),
    markPayablePaid: (id: string) => mutate(`/api/payables/${id}/paid`, { method: "PATCH" }),
    deletePayable: (id: string) => mutate(`/api/payables/${id}`, { method: "DELETE" }),
  };
}
