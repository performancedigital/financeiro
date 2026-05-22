import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Performance Finanças</h1>
          <p className="text-blue-200 text-sm">Seu painel financeiro inteligente</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-zinc-500 mb-6">Faça login para acessar seu painel</p>
          <LoginForm />
          <p className="mt-4 text-sm text-center text-zinc-500">
            Não tem conta?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">Criar agora</a>
          </p>
        </div>
      </div>
    </main>
  );
}
