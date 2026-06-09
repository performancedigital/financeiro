import { prisma } from "@/lib/prisma";
import type {
  AccountRow,
  BudgetRow,
  CategoryRow,
  ClientRow,
  ContractRow,
  CostCenterRow,
  DbSnapshot,
  DebtRow,
  DocumentRow,
  GoalRow,
  InvestmentRow,
  PayableRow,
  ReceivableRow,
  TransactionRow,
  WorkspaceOptionRow,
} from "@/lib/db-types";
import type { SessionPayload } from "@/lib/auth";
import type {
  AccountInput,
  BudgetInput,
  ClientInput,
  ContractInput,
  DebtInput,
  DocumentInput,
  GoalInput,
  InvestmentInput,
  PayableInput,
  ReceivableInput,
  TransactionInput,
} from "@/lib/validators";

const getWorkspaceId = (session: SessionPayload) => session.workspaceId;

const ensureWorkspace = async (workspaceId: string) => {
  await prisma.workspace.upsert({
    where: { id: workspaceId },
    update: {},
    create: { id: workspaceId, name: "CaixaComando" },
  });
};

const ensureCategory = async (workspaceId: string, name: string, isIncome: boolean) => {
  const slug = name.trim().toLowerCase().replaceAll(" ", "_");
  const existing = await prisma.category.findFirst({
    where: { workspaceId, slug, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.category.create({
    data: {
      workspaceId,
      name,
      slug,
      isIncome,
      color: isIncome ? "#16A34A" : "#DC2626",
    },
  });
};

const ensureCostCenter = async (workspaceId: string, name: string) => {
  const existing = await prisma.costCenter.findFirst({
    where: { workspaceId, name, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.costCenter.create({
    data: { workspaceId, name },
  });
};

export const getSnapshot = async (session: SessionPayload): Promise<DbSnapshot> => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);

  const [accounts, clients, contracts, transactions, receivables, payables, categories, costCenters, workspaceOptions, debts, documents, investments, goals, budgets] = await Promise.all([
    prisma.account.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.contract.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.transaction.findMany({
      where: { workspaceId, deletedAt: null, direction: { in: ["INCOME", "EXPENSE"] } },
      include: { category: true, costCenter: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.receivable.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.payable.findMany({
      where: { workspaceId, deletedAt: null },
      include: { category: true, costCenter: true, provider: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.costCenter.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.workspaceOption.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    }),
    prisma.debt.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.document.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.investment.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.goal.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.budget.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { category: "asc" } }),
  ]);

  const accountRows: AccountRow[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    institution: a.institution,
    balance: Number(a.balance),
  }));

  const clientRows: ClientRow[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    monthlyValue: Number(c.monthlyContract),
    startDate: (c.startDate ?? c.createdAt).toISOString().slice(0, 10),
  }));

  const contractRows: ContractRow[] = contracts.map((c) => ({
    id: c.id,
    clientId: c.clientId,
    title: c.title,
    monthlyValue: Number(c.monthlyValue),
    startsAt: c.startsAt.toISOString().slice(0, 10),
    dueDay: c.dueDay,
    services: c.notes ?? c.services.join(", "),
  }));

  const txRows: TransactionRow[] = transactions.map((t) => ({
    id: t.id,
    date: t.transactionAt.toISOString().slice(0, 10),
    direction: t.direction as "INCOME" | "EXPENSE",
    description: t.description,
    amount: Number(t.amount),
    accountId: t.accountId ?? "",
    category: t.category?.name ?? "Sem categoria",
    costCenter: t.costCenter?.name ?? "Sem centro",
    clientId: t.clientId ?? undefined,
    duplicateHash: t.duplicateHash ?? "",
  }));

  const recRows: ReceivableRow[] = receivables.map((r) => ({
    id: r.id,
    clientId: r.clientId,
    competency: r.competency.toISOString().slice(0, 10),
    expectedAmount: Number(r.expectedAmount),
    receivedAmount: Number(r.receivedAmount),
    expectedDate: r.expectedDate.toISOString().slice(0, 10),
    receivedDate: r.receivedDate?.toISOString().slice(0, 10),
    status: r.status,
    accountId: r.accountId ?? undefined,
    notes: r.observations ?? undefined,
  }));

  const payRows: PayableRow[] = payables.map((p) => ({
    id: p.id,
    description: p.description,
    provider: p.provider?.name ?? undefined,
    category: p.category?.name ?? "Sem categoria",
    costCenter: p.costCenter?.name ?? "Sem centro",
    amount: Number(p.amount),
    dueDate: p.dueDate.toISOString().slice(0, 10),
    status: p.status,
    type: p.type,
    accountId: p.accountId ?? undefined,
    notes: p.notes ?? undefined,
  }));

  const categoryRows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isIncome: c.isIncome,
    color: c.color ?? undefined,
  }));

  const costCenterRows: CostCenterRow[] = costCenters.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const workspaceOptionRows: WorkspaceOptionRow[] = workspaceOptions.map((o) => ({
    id: o.id,
    kind: o.kind,
    value: o.value,
    label: o.label,
    sortOrder: o.sortOrder,
  }));

  const debtRows: DebtRow[] = debts.map((d) => ({
    id: d.id, creditor: d.creditor, type: d.type,
    originalAmount: Number(d.originalAmount), outstandingAmount: Number(d.outstandingAmount),
    monthlyRate: d.monthlyRate ? Number(d.monthlyRate) : undefined,
    dueDate: d.dueDate?.toISOString().slice(0,10), totalInstalments: d.totalInstalments ?? undefined,
    paidInstalments: d.paidInstalments, status: d.status, notes: d.notes ?? undefined,
  }));

  const documentRows: DocumentRow[] = documents.map((d) => ({
    id: d.id, name: d.name, type: d.type, url: d.url ?? undefined,
    clientId: d.clientId ?? undefined, amount: d.amount ? Number(d.amount) : undefined,
    documentDate: d.documentDate?.toISOString().slice(0,10),
    notes: d.notes ?? undefined, tags: d.tags,
  }));

  const investmentRows: InvestmentRow[] = investments.map((i) => ({
    id: i.id, name: i.name, type: i.type,
    investedAmount: Number(i.investedAmount), currentValue: Number(i.currentValue),
    notes: i.notes ?? undefined,
  }));

  const goalRows: GoalRow[] = goals.map((g) => ({
    id: g.id, name: g.name, type: g.type,
    targetAmount: Number(g.targetAmount), currentAmount: Number(g.currentAmount),
    deadline: g.deadline?.toISOString().slice(0, 10),
  }));

  const budgetRows: BudgetRow[] = budgets.map((b) => ({
    id: b.id, category: b.category, limitAmount: Number(b.limitAmount),
  }));

  return {
    accounts: accountRows,
    transactions: txRows,
    clients: clientRows,
    contracts: contractRows,
    receivables: recRows,
    payables: payRows,
    categories: categoryRows,
    costCenters: costCenterRows,
    workspaceOptions: workspaceOptionRows,
    debts: debtRows,
    documents: documentRows,
    investments: investmentRows,
    goals: goalRows,
    budgets: budgetRows,
  };
};

