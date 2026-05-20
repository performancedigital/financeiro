import { prisma } from "@/lib/prisma";
import type {
  AccountRow,
  ClientRow,
  ContractRow,
  DbSnapshot,
  PayableRow,
  ReceivableRow,
  TransactionRow,
} from "@/lib/db-types";
import type { SessionPayload } from "@/lib/auth";
import type {
  AccountInput,
  ClientInput,
  ContractInput,
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

  const [accounts, clients, contracts, transactions, receivables, payables] = await Promise.all([
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

  return {
    accounts: accountRows,
    transactions: txRows,
    clients: clientRows,
    contracts: contractRows,
    receivables: recRows,
    payables: payRows,
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
