"use client";

import { useActionState } from "react";
import { registerAction } from "./actions";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="cc-label">Seu nome *</label>
        <input name="name" required placeholder="Ex: Helbert" className="cc-input" />
      </div>
      <div>
        <label className="cc-label">Nome da agência / empresa *</label>
        <input name="workspaceName" required placeholder="Ex: Performance Digital" className="cc-input" />
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

      {state.error ? (
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full cc-btn-primary justify-center"
      >
        {pending ? "Criando conta..." : "Criar minha conta"}
      </button>
    </form>
  );
}