export const createAccount = async (session: SessionPayload, input: AccountInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.account.create({
    data: {
      workspaceId,
      name: input.name,
      type: input.type,
      institution: input.institution,
      balance: input.balance,
      isActive: true,
    },
  });
};

export const updateAccount = async (session: SessionPayload, id: string, input: AccountInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.account.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: { name: input.name, type: input.type, institution: input.institution, balance: input.balance },
  });
};

export const createClient = async (session: SessionPayload, input: ClientInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.client.create({
    data: {
      workspaceId,
      name: input.name,
      status: input.status,
      monthlyContract: input.monthlyValue,
      startDate: new Date(input.startDate),
      services: ["OTHER"],
    },
  });
};

export const updateClient = async (session: SessionPayload, id: string, input: ClientInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.client.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      name: input.name,
      status: input.status,
      monthlyContract: input.monthlyValue,
      startDate: new Date(input.startDate),
    },
  });
};

export const createContract = async (session: SessionPayload, input: ContractInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.contract.create({
    data: {
      workspaceId,
      clientId: input.clientId,
      title: input.title,
      monthlyValue: input.monthlyValue,
      startsAt: new Date(input.startsAt),
      dueDay: input.dueDay,
      services: ["OTHER"],
      notes: input.services,
    },
  });
};

