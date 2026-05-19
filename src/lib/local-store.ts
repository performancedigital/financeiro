import type { Account, Client, Contract, Transaction } from "@/lib/app-types";
import type { AccountInput, ClientInput, ContractInput, TransactionInput } from "@/lib/validators";

export type AppStore = {
  accounts: Account[];
  transactions: Transaction[];
  clients: Client[];
  contracts: Contract[];
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
  accounts: [
    {
      id: "acc_sicoob",
      name: "Sicoob pessoal",
      type: "PERSONAL_HELBERT",
      institution: "SICOOB",
      balance: 6200,
    },
    {
      id: "acc_infinitepay",
      name: "InfinitePay empresa",
      type: "BUSINESS_AGENCY",
      institution: "INFINITEPAY",
      balance: 8700,
    },
  ],
  transactions: [
    {
      id: "txn_1",
      date: new Date().toISOString().slice(0, 10),
      direction: "INCOME",
      description: "Recebimento Educaminas",
      amount: 2800,
      accountId: "acc_infinitepay",
      category: "Receita de cliente",
      costCenter: "Agencia",
      clientId: "cli_educaminas",
      duplicateHash: `${new Date().toISOString().slice(0, 10)}|INCOME|2800.00|recebimento educaminas|acc_infinitepay`,
    },
  ],
  clients: [
    {
      id: "cli_educaminas",
      name: "Educaminas",
      status: "ACTIVE",
      monthlyValue: 2800,
      startDate: "2025-06-10",
    },
    {
      id: "cli_bias",
      name: "Bias Centro Educacional",
      status: "ACTIVE",
      monthlyValue: 2500,
      startDate: "2025-08-10",
    },
  ],
  contracts: [
    {
      id: "ctr_1",
      clientId: "cli_educaminas",
      title: "Gestao de trafego Educaminas",
      monthlyValue: 2800,
      startsAt: "2025-06-10",
      dueDay: 10,
      services: "Gestao de trafego, Consultoria",
    },
    {
      id: "ctr_2",
      clientId: "cli_bias",
      title: "Gestao de trafego Bias",
      monthlyValue: 2500,
      startsAt: "2025-08-10",
      dueDay: 12,
      services: "Gestao de trafego, Social media",
    },
  ],
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

export const softDeleteById = <T extends { id: string; deletedAt?: string }>(items: T[], id: string): T[] =>
  items.map((item) => (item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item));
