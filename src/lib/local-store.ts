import type { Account, Client, Contract, Payable, Receivable, Transaction } from "@/lib/app-types";
import type {
  AccountInput,
  ClientInput,
  ContractInput,
  PayableInput,
  ReceivableInput,
  TransactionInput,
} from "@/lib/validators";

export type AppStore = {
  accounts: Account[];
  transactions: Transaction[];
  clients: Client[];
  contracts: Contract[];
  receivables: Receivable[];
  payables: Payable[];
};

const KEY = "cc_store_v1";

const nowId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const buildDuplicateHash = (input: TransactionInput) =>
  [
    input.date.slice(0, 10),
    input.direction,
    Number(input.amount).toFixed(2),
    input.description.trim().toLowerCase(),
    input.accountId,
  ].join("|");

export const initialStore: AppStore = {
  accounts: [],
  transactions: [],
  clients: [],
  contracts: [],
  receivables: [],
  payables: [],
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const getStore = (): AppStore => {
  if (typeof window === "undefined") return clone(initialStore);
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(initialStore));
    return clone(initialStore);
  }
  try {
    return JSON.parse(raw) as AppStore;
  } catch {
    window.localStorage.setItem(KEY, JSON.stringify(initialStore));
    return clone(initialStore);
  }
};

export const saveStore = (store: AppStore) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
};

export const addAccountToStore = (store: AppStore, input: AccountInput): AppStore => {
  const account: Account = { id: nowId("acc"), ...input };
  return { ...store, accounts: [account, ...store.accounts] };
};

export const addTransactionToStore = (store: AppStore, input: TransactionInput): { store: AppStore; duplicate: boolean } => {
  const duplicateHash = buildDuplicateHash(input);
  const duplicate = store.transactions.some((tx) => !tx.deletedAt && tx.duplicateHash === duplicateHash);
  if (duplicate) return { store, duplicate: true };
  const tx: Transaction = {
    id: nowId("txn"),
    ...input,
    duplicateHash,
  };
  return { store: { ...store, transactions: [tx, ...store.transactions] }, duplicate: false };
};

export const addClientToStore = (store: AppStore, input: ClientInput): AppStore => {
  const client: Client = { id: nowId("cli"), ...input };
  return { ...store, clients: [client, ...store.clients] };
};

export const addContractToStore = (store: AppStore, input: ContractInput): AppStore => {
  const contract: Contract = { id: nowId("ctr"), ...input };
  return { ...store, contracts: [contract, ...store.contracts] };
};

export const addReceivableToStore = (store: AppStore, input: ReceivableInput): AppStore => {
  const receivable: Receivable = { id: nowId("rec"), ...input };
  return { ...store, receivables: [receivable, ...store.receivables] };
};

export const addPayableToStore = (store: AppStore, input: PayableInput): AppStore => {
  const payable: Payable = { id: nowId("pay"), ...input };
  return { ...store, payables: [payable, ...store.payables] };
};

export const softDeleteById = <T extends { id: string; deletedAt?: string }>(items: T[], id: string): T[] =>
  items.map((item) => (item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item));