export const updateContract = async (session: SessionPayload, id: string, input: ContractInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.contract.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      clientId: input.clientId,
      title: input.title,
      monthlyValue: input.monthlyValue,
      startsAt: new Date(input.startsAt),
      dueDay: input.dueDay,
      notes: input.services,
    },
  });
};

export const createTransaction = async (session: SessionPayload, input: TransactionInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  const duplicateHash = [
    input.date.slice(0, 10),
    input.direction,
    Number(input.amount).toFixed(2),
    input.description.trim().toLowerCase(),
    input.accountId,
  ].join("|");

  const duplicate = await prisma.transaction.findFirst({
    where: { workspaceId, duplicateHash, deletedAt: null },
  });
  if (duplicate) return { duplicate: true as const };

  const category = await ensureCategory(workspaceId, input.category, input.direction === "INCOME");
  const costCenter = await ensureCostCenter(workspaceId, input.costCenter);
  const account = await prisma.account.findFirst({ where: { id: input.accountId, workspaceId, deletedAt: null } });
  if (!account) throw new Error("Conta invalida para transacao.");

  await prisma.transaction.create({
    data: {
      workspaceId,
      transactionAt: new Date(input.date),
      competency: new Date(input.date),
      direction: input.direction,
      description: input.description,
      amount: input.amount,
      accountType: account.type,
      institution: account.institution,
      accountId: input.accountId || undefined,
      categoryId: category.id,
      costCenterId: costCenter.id,
      clientId: input.clientId || undefined,
      duplicateHash,
    },
  });
  return { duplicate: false as const };
};

export const createReceivable = async (session: SessionPayload, input: ReceivableInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.receivable.create({
    data: {
      workspaceId,
      clientId: input.clientId,
      competency: new Date(input.competency),
      expectedAmount: input.expectedAmount,
      receivedAmount: input.receivedAmount ?? 0,
      expectedDate: new Date(input.expectedDate),
      receivedDate: input.receivedDate ? new Date(input.receivedDate) : undefined,
      status: input.status,
      accountId: input.accountId || undefined,
      observations: input.notes,
    },
  });
};

export const updateReceivable = async (session: SessionPayload, id: string, input: ReceivableInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.receivable.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      clientId: input.clientId,
      competency: new Date(input.competency),
      expectedAmount: input.expectedAmount,
      receivedAmount: input.receivedAmount ?? 0,
      expectedDate: new Date(input.expectedDate),
      receivedDate: input.receivedDate ? new Date(input.receivedDate) : null,
      status: input.status,
      accountId: input.accountId || null,
      observations: input.notes,
    },
  });
};

export const createPayable = async (session: SessionPayload, input: PayableInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  const category = await ensureCategory(workspaceId, input.category, false);
  const costCenter = await ensureCostCenter(workspaceId, input.costCenter);
  let providerId: string | undefined;
  if (input.provider) {
    const provider = await prisma.provider.upsert({
      where: { workspaceId_name: { workspaceId, name: input.provider } },
      update: {},
      create: { workspaceId, name: input.provider },
    });
    providerId = provider.id;
  }
  return prisma.payable.create({
    data: {
      workspaceId,
      description: input.description,
      providerId,
      categoryId: category.id,
      costCenterId: costCenter.id,
      amount: input.amount,
      dueDate: new Date(input.dueDate),
      status: input.status,
      type: input.type,
      accountId: input.accountId || undefined,
      notes: input.notes,
    },
  });
};

