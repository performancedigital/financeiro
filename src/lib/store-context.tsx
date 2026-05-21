"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AccountInput,
  ClientInput,
  ContractInput,
  DebtInput,
  DocumentInput,
  PayableInput,
  ReceivableInput,
  TransactionInput,
} from "@/lib/validators";
import type { DbSnapshot } from "@/lib/db-types";

type StoreError = { message: string; status?: number };

type AppStoreContextType = {
  store: DbSnapshot | null;
  loading: boolean;
  error: StoreError | null;
  refresh: () => void;
  createAccount: (payload: AccountInput) => Promise<{ ok: boolean }>;
  deleteAccount: (id: string) => Promise<{ ok: boolean }>;
  createTransaction: (payload: TransactionInput) => Promise<{ duplicate?: boolean }>;
  deleteTransaction: (id: string) => Promise<{ ok: boolean }>;
  createClient: (payload: ClientInput) => Promise<{ ok: boolean }>;
  deleteClient: (id: string) => Promise<{ ok: boolean }>;
  createContract: (payload: ContractInput) => Promise<{ ok: boolean }>;
  deleteContract: (id: string) => Promise<{ ok: boolean }>;
  createReceivable: (payload: ReceivableInput) => Promise<{ ok: boolean }>;
  markReceivablePaid: (id: string) => Promise<{ ok: boolean }>;
  deleteReceivable: (id: string) => Promise<{ ok: boolean }>;
  createPayable: (payload: PayableInput) => Promise<{ ok: boolean }>;
  markPayablePaid: (id: string) => Promise<{ ok: boolean }>;
  deletePayable: (id: string) => Promise<{ ok: boolean }>;
  importCsvPreview: (payload: { kind: string; csv: string; replaceAll?: boolean }) => Promise<{
    ok: boolean; mode: "preview"; rows: number;
    totals: Record<string, number>; sample: Array<Record<string, string>>;
  }>;
  importCsvCommit: (payload: { kind: string; csv: string; replaceAll?: boolean }) => Promise<{
    ok: boolean; mode: "commit"; importedRows: number;
  }>;
  clearAllData: () => Promise<{ ok: boolean }>;
  createCategory: (name: string, isIncome: boolean) => Promise<{ ok: boolean }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean }>;
  createCostCenter: (name: string) => Promise<{ ok: boolean }>;
  deleteCostCenter: (id: string) => Promise<{ ok: boolean }>;
  createWorkspaceOption: (kind: string, value: string, label: string) => Promise<{ ok: boolean }>;
  deleteWorkspaceOption: (id: string) => Promise<{ ok: boolean }>;
  createDebt: (payload: DebtInput) => Promise<{ ok: boolean }>;
  deleteDebt: (id: string) => Promise<{ ok: boolean }>;
  createDocument: (payload: DocumentInput) => Promise<{ ok: boolean }>;
  deleteDocument: (id: string) => Promise<{ ok: boolean }>;
  smartImport: (csv: string) => Promise<{ imported: number; skipped: number; errors: string[] }>;
};

const AppStoreContext = createContext<AppStoreContextType | null>(null);

const parseResponse = async <T,>(response: Response): Promise<T> => {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw { message: (data as { error?: string }).error ?? "Falha na requisicao.", status: response.status };
  }
  return data;
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const refresh = useCallback(() => { void load(); }, [load]);

  const mutate = useCallback(async <T,>(url: string, init: RequestInit): Promise<T> => {
    setError(null);
    const response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    const data = await parseResponse<T>(response);
    void load();
    return data;
  }, [load]);

  const value: AppStoreContextType = useMemo(() => ({
    store, loading, error, refresh,
    createAccount: (p) => mutate("/api/accounts", { method: "POST", body: JSON.stringify(p) }),
    deleteAccount: (id) => mutate(`/api/accounts/${id}`, { method: "DELETE" }),
    createTransaction: (p) => mutate("/api/transactions", { method: "POST", body: JSON.stringify(p) }),
    deleteTransaction: (id) => mutate(`/api/transactions/${id}`, { method: "DELETE" }),
    createClient: (p) => mutate("/api/clients", { method: "POST", body: JSON.stringify(p) }),
    deleteClient: (id) => mutate(`/api/clients/${id}`, { method: "DELETE" }),
    createContract: (p) => mutate("/api/contracts", { method: "POST", body: JSON.stringify(p) }),
    deleteContract: (id) => mutate(`/api/contracts/${id}`, { method: "DELETE" }),
    createReceivable: (p) => mutate("/api/receivables", { method: "POST", body: JSON.stringify(p) }),
    markReceivablePaid: (id) => mutate(`/api/receivables/${id}/paid`, { method: "PATCH" }),
    deleteReceivable: (id) => mutate(`/api/receivables/${id}`, { method: "DELETE" }),
    createPayable: (p) => mutate("/api/payables", { method: "POST", body: JSON.stringify(p) }),
    markPayablePaid: (id) => mutate(`/api/payables/${id}/paid`, { method: "PATCH" }),
    deletePayable: (id) => mutate(`/api/payables/${id}`, { method: "DELETE" }),
    importCsvPreview: (p) => mutate("/api/import/csv", { method: "POST", body: JSON.stringify({ ...p, mode: "preview" }) }),
    importCsvCommit: (p) => mutate("/api/import/csv", { method: "POST", body: JSON.stringify({ ...p, mode: "commit" }) }),
    clearAllData: () => mutate("/api/import/clear", { method: "POST" }),
    createCategory: (name, isIncome) => mutate("/api/categories", { method: "POST", body: JSON.stringify({ name, isIncome }) }),
    deleteCategory: (id) => mutate(`/api/categories/${id}`, { method: "DELETE" }),
    createCostCenter: (name) => mutate("/api/cost-centers", { method: "POST", body: JSON.stringify({ name }) }),
    deleteCostCenter: (id) => mutate(`/api/cost-centers/${id}`, { method: "DELETE" }),
    createWorkspaceOption: (kind, value, label) =>
      mutate("/api/workspace-options", { method: "POST", body: JSON.stringify({ kind, value, label }) }),
    deleteWorkspaceOption: (id) =>
      mutate(`/api/workspace-options/${id}`, { method: "DELETE" }),
    createDebt: (p) => mutate("/api/debts", { method: "POST", body: JSON.stringify(p) }),
    deleteDebt: (id) => mutate(`/api/debts/${id}`, { method: "DELETE" }),
    createDocument: (p) => mutate("/api/documents", { method: "POST", body: JSON.stringify(p) }),
    deleteDocument: (id) => mutate(`/api/documents/${id}`, { method: "DELETE" }),
    smartImport: (csv) => mutate("/api/import/smart", { method: "POST", body: JSON.stringify({ csv }) }),
  }), [store, loading, error, refresh, mutate]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreContextType {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
