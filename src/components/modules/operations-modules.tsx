"use client";

import { useMemo, useState } from "react";
import {
  addAccountToStore,
  addClientToStore,
  addContractToStore,
  addPayableToStore,
  addReceivableToStore,
  addTransactionToStore,
  softDeleteById,
} from "@/lib/local-store";
import { useAppStore } from "@/lib/use-app-store";
import {
  accountSchema,
  clientSchema,
  contractSchema,
  payableSchema,
  receivableSchema,
  transactionSchema,
} from "@/lib/validators";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function AccountsModule() {
  const { store, update } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const activeAccounts = store.accounts.filter((a) => !a.deletedAt);
  const activeTransactions = store.transactions.filter((t) => !t.deletedAt);

  const totalIncome = activeTransactions
    .filter((t) => t.direction === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = activeTransactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const handleAccount = (formData: FormData) => {
    const parsed = accountSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      balance: Number(formData.get("balance") ?? 0),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados invalidos.");
      return;
    }
    update(addAccountToStore(store, parsed.data));
    setError(null);
  };

  const handleTransaction = (formData: FormData) => {
    const parsed = transactionSchema.safeParse({
      date: String(formData.get("date") ?? ""),
      direction: String(formData.get("direction") ?? ""),
      description: String(formData.get("description") ?? ""),
      amount: Number(formData.get("amount") ?? 0),
      accountId: String(formData.get("accountId") ?? ""),
      category: String(formData.get("category") ?? ""),
      costCenter: String(formData.get("costCenter") ?? ""),
      clientId: String(formData.get("clientId") ?? "") || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados invalidos.");
      return;
    }
    const result = addTransactionToStore(store, parsed.data);
    if (result.duplicate) {
      setError("Transacao duplicada detectada (mesma data, valor, descricao e conta).");
      return;
    }
    update(result.store);
    setError(null);
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Saldo inicial contas</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {money(activeAccounts.reduce((acc, a) => acc + a.balance, 0))}
          </p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Entradas lancadas</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{money(totalIncome)}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Saidas lancadas</p>
          <p className="mt-1 text-xl font-bold text-red-700">{money(totalExpense)}</p>
        </article>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Nova conta</h3>
          <form action={handleAccount} className="mt-3 grid gap-2">
            <input name="name" placeholder="Nome da conta" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <select name="type" defaultValue="BUSINESS_AGENCY" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              <option value="PERSONAL_HELBERT">Pessoal Helbert</option>
              <option value="HOUSEHOLD">Casa/Familia</option>
              <option value="PERSONAL_LEIDIANE">Leidiane</option>
              <option value="BUSINESS_AGENCY">Empresa/Agencia</option>
              <option value="TRAVEL_EXTRA">Viagem/Extraordinario</option>
              <option value="DEBT">Divida</option>
              <option value="REIMBURSEMENT">Reembolso</option>
              <option value="WORKING_CAPITAL">Capital de giro</option>
            </select>
            <select name="institution" defaultValue="OTHER" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              <option value="SICOOB">Sicoob</option>
              <option value="NUBANK">Nubank</option>
              <option value="CAIXA">Caixa</option>
              <option value="BRADESCO">Bradesco</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="INFINITEPAY">InfinitePay</option>
              <option value="COMPANY_ACCOUNT">Conta empresa</option>
              <option value="CASH">Dinheiro</option>
              <option value="OTHER">Outro</option>
            </select>
            <input name="balance" type="number" step="0.01" placeholder="Saldo inicial" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Salvar conta</button>
          </form>
        </article>

        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Nova transacao</h3>
          <form action={handleTransaction} className="mt-3 grid gap-2">
            <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <select name="direction" defaultValue="INCOME" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              <option value="INCOME">Entrada</option>
              <option value="EXPENSE">Saida</option>
            </select>
            <input name="description" placeholder="Descricao" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="amount" type="number" step="0.01" placeholder="Valor" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <select name="accountId" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              {activeAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input name="category" placeholder="Categoria" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="costCenter" placeholder="Centro de custo" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="clientId" placeholder="Cliente (opcional)" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Salvar transacao</button>
          </form>
        </article>
      </div>

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Contas cadastradas</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Conta</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Instituicao</th>
                <th className="px-3 py-2 text-left">Saldo</th>
                <th className="px-3 py-2 text-left">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {activeAccounts.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2">{a.name}</td>
                  <td className="px-3 py-2">{a.type}</td>
                  <td className="px-3 py-2">{a.institution}</td>
                  <td className="px-3 py-2">{money(a.balance)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => update({ ...store, accounts: softDeleteById(store.accounts, a.id) })}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Transacoes</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Direcao</th>
                <th className="px-3 py-2 text-left">Descricao</th>
                <th className="px-3 py-2 text-left">Valor</th>
                <th className="px-3 py-2 text-left">Categoria</th>
                <th className="px-3 py-2 text-left">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {activeTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2">{t.date}</td>
                  <td className="px-3 py-2">{t.direction}</td>
                  <td className="px-3 py-2">{t.description}</td>
                  <td className="px-3 py-2">{money(t.amount)}</td>
                  <td className="px-3 py-2">{t.category}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => update({ ...store, transactions: softDeleteById(store.transactions, t.id) })}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export function ClientsModule() {
  const { store, update } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const clients = store.clients.filter((c) => !c.deletedAt);
    const contracts = store.contracts.filter((c) => !c.deletedAt);
    const transactions = store.transactions.filter((t) => !t.deletedAt && t.direction === "INCOME");

    const today = new Date();
    const clientRows = clients.map((client) => {
      const monthsActive = Math.max(
        1,
        (today.getFullYear() - new Date(client.startDate).getFullYear()) * 12 +
          (today.getMonth() - new Date(client.startDate).getMonth()) +
          1,
      );
      const ticket = client.monthlyValue;
      const ltv = ticket * monthsActive;
      const totalReceived = transactions
        .filter((t) => t.clientId === client.id)
        .reduce((acc, t) => acc + t.amount, 0);
      return {
        client,
        ticket,
        monthsActive,
        ltv,
        totalReceived,
      };
    });

    const mrr = contracts.reduce((acc, c) => acc + c.monthlyValue, 0);
    const arr = mrr * 12;
    const ltvAvg = clientRows.length ? clientRows.reduce((a, r) => a + r.ltv, 0) / clientRows.length : 0;
    const top = [...clientRows].sort((a, b) => b.ltv - a.ltv).slice(0, 3);
    const low = [...clientRows].sort((a, b) => a.ltv - b.ltv).slice(0, 3);

    return { clientRows, mrr, arr, ltvAvg, top, low };
  }, [store]);

  if (!metrics) return <article className="cc-card p-4 text-sm text-zinc-600">Carregando clientes...</article>;

  const clients = store.clients.filter((c) => !c.deletedAt);
  const contracts = store.contracts.filter((c) => !c.deletedAt);

  const handleClient = (formData: FormData) => {
    const parsed = clientSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      status: String(formData.get("status") ?? ""),
      monthlyValue: Number(formData.get("monthlyValue") ?? 0),
      startDate: String(formData.get("startDate") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados invalidos.");
      return;
    }
    update(addClientToStore(store, parsed.data));
    setError(null);
  };

  const handleContract = (formData: FormData) => {
    const parsed = contractSchema.safeParse({
      clientId: String(formData.get("clientId") ?? ""),
      title: String(formData.get("title") ?? ""),
      monthlyValue: Number(formData.get("monthlyValue") ?? 0),
      startsAt: String(formData.get("startsAt") ?? ""),
      dueDay: Number(formData.get("dueDay") ?? 10),
      services: String(formData.get("services") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados invalidos.");
      return;
    }
    update(addContractToStore(store, parsed.data));
    setError(null);
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">MRR</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{money(metrics.mrr)}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">ARR</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{money(metrics.arr)}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">LTV medio</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{money(metrics.ltvAvg)}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Clientes ativos</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">{clients.length}</p>
        </article>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Novo cliente</h3>
          <form action={handleClient} className="mt-3 grid gap-2">
            <input name="name" placeholder="Nome do cliente" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <select name="status" defaultValue="ACTIVE" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              <option value="ACTIVE">Ativo</option>
              <option value="STANDBY">Standby</option>
              <option value="DELINQUENT">Inadimplente</option>
              <option value="CANCELED">Cancelado</option>
              <option value="PROSPECT">Prospect</option>
            </select>
            <input name="monthlyValue" type="number" step="0.01" placeholder="Valor mensal" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Salvar cliente</button>
          </form>
        </article>

        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Novo contrato</h3>
          <form action={handleContract} className="mt-3 grid gap-2">
            <select name="clientId" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Titulo do contrato" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="monthlyValue" type="number" step="0.01" placeholder="Valor mensal" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="startsAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="dueDay" type="number" min={1} max={31} defaultValue={10} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <input name="services" placeholder="Servicos contratados" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Salvar contrato</button>
          </form>
        </article>
      </div>

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Clientes (LTV e ticket)</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Ticket</th>
                <th className="px-3 py-2 text-left">Meses ativos</th>
                <th className="px-3 py-2 text-left">LTV</th>
                <th className="px-3 py-2 text-left">Recebido total</th>
                <th className="px-3 py-2 text-left">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {metrics.clientRows.map((row) => (
                <tr key={row.client.id}>
                  <td className="px-3 py-2">{row.client.name}</td>
                  <td className="px-3 py-2">{row.client.status}</td>
                  <td className="px-3 py-2">{money(row.ticket)}</td>
                  <td className="px-3 py-2">{row.monthsActive}</td>
                  <td className="px-3 py-2">{money(row.ltv)}</td>
                  <td className="px-3 py-2">{money(row.totalReceived)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => update({ ...store, clients: softDeleteById(store.clients, row.client.id) })}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Top clientes por LTV</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-700">
            {metrics.top.map((item) => (
              <li key={item.client.id} className="flex items-center justify-between rounded bg-zinc-50 px-3 py-2">
                <span>{item.client.name}</span>
                <strong>{money(item.ltv)}</strong>
              </li>
            ))}
          </ul>
        </article>
        <article className="cc-card p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Menor LTV (atencao)</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-700">
            {metrics.low.map((item) => (
              <li key={item.client.id} className="flex items-center justify-between rounded bg-zinc-50 px-3 py-2">
                <span>{item.client.name}</span>
                <strong>{money(item.ltv)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Contratos</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Contrato</th>
                <th className="px-3 py-2 text-left">Valor</th>
                <th className="px-3 py-2 text-left">Vencimento</th>
                <th className="px-3 py-2 text-left">Servicos</th>
                <th className="px-3 py-2 text-left">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contracts.map((contract) => {
                const clientName = clients.find((c) => c.id === contract.clientId)?.name ?? contract.clientId;
                return (
                  <tr key={contract.id}>
                    <td className="px-3 py-2">{clientName}</td>
                    <td className="px-3 py-2">{contract.title}</td>
                    <td className="px-3 py-2">{money(contract.monthlyValue)}</td>
                    <td className="px-3 py-2">Dia {contract.dueDay}</td>
                    <td className="px-3 py-2">{contract.services}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => update({ ...store, contracts: softDeleteById(store.contracts, contract.id) })}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export function ReceivablesModule() {
  const { store, update } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const receivables = store.receivables.filter((r) => !r.deletedAt);
  const clients = store.clients.filter((c) => !c.deletedAt);
  const nowTs = useMemo(() => new Date().getTime(), []);
  const today = new Date().toISOString().slice(0, 10);

  const dueToday = receivables.filter((r) => r.expectedDate === today && r.status !== "PAID").length;
  const overdue = receivables.filter((r) => r.status === "OVERDUE").length;
  const over5days = receivables.filter((r) => {
    if (r.status !== "OVERDUE") return false;
    const diff = (nowTs - new Date(r.expectedDate).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 5;
  }).length;

  const handleAdd = (formData: FormData) => {
    const parsed = receivableSchema.safeParse({
      clientId: String(formData.get("clientId") ?? ""),
      competency: String(formData.get("competency") ?? ""),
      expectedAmount: Number(formData.get("expectedAmount") ?? 0),
      receivedAmount: Number(formData.get("receivedAmount") ?? 0),
      expectedDate: String(formData.get("expectedDate") ?? ""),
      receivedDate: String(formData.get("receivedDate") ?? "") || undefined,
      status: String(formData.get("status") ?? "PENDING"),
      accountId: String(formData.get("accountId") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados invalidos.");
      return;
    }
    update(addReceivableToStore(store, parsed.data));
    setError(null);
  };

  const markPaid = (id: string) => {
    update({
      ...store,
      receivables: store.receivables.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "PAID",
              receivedAmount: r.receivedAmount > 0 ? r.receivedAmount : r.expectedAmount,
              receivedDate: new Date().toISOString().slice(0, 10),
            }
          : r,
      ),
    });
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Vencendo hoje</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{dueToday}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Vencidos</p>
          <p className="mt-1 text-xl font-bold text-red-700">{overdue}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Atraso &gt; 5 dias</p>
          <p className="mt-1 text-xl font-bold text-red-700">{over5days}</p>
        </article>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Novo lancamento a receber</h3>
        <form action={handleAdd} className="mt-3 grid gap-2 md:grid-cols-3">
          <select name="clientId" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="competency" type="date" defaultValue={today} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="expectedAmount" type="number" step="0.01" placeholder="Valor previsto" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="receivedAmount" type="number" step="0.01" defaultValue={0} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="expectedDate" type="date" defaultValue={today} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="receivedDate" type="date" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <select name="status" defaultValue="PENDING" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="PARTIAL">Pago parcial</option>
            <option value="OVERDUE">Atrasado</option>
            <option value="CANCELED">Cancelado</option>
            <option value="RENEGOTIATED">Renegociado</option>
          </select>
          <select name="accountId" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="">Conta opcional</option>
            {store.accounts
              .filter((a) => !a.deletedAt)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
          <input name="notes" placeholder="Observacoes" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm md:col-span-2" />
          <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            Salvar recebivel
          </button>
        </form>
      </article>

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Contas a receber</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Competencia</th>
                <th className="px-3 py-2 text-left">Previsto</th>
                <th className="px-3 py-2 text-left">Recebido</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {receivables.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{clients.find((c) => c.id === r.clientId)?.name ?? r.clientId}</td>
                  <td className="px-3 py-2">{r.competency}</td>
                  <td className="px-3 py-2">{money(r.expectedAmount)}</td>
                  <td className="px-3 py-2">{money(r.receivedAmount)}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {r.status !== "PAID" ? (
                        <button type="button" onClick={() => markPaid(r.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">
                          Marcar pago
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => update({ ...store, receivables: softDeleteById(store.receivables, r.id) })}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export function PayablesModule() {
  const { store, update } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const payables = store.payables.filter((p) => !p.deletedAt);
  const totalOpen = payables.filter((p) => p.status !== "PAID").reduce((acc, p) => acc + p.amount, 0);

  const handleAdd = (formData: FormData) => {
    const parsed = payableSchema.safeParse({
      description: String(formData.get("description") ?? ""),
      provider: String(formData.get("provider") ?? "") || undefined,
      category: String(formData.get("category") ?? ""),
      costCenter: String(formData.get("costCenter") ?? ""),
      amount: Number(formData.get("amount") ?? 0),
      dueDate: String(formData.get("dueDate") ?? ""),
      status: String(formData.get("status") ?? "OPEN"),
      type: String(formData.get("type") ?? "VARIABLE"),
      accountId: String(formData.get("accountId") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados invalidos.");
      return;
    }
    update(addPayableToStore(store, parsed.data));
    setError(null);
  };

  const markPaid = (id: string) => {
    update({
      ...store,
      payables: store.payables.map((p) => (p.id === id ? { ...p, status: "PAID" } : p)),
    });
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total em aberto</p>
          <p className="mt-1 text-xl font-bold text-red-700">{money(totalOpen)}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Pagas</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{payables.filter((p) => p.status === "PAID").length}</p>
        </article>
        <article className="cc-card p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Atrasadas</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{payables.filter((p) => p.status === "OVERDUE").length}</p>
        </article>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Novo lancamento a pagar</h3>
        <form action={handleAdd} className="mt-3 grid gap-2 md:grid-cols-3">
          <input name="description" placeholder="Descricao" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="provider" placeholder="Fornecedor (opcional)" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="category" placeholder="Categoria" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="costCenter" placeholder="Centro de custo" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="amount" type="number" step="0.01" placeholder="Valor" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <input name="dueDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          <select name="status" defaultValue="OPEN" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="OPEN">Aberto</option>
            <option value="PAID">Pago</option>
            <option value="OVERDUE">Atrasado</option>
            <option value="INSTALMENT">Parcelado</option>
            <option value="RENEGOTIATED">Renegociado</option>
            <option value="SUSPENDED">Suspenso</option>
          </select>
          <select name="type" defaultValue="VARIABLE" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="FIXED">Fixo</option>
            <option value="VARIABLE">Variavel</option>
            <option value="RECURRING">Recorrente</option>
            <option value="EXTRAORDINARY">Extraordinario</option>
            <option value="DEBT">Divida</option>
            <option value="INVESTMENT">Investimento</option>
          </select>
          <select name="accountId" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="">Conta opcional</option>
            {store.accounts
              .filter((a) => !a.deletedAt)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
          <input name="notes" placeholder="Observacoes" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm md:col-span-2" />
          <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            Salvar pagamento
          </button>
        </form>
      </article>

      <article className="cc-card p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Contas a pagar</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-3 py-2 text-left">Descricao</th>
                <th className="px-3 py-2 text-left">Categoria</th>
                <th className="px-3 py-2 text-left">Valor</th>
                <th className="px-3 py-2 text-left">Vencimento</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {payables.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">{p.description}</td>
                  <td className="px-3 py-2">{p.category}</td>
                  <td className="px-3 py-2">{money(p.amount)}</td>
                  <td className="px-3 py-2">{p.dueDate}</td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {p.status !== "PAID" ? (
                        <button type="button" onClick={() => markPaid(p.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">
                          Marcar pago
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => update({ ...store, payables: softDeleteById(store.payables, p.id) })}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