export const updatePayable = async (session: SessionPayload, id: string, input: PayableInput) => {
  const workspaceId = getWorkspaceId(session);
  const category = await ensureCategory(workspaceId, input.category, false);
  const costCenter = await ensureCostCenter(workspaceId, input.costCenter);
  let providerId: string | null = null;
  if (input.provider) {
    const provider = await prisma.provider.upsert({
      where: { workspaceId_name: { workspaceId, name: input.provider } },
      update: {},
      create: { workspaceId, name: input.provider },
    });
    providerId = provider.id;
  }
  return prisma.payable.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      description: input.description,
      providerId,
      categoryId: category.id,
      costCenterId: costCenter.id,
      amount: input.amount,
      dueDate: new Date(input.dueDate),
      status: input.status,
      type: input.type,
      accountId: input.accountId || null,
      notes: input.notes,
    },
  });
};

export const softDelete = async (
  session: SessionPayload,
  entity: "account" | "transaction" | "client" | "contract" | "receivable" | "payable",
  id: string,
) => {
  const workspaceId = getWorkspaceId(session);
  const deletedAt = new Date();
  switch (entity) {
    case "account":
      return prisma.account.updateMany({ where: { id, workspaceId }, data: { deletedAt, isActive: false } });
    case "transaction":
      return prisma.transaction.updateMany({ where: { id, workspaceId }, data: { deletedAt } });
    case "client":
      return prisma.client.updateMany({ where: { id, workspaceId }, data: { deletedAt } });
    case "contract":
      return prisma.contract.updateMany({ where: { id, workspaceId }, data: { deletedAt } });
    case "receivable":
      return prisma.receivable.updateMany({ where: { id, workspaceId }, data: { deletedAt } });
    case "payable":
      return prisma.payable.updateMany({ where: { id, workspaceId }, data: { deletedAt } });
    default:
      return null;
  }
};

export const markReceivablePaid = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  const current = await prisma.receivable.findFirst({ where: { id, workspaceId, deletedAt: null } });
  if (!current) return null;
  return prisma.receivable.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      status: "PAID",
      receivedAmount: current.receivedAmount.toNumber() > 0 ? current.receivedAmount : current.expectedAmount,
      receivedDate: new Date(),
    },
  });
};

export const markPayablePaid = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.payable.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: { status: "PAID", paidAt: new Date() },
  });
};

export const createCategory = async (session: SessionPayload, name: string, isIncome: boolean) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  const slug = name.trim().toLowerCase().replaceAll(" ", "_").replace(/[^a-z0-9_]/g, "");
  return prisma.category.upsert({
    where: { workspaceId_slug: { workspaceId, slug } },
    update: { deletedAt: null },
    create: { workspaceId, name: name.trim(), slug, isIncome, color: isIncome ? "#16a34a" : "#dc2626" },
  });
};

export const deleteCategory = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.category.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

export const createCostCenter = async (session: SessionPayload, name: string) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  const existing = await prisma.costCenter.findFirst({ where: { workspaceId, name: name.trim(), deletedAt: null } });
  if (existing) return existing;
  return prisma.costCenter.create({ data: { workspaceId, name: name.trim() } });
};

export const deleteCostCenter = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.costCenter.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

// Defaults para seeding de novo workspace
const DEFAULT_ACCOUNT_TYPES = [
  { value: "PERSONAL_HELBERT", label: "Pessoal Helbert" },
  { value: "HOUSEHOLD", label: "Casa / Família" },
  { value: "PERSONAL_LEIDIANE", label: "Leidiane" },
  { value: "BUSINESS_AGENCY", label: "Empresa / Agência" },
  { value: "TRAVEL_EXTRA", label: "Viagem / Extraordinário" },
  { value: "DEBT", label: "Dívida" },
  { value: "REIMBURSEMENT", label: "Reembolso" },
  { value: "WORKING_CAPITAL", label: "Capital de Giro" },
];

