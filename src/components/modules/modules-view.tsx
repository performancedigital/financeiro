import { dashboardKpis, quickAlerts } from "@/lib/dashboard-data";
import type { AppModule } from "@/lib/navigation";
import { AccountsModule, ClientsModule } from "@/components/modules/operations-modules";

const toneClass: Record<string, string> = {
  positive: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  neutral: "text-zinc-800",
  info: "text-blue-700",
};

function DashboardModule() {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((item) => (
          <article key={item.label} className="cc-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{item.label}</p>
            <p className={`mt-2 text-xl font-bold ${toneClass[item.tone]}`}>{item.value}</p>
            {item.trend ? <p className="mt-1 text-xs text-zinc-500">{item.trend}</p> : null}
          </article>
        ))}
      </div>
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">Alertas inteligentes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {quickAlerts.map((alert) => (
            <li key={alert}>{alert}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function DataTablePlaceholder({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <article className="cc-card p-4">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-50">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="px-3 py-2 text-zinc-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function GenericModule({ module }: { module: AppModule }) {
  const contentByModule: Record<string, { columns: string[]; rows: string[][] }> = {
    contas: {
      columns: ["Conta", "Tipo", "Instituicao", "Saldo"],
      rows: [
        ["Sicoob pessoal", "Pessoal Helbert", "Sicoob", "R$ 6.200,00"],
        ["InfinitePay empresa", "Empresa/Agencia", "InfinitePay", "R$ 8.700,00"],
      ],
    },
    clientes: {
      columns: ["Cliente", "Status", "Ticket", "LTV"],
      rows: [
        ["Educaminas", "Ativo", "R$ 2.800,00", "R$ 33.600,00"],
        ["Bias Centro Educacional", "Ativo", "R$ 2.500,00", "R$ 27.500,00"],
      ],
    },
    receber: {
      columns: ["Cliente", "Competencia", "Valor previsto", "Status"],
      rows: [
        ["Sao Lucas", "2026-05", "R$ 3.200,00", "Pendente"],
        ["Barbeza", "2026-05", "R$ 2.400,00", "Atrasado"],
      ],
    },
    pagar: {
      columns: ["Descricao", "Categoria", "Vencimento", "Status"],
      rows: [
        ["Equipe de trafego", "Equipe", "2026-05-20", "Aberto"],
        ["Google Workspace", "Ferramentas", "2026-05-18", "Pago"],
      ],
    },
    fluxo: {
      columns: ["Periodo", "Previsto", "Realizado", "Diferenca"],
      rows: [
        ["Maio/2026", "R$ 12.620,00", "R$ 10.940,00", "-R$ 1.680,00"],
        ["Junho/2026", "R$ 14.200,00", "-", "-"],
      ],
    },
    dre: {
      columns: ["Linha", "Valor", "% Receita"],
      rows: [
        ["Receita bruta", "R$ 32.400,00", "100%"],
        ["Resultado operacional", "R$ 9.800,00", "30,2%"],
      ],
    },
    dividas: {
      columns: ["Credor", "Saldo", "Taxa", "Status"],
      rows: [
        ["Banco X", "R$ 20.000,00", "2,1% a.m.", "Em dia"],
        ["Cartao Y", "R$ 6.400,00", "9,9% a.m.", "Renegociada"],
      ],
    },
    documentos: {
      columns: ["Documento", "Tipo", "Vinculo", "Data"],
      rows: [
        ["Contrato Educaminas", "Contrato cliente", "Educaminas", "2026-05-02"],
        ["Comprovante equipe", "Comprovante de pagamento", "Equipe", "2026-05-10"],
      ],
    },
    projecoes: {
      columns: ["Mes", "Receita prevista", "Despesas", "Saldo projetado"],
      rows: [
        ["Junho", "R$ 34.000,00", "R$ 21.300,00", "R$ 12.700,00"],
        ["Julho", "R$ 35.200,00", "R$ 22.000,00", "R$ 13.200,00"],
      ],
    },
    relatorios: {
      columns: ["Relatorio", "Formato", "Status"],
      rows: [
        ["Financeiro mensal", "PDF", "Pronto"],
        ["Fluxo de caixa", "XLSX", "Pronto"],
      ],
    },
  };

  const content = contentByModule[module.key] ?? {
    columns: ["Campo", "Valor"],
    rows: [["Modulo", module.label]],
  };

  return (
    <section className="space-y-4">
      <article className="cc-card p-4">
        <h2 className="text-base font-semibold text-zinc-900">{module.label}</h2>
        <p className="mt-1 text-sm text-zinc-600">{module.description}</p>
      </article>
      <DataTablePlaceholder title={`${module.label} - visao rapida`} columns={content.columns} rows={content.rows} />
    </section>
  );
}

export function ModulesView({ module }: { module: AppModule }) {
  if (module.key === "dashboard") return <DashboardModule />;
  if (module.key === "contas") return <AccountsModule />;
  if (module.key === "clientes") return <ClientsModule />;
  return <GenericModule module={module} />;
}
