"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createUser, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  workspaceName: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
  confirmPassword: z.string(),
  workspaceType: z.enum(["EMPRESA", "PESSOAL"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type State = { error?: string; success?: string };

export async function registerAction(_prev: State, formData: FormData): Promise<State> {
  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    workspaceName: String(formData.get("workspaceName") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    workspaceType: String(formData.get("workspaceType") ?? "EMPRESA"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      workspaceName: parsed.data.workspaceName,
      workspaceType: parsed.data.workspaceType,
    });

    const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId } });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.workspaceId,
      workspaceType: workspace?.workspaceType ?? "EMPRESA",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao criar conta." };
  }

  redirect("/dashboard");
}