const DEFAULT_INSTITUTIONS = [
  { value: "SICOOB", label: "Sicoob" },
  { value: "NUBANK", label: "Nubank" },
  { value: "CAIXA", label: "Caixa Econômica" },
  { value: "BRADESCO", label: "Bradesco" },
  { value: "MERCADO_PAGO", label: "Mercado Pago" },
  { value: "INFINITEPAY", label: "InfinitePay" },
  { value: "COMPANY_ACCOUNT", label: "Conta Empresa" },
  { value: "CASH", label: "Dinheiro / Caixa" },
  { value: "OTHER", label: "Outro" },
];

export const seedWorkspaceOptions = async (workspaceId: string) => {
  const opts = [
    ...DEFAULT_ACCOUNT_TYPES.map((o, i) => ({ ...o, kind: "ACCOUNT_TYPE", sortOrder: i })),
    ...DEFAULT_INSTITUTIONS.map((o, i) => ({ ...o, kind: "INSTITUTION", sortOrder: i })),
  ];
  for (const opt of opts) {
    await prisma.workspaceOption.upsert({
      where: { workspaceId_kind_value: { workspaceId, kind: opt.kind, value: opt.value } },
      update: {},
      create: { workspaceId, kind: opt.kind, value: opt.value, label: opt.label, sortOrder: opt.sortOrder },
    });
  }
};

export const createWorkspaceOption = async (
  session: SessionPayload,
  kind: string,
  value: string,
  label: string,
) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.workspaceOption.upsert({
    where: { workspaceId_kind_value: { workspaceId, kind, value } },
    update: { label, deletedAt: null },
    create: { workspaceId, kind, value, label },
  });
};

export const deleteWorkspaceOption = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.workspaceOption.updateMany({
    where: { id, workspaceId },
    data: { deletedAt: new Date() },
  });
};

