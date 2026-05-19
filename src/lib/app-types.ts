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

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  institution: FinancialInstitution;
  balance: number;
  deletedAt?: string;
};

export type Transaction = {
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
  deletedAt?: string;
};

export type Client = {
  id: string;
  name: string;
  status: ClientStatus;
  monthlyValue: number;
  startDate: string;
  deletedAt?: string;
};

export type Contract = {
  id: string;
  clientId: string;
  title: string;
  monthlyValue: number;
  startsAt: string;
  dueDay: number;
  services: string;
  deletedAt?: string;
};
