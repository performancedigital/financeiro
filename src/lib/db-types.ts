export type TransactionDirection = "INCOME" | "EXPENSE";
export type ClientStatus = "ACTIVE" | "STANDBY" | "DELINQUENT" | "CANCELED" | "PROSPECT";
export type ReceivableStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELED" | "RENEGOTIATED";
export type PayableStatus = "OPEN" | "PAID" | "OVERDUE" | "INSTALMENT" | "RENEGOTIATED" | "SUSPENDED";
export type PayableType = "FIXED" | "VARIABLE" | "RECURRING" | "EXTRAORDINARY" | "DEBT" | "INVESTMENT";

export type AccountRow = {
  id: string;
  name: string;
  type: string;        // era AccountType
  institution: string; // era FinancialInstitution
  balance: number;
};

export type TransactionRow = {
  id: string;
  date: string;
  direction: TransactionDirection;
  description: string;
  amount: number;
  accountId: string;
  category: string;
  costCenter: string;
  clientId?: string;
  duplicateHash: string;
};

export type ClientRow = {
  id: string;
  name: string;
  status: ClientStatus;
  monthlyValue: number;
  startDate: string;
};

export type ContractRow = {
  id: string;
  clientId: string;
  title: string;
  monthlyValue: number;
  startsAt: string;
  dueDay: number;
  services: string;
};

export type ReceivableRow = {
  id: string;
  clientId: string;
  competency: string;
  expectedAmount: number;
  receivedAmount: number;
  expectedDate: string;
  receivedDate?: string;
  status: ReceivableStatus;
  accountId?: string;
  notes?: string;
};

export type PayableRow = {
  id: string;
  description: string;
  provider?: string;
  category: string;
  costCenter: string;
  amount: number;
  dueDate: string;
  status: PayableStatus;
  type: PayableType;
  accountId?: string;
  notes?: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  isIncome: boolean;
  color?: string;
};

export type CostCenterRow = {
  id: string;
  name: string;
};

export type WorkspaceOptionRow = {
  id: string;
  kind: string;
  value: string;
  label: string;
  sortOrder: number;
};

export type DbSnapshot = {
  accounts: AccountRow[];
  transactions: TransactionRow[];
  clients: ClientRow[];
  contracts: ContractRow[];
  receivables: ReceivableRow[];
  payables: PayableRow[];
  categories: CategoryRow[];
  costCenters: CostCenterRow[];
  workspaceOptions: WorkspaceOptionRow[];
};
