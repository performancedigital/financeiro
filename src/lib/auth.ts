import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "cc_session";
const DEFAULT_EMAIL = "admin@caixacomando.local";
const DEFAULT_PASSWORD = "admin123";
const DEFAULT_NAME = "Helbert";
const DEFAULT_WORKSPACE = "ws_caixacomando";

const getSecret = () => {
  const raw = process.env.NEXTAUTH_SECRET ?? "change-me";
  return new TextEncoder().encode(raw);
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  workspaceId: string;
};

export const validateCredentials = (email: string, password: string) => {
  return email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD;
};

export const createSessionToken = async () => {
  const payload: SessionPayload = {
    sub: "usr_admin",
    email: DEFAULT_EMAIL,
    name: DEFAULT_NAME,
    workspaceId: DEFAULT_WORKSPACE,
  };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
};

export const setSessionCookie = async () => {
  const token = await createSessionToken();
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
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
};
