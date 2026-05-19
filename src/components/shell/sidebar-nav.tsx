import Link from "next/link";
import type { AppModule } from "@/lib/navigation";

type SidebarNavProps = {
  modules: AppModule[];
  active: string;
};

export function SidebarNav({ modules, active }: SidebarNavProps) {
  return (
    <aside className="cc-card h-fit p-3">
      <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Navegacao</p>
      <nav className="mt-2 space-y-1">
        {modules.map((item) => (
          <Link
            key={item.key}
            href={`/dashboard?mod=${item.key}`}
            className={[
              "block rounded-lg px-3 py-2 transition",
              active === item.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
            ].join(" ")}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className={active === item.key ? "text-xs text-blue-100" : "text-xs text-zinc-500"}>
              {item.description}
            </p>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
