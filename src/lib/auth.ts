import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { seedWorkspaceOptions } from "@/lib/db-service";

const SESSION_COOKIE = "cc_session";

const getSecret = () =>
  new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "change-me-in-production");

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  workspaceId: string;
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const validateCredentials = async (
  email: string,
  password: string,
): Promise<SessionPayload | null> => {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim(), deletedAt: null },
  });
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    workspaceId: user.workspaceId,
  };
};

export const createUser = async (params: {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}) => {
  const existing = await prisma.user.findFirst({
    where: { email: params.email.toLowerCase().trim() },
  });
  if (existing) throw new Error("E-mail já cadastrado.");

  const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const passwordHash = await hashPassword(params.password);

  await prisma.workspace.create({
    data: { id: workspaceId, name: params.workspaceName },
  });

  const user = await prisma.user.create({
    data: {
      workspaceId,
      name: params.name.trim(),
      email: params.email.toLowerCase().trim(),
      passwordHash,
      role: "OWNER",
    },
  });

  await seedWorkspaceOptions(workspaceId);

  return user;
};

export const createSessionToken = async (payload: SessionPayload) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());

export const setSessionCookie = async (payload: SessionPayload) => {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, getSecret());
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
};

export const requireSession = async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
};

export const requireApiSession = async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
};
