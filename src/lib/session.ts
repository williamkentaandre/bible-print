import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "bd_session";
const DAY = 60 * 60 * 24;

function secret() {
  return process.env.SESSION_SECRET || process.env.STRIPE_SECRET_KEY || "";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function pack(payload: string) {
  return `${payload}.${sign(payload)}`;
}

function unpack(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const given = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function createMagicToken(email: string, days = 7) {
  const exp = Date.now() + days * DAY * 1000;
  return pack(`magic:${normalizeEmail(email)}:${exp}`);
}

export function readMagicToken(token: string): string | null {
  const payload = unpack(token);
  if (!payload?.startsWith("magic:")) return null;
  const parts = payload.split(":");
  const exp = Number(parts.at(-1));
  const email = parts.slice(1, -1).join(":");
  if (!email || !Number.isFinite(exp) || exp < Date.now()) return null;
  return email;
}

export async function setSessionEmail(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, pack(`sess:${normalizeEmail(email)}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * DAY,
  });
}

export async function getSessionEmail(): Promise<string | null> {
  if (!secret()) return null;
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const payload = unpack(raw);
  if (!payload?.startsWith("sess:")) return null;
  return payload.slice(5);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