export const replaceSnapshot = async (session: SessionPayload, snapshot: DbSnapshot) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  const categoryMap = new Map<string, string>();
  const costCenterMap = new Map<string, string>();
  const providerMap = new Map<string, string>();

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({ where: { workspaceId } });
    await tx.payable.deleteMany({ where: { workspaceId } });
    await tx.receivable.deleteMany({ where: { workspaceId } });
    await tx.contract.deleteMany({ where: { workspaceId } });
    await tx.client.deleteMany({ where: { workspaceId } });
    await tx.account.deleteMany({ where: { workspaceId } });
    await tx.provider.deleteMany({ where: { workspaceId } });
    await tx.costCenter.deleteMany({ where: { workspaceId } });
    await tx.category.deleteMany({ where: { workspaceId } });

    for (const account of snapshot.accounts) {
      await tx.account.create({
        data: {
          id: account.id,
          workspaceId,
          name: account.name,
          type: account.type,
          institution: account.institution,
          balance: account.balance,
          isActive: true,
        },
      });
    }

    for (const client of snapshot.clients) {
      await tx.client.create({
        data: {
          id: client.id,
          workspaceId,
          name: client.name,
          status: client.status,
          monthlyContract: client.monthlyValue,
          startDate: new Date(client.startDate),
          services: ["OTHER"],
        },
      });
    }

    for (const contract of snapshot.contracts) {
      await tx.contract.create({
        data: {
          id: contract.id,
          workspaceId,
          clientId: contract.clientId,
          title: contract.title,
          monthlyValue: contract.monthlyValue,
          startsAt: new Date(contract.startsAt),
          dueDay: contract.dueDay,
          services: ["OTHER"],
          notes: contract.services,
        },
      });
    }

    const categoryNames = new Set<string>();
    const costCenterNames = new Set<string>();
    const providerNames = new Set<string>();

    snapshot.transactions.forEach((t) => {
      categoryNames.add(t.category);
      costCenterNames.add(t.costCenter);
    });
    snapshot.payables.forEach((p) => {
      categoryNames.add(p.category);
      costCenterNames.add(p.costCenter);
      if (p.provider) providerNames.add(p.provider);
    });

    for (const name of categoryNames) {
      const slug = name.trim().toLowerCase().replaceAll(" ", "_");
      const category = await tx.category.create({
        data: {
          workspaceId,
          name,
          slug,
          isIncome: snapshot.transactions.some((t) => t.category === name && t.direction === "INCOME"),
          color: "#2563EB",
        },
      });
      categoryMap.set(name, category.id);
    }

    for (const name of costCenterNames) {
      const cc = await tx.costCenter.create({ data: { workspaceId, name } });
      costCenterMap.set(name, cc.id);
    }

    for (const name of providerNames) {
      const provider = await tx.provider.create({ data: { workspaceId, name } });
      providerMap.set(name, provider.id);
    }

    for (const t of snapshot.transactions) {
      const account = await tx.account.findFirst({ where: { id: t.accountId, workspaceId } });
      await tx.transaction.create({
        data: {
          id: t.id,
          workspaceId,
          transactionAt: new Date(t.date),
          competency: new Date(t.date),
          direction: t.direction,
          description: t.description,
          amount: t.amount,
          accountType: account?.type ?? "BUSINESS_AGENCY",
          institution: account?.institution ?? "OTHER",
          accountId: t.accountId || undefined,
          categoryId: categoryMap.get(t.category),
          costCenterId: costCenterMap.get(t.costCenter),
          clientId: t.clientId || undefined,
          duplicateHash: t.duplicateHash || undefined,
        },
      });
    }

    for (const r of snapshot.receivables) {
      await tx.receivable.create({
        data: {
          id: r.id,
          workspaceId,
          clientId: r.clientId,
          competency: new Date(r.competency),
          expectedAmount: r.expectedAmount,
          receivedAmount: r.receivedAmount,
          expectedDate: new Date(r.expectedDate),
          receivedDate: r.receivedDate ? new Date(r.receivedDate) : undefined,
          status: r.status,
          accountId: r.accountId || undefined,
          observations: r.notes,
        },
      });
    }

    for (const p of snapshot.payables) {
      await tx.payable.create({
        data: {
          id: p.id,
          workspaceId,
          description: p.description,
          providerId: p.provider ? providerMap.get(p.provider) : undefined,
          categoryId: categoryMap.get(p.category),
          costCenterId: costCenterMap.get(p.costCenter),
          amount: p.amount,
          dueDate: new Date(p.dueDate),
          status: p.status,
          type: p.type,
          accountId: p.accountId || undefined,
          notes: p.notes,
        },
      });
    }
  });
};

export const createDebt = async (session: SessionPayload, input: DebtInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.debt.create({
    data: {
      workspaceId, creditor: input.creditor, type: input.type,
      originalAmount: input.originalAmount, outstandingAmount: input.outstandingAmount,
      monthlyRate: input.monthlyRate, dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      totalInstalments: input.totalInstalments, paidInstalments: input.paidInstalments ?? 0,
      status: input.status, notes: input.notes,
    },
  });
};

export const updateDebt = async (session: SessionPayload, id: string, input: DebtInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.debt.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      creditor: input.creditor, type: input.type,
      originalAmount: input.originalAmount, outstandingAmount: input.outstandingAmount,
      monthlyRate: input.monthlyRate ?? null, dueDate: input.dueDate ? new Date(input.dueDate) : null,
      totalInstalments: input.totalInstalments ?? null, paidInstalments: input.paidInstalments ?? 0,
      status: input.status, notes: input.notes,
    },
  });
};

export const deleteDebt = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.debt.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

export const createDocument = async (session: SessionPayload, input: DocumentInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.document.create({
    data: {
      workspaceId, name: input.name, type: input.type,
      url: input.url || undefined, clientId: input.clientId || undefined,
      amount: input.amount, documentDate: input.documentDate ? new Date(input.documentDate) : undefined,
      notes: input.notes, tags: input.tags ? input.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    },
  });
};

