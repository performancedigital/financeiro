import { requireSession } from "@/lib/auth";
import { logoutAction } from "./actions";

const cards = [
  { label: "Saldo consolidado", value: "R$ 36.550,00", tone: "text-emerald-700" },
  { label: "Saldo pessoal", value: "R$ 10.750,00", tone: "text-zinc-800" },
  { label: "Saldo empresa", value: "R$ 25.800,00", tone: "text-blue-700" },
  { label: "Receber no mes", value: "R$ 32.400,00", tone: "text-blue-700" },
  { label: "Pagar no mes", value: "R$ 19.780,00", tone: "text-amber-700" },
  { label: "Risco de caixa", value: "VERDE", tone: "text-emerald-700" },
];

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">CaixaComando</p>
            <h1 className="text-lg font-bold text-zinc-900">Dashboard Geral</h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 md:grid-cols-[260px_1fr] md:px-6">
        <aside className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Usuario</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">{session.name}</p>
          <p className="text-xs text-zinc-500">{session.email}</p>
          <p className="mt-3 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
            Workspace: {session.workspaceId}
          </p>
          <nav className="mt-4 space-y-2">
            {["Dashboard", "Contas", "Clientes", "Receber", "Pagar", "Fluxo", "DRE"].map((item) => (
              <div key={item} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <article key={card.label} className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{card.label}</p>
                <p className={`mt-2 text-xl font-bold ${card.tone}`}>{card.value}</p>
              </article>
            ))}
          </div>

          <article className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">Etapas 1 e 2 concluídas</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Base Next.js + TypeScript + Tailwind preparada</li>
              <li>Schema Prisma conectado ao projeto</li>
              <li>Login funcional com sessão segura via cookie httpOnly</li>
              <li>Rota protegida em <code>/dashboard</code></li>
              <li>Estrutura pronta para iniciar os módulos financeiros</li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
