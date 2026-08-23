import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "bd_studio";
const YEAR = 60 * 60 * 24 * 365;

export function studioSecret() {
  return (
    process.env.STUDIO_SECRET ||
    process.env.CONTACTS_EXPORT_SECRET ||
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV !== "production" ? "studio-local" : "")
  ).trim();
}

export function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

function sign(value: string) {
  return createHmac("sha256", studioSecret()).update(value).digest("base64url");
}

export async function setStudioSession() {
  const payload = `studio:${Date.now() + YEAR * 1000}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: YEAR,
  });
}

export async function clearStudioSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function hasStudioSession() {
  const expected = studioSecret();
  if (!expected) return false;
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = raw.slice(0, dot);
  const given = raw.slice(dot + 1);
  const expectedSig = sign(payload);
  const a = Buffer.from(given);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  if (!payload.startsWith("studio:")) return false;
  const exp = Number(payload.slice(7));
  return Number.isFinite(exp) && exp > Date.now();
}