export const deleteDocument = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.document.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

/* ── Investimentos ── */
export const createInvestment = async (session: SessionPayload, input: InvestmentInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.investment.create({
    data: {
      workspaceId, name: input.name, type: input.type,
      investedAmount: input.investedAmount, currentValue: input.currentValue,
      notes: input.notes,
    },
  });
};

export const updateInvestment = async (session: SessionPayload, id: string, input: InvestmentInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.investment.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      name: input.name, type: input.type,
      investedAmount: input.investedAmount, currentValue: input.currentValue,
      notes: input.notes,
    },
  });
};

export const deleteInvestment = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.investment.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

/* ── Metas ── */
export const createGoal = async (session: SessionPayload, input: GoalInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.goal.create({
    data: {
      workspaceId, name: input.name, type: input.type,
      targetAmount: input.targetAmount, currentAmount: input.currentAmount ?? 0,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    },
  });
};

export const updateGoal = async (session: SessionPayload, id: string, input: GoalInput) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.goal.updateMany({
    where: { id, workspaceId, deletedAt: null },
    data: {
      name: input.name, type: input.type,
      targetAmount: input.targetAmount, currentAmount: input.currentAmount ?? 0,
      deadline: input.deadline ? new Date(input.deadline) : null,
    },
  });
};

export const deleteGoal = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.goal.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

/* ── Orçamento ── */
export const createBudget = async (session: SessionPayload, input: BudgetInput) => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  return prisma.budget.upsert({
    where: { workspaceId_category: { workspaceId, category: input.category } },
    update: { limitAmount: input.limitAmount, deletedAt: null },
    create: { workspaceId, category: input.category, limitAmount: input.limitAmount },
  });
};

export const deleteBudget = async (session: SessionPayload, id: string) => {
  const workspaceId = getWorkspaceId(session);
  return prisma.budget.updateMany({ where: { id, workspaceId }, data: { deletedAt: new Date() } });
};

export const smartImportTransactions = async (
  session: SessionPayload,
  rows: Array<{
    date: string; direction: string; description: string; amount: number;
    accountName: string; category: string; costCenter: string; clientName?: string;
  }>,
): Promise<{ imported: number; skipped: number; errors: string[] }> => {
  const workspaceId = getWorkspaceId(session);
  await ensureWorkspace(workspaceId);
  let imported = 0; let skipped = 0; const errors: string[] = [];

  for (const row of rows) {
    try {
      const account = await prisma.account.findFirst({ where: { workspaceId, name: { contains: row.accountName, mode: "insensitive" }, deletedAt: null } });
      const category = await ensureCategory(workspaceId, row.category, row.direction === "INCOME");
      const costCenter = await ensureCostCenter(workspaceId, row.costCenter);
      const client = row.clientName ? await prisma.client.findFirst({ where: { workspaceId, name: { contains: row.clientName, mode: "insensitive" }, deletedAt: null } }) : null;

      const duplicateHash = [row.date.slice(0,10), row.direction, Number(row.amount).toFixed(2), row.description.trim().toLowerCase(), account?.id ?? row.accountName].join("|");
      const dup = await prisma.transaction.findFirst({ where: { workspaceId, duplicateHash, deletedAt: null } });
      if (dup) { skipped++; continue; }

      await prisma.transaction.create({ data: {
        workspaceId, transactionAt: new Date(row.date), competency: new Date(row.date),
        direction: row.direction as "INCOME"|"EXPENSE", description: row.description,
        amount: row.amount, accountType: account?.type ?? "OTHER", institution: account?.institution ?? "OTHER",
        accountId: account?.id, categoryId: category.id, costCenterId: costCenter.id,
        clientId: client?.id, duplicateHash,
      }});
      imported++;
    } catch (e) { errors.push(`Linha ${rows.indexOf(row)+2}: ${e instanceof Error ? e.message : String(e)}`); }
  }
  return { imported, skipped, errors };
};
