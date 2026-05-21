import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CaixaComando</h1>
          <p className="text-blue-200 text-sm">Crie sua conta e comece a controlar suas finanças</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-1">Criar conta</h2>
          <p className="text-sm text-zinc-500 mb-6">Cada conta tem seu painel separado e isolado</p>
          <RegisterForm />
          <p className="mt-4 text-sm text-center text-zinc-500">
            Já tem conta?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">Fazer login</a>
          </p>
        </div>
      </div>
    </main>
  );
}
