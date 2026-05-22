import { ModulesView } from "@/components/modules/modules-view";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { requireSession } from "@/lib/auth";
import { getModules, findModuleIn } from "@/lib/navigation";
import { logoutAction } from "./actions";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const moduleParam = Array.isArray(params.mod) ? params.mod[0] : params.mod;

  const modules = getModules(session.workspaceType ?? "EMPRESA");
  const activeModule = findModuleIn(modules, moduleParam ?? modules[0].key) ?? modules[0];

  const isPessoal = (session.workspaceType ?? "EMPRESA") === "PESSOAL";

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isPessoal ? "bg-indigo-600" : "bg-blue-600"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {isPessoal
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>
                }
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 leading-none">Performance Finanças</p>
              <p className={`text-xs leading-none mt-0.5 ${isPessoal ? "text-indigo-600" : "text-blue-600"}`}>
                {isPessoal ? "Painel Pessoal" : "Painel Empresarial"} · {session.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm font-medium text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-lg">
              {activeModule.label}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="cc-btn-ghost text-xs px-3 py-2">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex w-56 min-h-[calc(100vh-57px)] flex-col border-r border-zinc-200 bg-white p-3 sticky top-[57px] self-start">
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Menu</p>
          <SidebarNav modules={modules} active={activeModule.key} accentColor={isPessoal ? "indigo" : "blue"} />
        </aside>
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <ModulesView module={activeModule} workspaceType={session.workspaceType ?? "EMPRESA"} />
        </main>
      </div>
    </div>
  );
}
