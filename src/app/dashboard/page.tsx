import { ModulesView } from "@/components/modules/modules-view";
import { FiltersBar } from "@/components/shell/filters-bar";
import { QuickActions } from "@/components/shell/quick-actions";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { requireSession } from "@/lib/auth";
import { appModules, findModule } from "@/lib/navigation";
import { logoutAction } from "./actions";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const moduleParam = Array.isArray(params.mod) ? params.mod[0] : params.mod;
  const activeModule = findModule(moduleParam ?? "dashboard") ?? appModules[0];

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">CaixaComando</p>
            <h1 className="text-lg font-bold text-zinc-900">Painel financeiro</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <QuickActions />
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">
        <div className="mb-4 grid gap-3 md:grid-cols-[260px_1fr]">
          <div className="cc-card p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Sessao ativa</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{session.name}</p>
            <p className="text-xs text-zinc-500">{session.email}</p>
            <p className="mt-2 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
              Workspace: {session.workspaceId}
            </p>
          </div>
          <FiltersBar month="2026-05" />
        </div>

        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <SidebarNav modules={appModules} active={activeModule.key} />
          <section className="space-y-4">
            <article className="cc-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Modulo atual</p>
              <h2 className="text-lg font-bold text-zinc-900">{activeModule.label}</h2>
              <p className="text-sm text-zinc-600">{activeModule.description}</p>
            </article>
            <article className="cc-card p-4">
              <h3 className="text-sm font-semibold text-zinc-900">Importacao e orquestracao de dados</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Use o endpoint <code>/api/import/csv</code> para importar CSV por tipo e distribuir automaticamente nos modulos.
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Endpoints: <code>accounts</code>, <code>transactions</code>, <code>clients</code>, <code>contracts</code>, <code>receivables</code>, <code>payables</code>.
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Para limpar tudo (sem seed): <code>POST /api/import/clear</code>.
              </p>
            </article>
            <ModulesView module={activeModule} />
          </section>
        </div>
      </section>
    </main>
  );
}
