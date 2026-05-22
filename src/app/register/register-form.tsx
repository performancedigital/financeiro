"use client";

import { useActionState, useState } from "react";
import { registerAction } from "./actions";

type WorkspaceType = "EMPRESA" | "PESSOAL";

const MODELS: { type: WorkspaceType; icon: string; title: string; subtitle: string; features: string[] }[] = [
  {
    type: "EMPRESA",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    title: "Empresa / Agência",
    subtitle: "Para negócios, agências e empreendedores",
    features: ["Clientes e contratos", "MRR, ARR e LTV", "Contas a receber/pagar", "DRE e Fluxo de Caixa", "Importação CSV em massa"],
  },
  {
    type: "PESSOAL",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    title: "Finanças Pessoais",
    subtitle: "Para controle pessoal e familiar",
    features: ["Renda e gastos mensais", "Orçamento por categoria", "Carteira de investimentos", "Metas financeiras", "Reserva de emergência"],
  },
];

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, {});
  const [selectedType, setSelectedType] = useState<WorkspaceType>("EMPRESA");

  return (
    <form action={action} className="space-y-5">
      {/* Seleção do modelo */}
      <div>
        <p className="cc-label mb-2">Escolha seu modelo de painel *</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODELS.map((m) => (
            <button
              key={m.type}
              type="button"
              onClick={() => setSelectedType(m.type)}
              className={`rounded-xl border-2 p-4 text-left transition ${selectedType === m.type ? "border-blue-600 bg-blue-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${selectedType === m.type ? "bg-blue-600" : "bg-zinc-100"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selectedType === m.type ? "white" : "#71717a"} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
                </svg>
              </div>
              <p className={`text-sm font-bold mb-1 ${selectedType === m.type ? "text-blue-700" : "text-zinc-800"}`}>{m.title}</p>
              <p className="text-xs text-zinc-500 mb-2">{m.subtitle}</p>
              <ul className="space-y-0.5">
                {m.features.map((f) => (
                  <li key={f} className={`text-xs flex items-center gap-1.5 ${selectedType === m.type ? "text-blue-600" : "text-zinc-500"}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <input type="hidden" name="workspaceType" value={selectedType} />
      </div>

      <hr className="border-zinc-200" />

      <div>
        <label className="cc-label">Seu nome *</label>
        <input name="name" required placeholder="Ex: Helbert" className="cc-input" />
      </div>
      <div>
        <label className="cc-label">{selectedType === "EMPRESA" ? "Nome da empresa / agência *" : "Seu apelido ou nome do painel *"}</label>
        <input name="workspaceName" required placeholder={selectedType === "EMPRESA" ? "Ex: Performance Digital" : "Ex: Finanças Helbert"} className="cc-input" />
      </div>
      <div>
        <label className="cc-label">E-mail *</label>
        <input name="email" type="email" required placeholder="seu@email.com" className="cc-input" />
      </div>
      <div>
        <label className="cc-label">Senha *</label>
        <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="cc-input" />
      </div>
      <div>
        <label className="cc-label">Confirmar senha *</label>
        <input name="confirmPassword" type="password" required minLength={6} placeholder="Repita a senha" className="cc-input" />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full cc-btn-primary justify-center py-3">
        {pending ? "Criando..." : `Criar painel ${selectedType === "EMPRESA" ? "Empresarial" : "Pessoal"}`}
      </button>
    </form>
  );
}
