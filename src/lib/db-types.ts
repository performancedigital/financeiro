export type AccountType =
  | "PERSONAL_HELBERT"
  | "HOUSEHOLD"
  | "PERSONAL_LEIDIANE"
  | "BUSINESS_AGENCY"
  | "TRAVEL_EXTRA"
  | "DEBT"
  | "REIMBURSEMENT"
  | "WORKING_CAPITAL";

export type FinancialInstitution =
  | "SICOOB"
  | "NUBANK"
  | "CAIXA"
  | "BRADESCO"
  | "MERCADO_PAGO"
  | "INFINITEPAY"
  | "COMPANY_ACCOUNT"
  | "CASH"
  | "OTHER";

export type TransactionDirection = "INCOME" | "EXPENSE";
export type ClientStatus = "ACTIVE" | "STANDBY" | "DELINQUENT" | "CANCELED" | "PROSPECT";
export type ReceivableStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELED" | "RENEGOTIATED";
export type PayableStatus = "OPEN" | "PAID" | "OVERDUE" | "INSTALMENT" | "RENEGOTIATED" | "SUSPENDED";
export type PayableType = "FIXED" | "VARIABLE" | "RECURRING" | "EXTRAORDINARY" | "DEBT" | "INVESTMENT";

export type AccountRow = {
  id: string;
  name: string;
  type: AccountType;
  institution: FinancialInstitution;
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

export type DbSnapshot = {
  accounts: AccountRow[];
  transactions: TransactionRow[];
  clients: ClientRow[];
  contracts: ContractRow[];
  receivables: ReceivableRow[];
  payables: PayableRow[];
};
