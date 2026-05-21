"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { validateCredentials, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
});

type State = { error?: string };

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const session = await validateCredentials(parsed.data.email, parsed.data.password);
  if (!session) return { error: "E-mail ou senha incorretos." };

  await setSessionCookie(session);
  redirect("/dashboard");
}

export async function logoutAction() {
  const { clearSessionCookie } = await import("@/lib/auth");
  await clearSessionCookie();
  redirect("/login");
}
