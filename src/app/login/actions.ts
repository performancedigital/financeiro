"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validators";
import { setSessionCookie, validateCredentials } from "@/lib/auth";

type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos." };
  }

  const valid = validateCredentials(parsed.data.email, parsed.data.password);
  if (!valid) return { error: "Credenciais invalidas." };

  await setSessionCookie();
  redirect("/dashboard");
}
