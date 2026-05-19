import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-zinc-100 to-zinc-200 p-4">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-6 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">CaixaComando</p>
          <h1 className="text-2xl font-bold text-zinc-900">Acesse sua central financeira</h1>
          <p className="text-sm text-zinc-600">MVP Etapas 1 e 2: base funcional com autenticação.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
