"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  AccountInput,
  ClientInput,
  ContractInput,
  PayableInput,
  ReceivableInput,
  TransactionInput,
} from "@/lib/validators";
import type { DbSnapshot } from "@/lib/db-types";

type StoreError = {
  message: string;
  status?: number;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    const err: StoreError = {
      message: (data as { error?: string }).error ?? "Falha na requisicao.",
      status: response.status,
    };
    throw err;
  }
  return data;
};

export function useAppStore() {
  const [store, setStore] = useState<DbSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StoreError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/snapshot", { cache: "no-store" });
      const data = await parseResponse<DbSnapshot>(response);
      setStore(data);
    } catch (e) {
      setError((e as StoreError) ?? { message: "Erro ao carregar dados." });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useMemo(
    () => () => {
      void load();
    },
    [load],
  );

  const mutate = async <T>(url: string, init: RequestInit): Promise<T> => {
    setError(null);
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    const data = await parseResponse<T>(response);
    refresh();
    return data;
  };

  return {
    store,
    loading,
    error,
    refresh,
    createAccount: (payload: AccountInput) =>
      mutate<{ ok: boolean }>("/api/accounts", { method: "POST", body: JSON.stringify(payload) }),
    deleteAccount: (id: string) => mutate<{ ok: boolean }>(`/api/accounts/${id}`, { method: "DELETE" }),

    createTransaction: (payload: TransactionInput) =>
      mutate<{ duplicate?: boolean }>("/api/transactions", { method: "POST", body: JSON.stringify(payload) }),
    deleteTransaction: (id: string) =>
      mutate<{ ok: boolean }>(`/api/transactions/${id}`, { method: "DELETE" }),

    createClient: (payload: ClientInput) =>
      mutate<{ ok: boolean }>("/api/clients", { method: "POST", body: JSON.stringify(payload) }),
    deleteClient: (id: string) => mutate<{ ok: boolean }>(`/api/clients/${id}`, { method: "DELETE" }),

    createContract: (payload: ContractInput) =>
      mutate<{ ok: boolean }>("/api/contracts", { method: "POST", body: JSON.stringify(payload) }),
    deleteContract: (id: string) =>
      mutate<{ ok: boolean }>(`/api/contracts/${id}`, { method: "DELETE" }),

    createReceivable: (payload: ReceivableInput) =>
      mutate<{ ok: boolean }>("/api/receivables", { method: "POST", body: JSON.stringify(payload) }),
    markReceivablePaid: (id: string) =>
      mutate<{ ok: boolean }>(`/api/receivables/${id}/paid`, { method: "PATCH" }),
    deleteReceivable: (id: string) =>
      mutate<{ ok: boolean }>(`/api/receivables/${id}`, { method: "DELETE" }),

    createPayable: (payload: PayableInput) =>
      mutate<{ ok: boolean }>("/api/payables", { method: "POST", body: JSON.stringify(payload) }),
    markPayablePaid: (id: string) =>
      mutate<{ ok: boolean }>(`/api/payables/${id}/paid`, { method: "PATCH" }),
    deletePayable: (id: string) =>
      mutate<{ ok: boolean }>(`/api/payables/${id}`, { method: "DELETE" }),

    importCsvPreview: (payload: { kind: string; csv: string; replaceAll?: boolean }) =>
      mutate<{
        ok: boolean;
        mode: "preview";
        rows: number;
        totals: Record<string, number>;
        sample: Array<Record<string, string>>;
      }>("/api/import/csv", {
        method: "POST",
        body: JSON.stringify({ ...payload, mode: "preview" }),
      }),
    importCsvCommit: (payload: { kind: string; csv: string; replaceAll?: boolean }) =>
      mutate<{ ok: boolean; mode: "commit"; importedRows: number }>("/api/import/csv", {
        method: "POST",
        body: JSON.stringify({ ...payload, mode: "commit" }),
      }),
    clearAllData: () => mutate<{ ok: boolean }>("/api/import/clear", { method: "POST" }),
  };
}
