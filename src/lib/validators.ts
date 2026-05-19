import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail valido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const accountSchema = z.object({
  name: z.string().min(2, "Nome da conta obrigatorio."),
  type: z.enum([
    "PERSONAL_HELBERT",
    "HOUSEHOLD",
    "PERSONAL_LEIDIANE",
    "BUSINESS_AGENCY",
    "TRAVEL_EXTRA",
    "DEBT",
    "REIMBURSEMENT",
    "WORKING_CAPITAL",
  ]),
  institution: z.enum([
    "SICOOB",
    "NUBANK",
    "CAIXA",
    "BRADESCO",
    "MERCADO_PAGO",
    "INFINITEPAY",
    "COMPANY_ACCOUNT",
    "CASH",
    "OTHER",
  ]),
  balance: z.coerce.number().finite(),
});

export const transactionSchema = z.object({
  date: z.string().min(1),
  direction: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(2),
  amount: z.coerce.number().positive(),
  accountId: z.string().min(1),
  category: z.string().min(2),
  costCenter: z.string().min(2),
  clientId: z.string().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(2),
  status: z.enum(["ACTIVE", "STANDBY", "DELINQUENT", "CANCELED", "PROSPECT"]),
  monthlyValue: z.coerce.number().nonnegative(),
  startDate: z.string().min(1),
});

export const contractSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(3),
  monthlyValue: z.coerce.number().positive(),
  startsAt: z.string().min(1),
  dueDay: z.coerce.number().int().min(1).max(31),
  services: z.string().min(2),
});

export const receivableSchema = z.object({
  clientId: z.string().min(1),
  competency: z.string().min(1),
  expectedAmount: z.coerce.number().positive(),
  receivedAmount: z.coerce.number().nonnegative().default(0),
  expectedDate: z.string().min(1),
  receivedDate: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "PARTIAL", "OVERDUE", "CANCELED", "RENEGOTIATED"]),
  accountId: z.string().optional(),
  notes: z.string().optional(),
});

export const payableSchema = z.object({
  description: z.string().min(2),
  provider: z.string().optional(),
  category: z.string().min(2),
  costCenter: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
  status: z.enum(["OPEN", "PAID", "OVERDUE", "INSTALMENT", "RENEGOTIATED", "SUSPENDED"]),
  type: z.enum(["FIXED", "VARIABLE", "RECURRING", "EXTRAORDINARY", "DEBT", "INVESTMENT"]),
  accountId: z.string().optional(),
  notes: z.string().optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type ReceivableInput = z.infer<typeof receivableSchema>;
export type PayableInput = z.infer<typeof payableSchema>;
