import { ModulesView } from "@/components/modules/modules-view";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { DashboardClient } from "@/components/shell/dashboard-client";
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
    <DashboardClient>
      <div className="min-h-screen bg-zinc-100">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-zinc-900 leading-none">CaixaComando</p>
                <p className="text-xs text-zinc-500 leading-none mt-0.5">{session.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-medium text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-lg">
                {activeModule.label}
              </span>
              <form action={logoutAction}>
                <button type="submit" className="cc-btn-ghost text-xs px-3 py-2">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden md:flex w-56 min-h-[calc(100vh-57px)] flex-col border-r border-zinc-200 bg-white p-3 sticky top-[57px] self-start">
            <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Menu</p>
            <SidebarNav modules={appModules} active={activeModule.key} />
          </aside>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6 min-w-0">
            <ModulesView module={activeModule} />
          </main>
        </div>
      </div>
    </DashboardClient>
  );
}
