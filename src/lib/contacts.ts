import { neon } from "@neondatabase/serverless";
import { isEmail, normalizeEmail } from "./session";

export type ContactSource = "lead" | "login" | "checkout" | "paid" | "free_download";

export type ContactRow = {
  email: string;
  first_seen: string;
  last_seen: string;
  locale: string | null;
  source: string;
  paid: boolean;
  last_reference: string | null;
};

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

function getSql() {
  const url = databaseUrl();
  if (!url) return null;
  return neon(url);
}

let tableReady = false;

async function ensureTable() {
  const sql = getSql();
  if (!sql || tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      email TEXT PRIMARY KEY,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      locale TEXT,
      source TEXT NOT NULL DEFAULT 'lead',
      paid BOOLEAN NOT NULL DEFAULT FALSE,
      last_reference TEXT
    )
  `;
  tableReady = true;
}

export function contactsConfigured() {
  return Boolean(databaseUrl());
}

export async function saveContact(options: {
  email: string;
  locale?: string | null;
  source?: ContactSource;
  reference?: string | null;
  paid?: boolean;
}) {
  const sql = getSql();
  if (!sql) return false;
  const email = normalizeEmail(options.email);
  if (!isEmail(email)) return false;
  const source = options.source ?? "lead";
  const paid = Boolean(options.paid || source === "paid");
  const locale = options.locale?.trim() || null;
  const reference = options.reference?.trim() || null;

  try {
    await ensureTable();
    await sql`
      INSERT INTO contacts (email, locale, source, paid, last_reference)
      VALUES (${email}, ${locale}, ${source}, ${paid}, ${reference})
      ON CONFLICT (email) DO UPDATE SET
        last_seen = NOW(),
        locale = COALESCE(EXCLUDED.locale, contacts.locale),
        paid = contacts.paid OR EXCLUDED.paid,
        last_reference = COALESCE(EXCLUDED.last_reference, contacts.last_reference),
        source = CASE
          WHEN contacts.paid OR EXCLUDED.paid THEN 'paid'
          WHEN EXCLUDED.source = 'checkout' OR contacts.source = 'checkout' THEN 'checkout'
          WHEN EXCLUDED.source = 'login' OR contacts.source = 'login' THEN 'login'
          WHEN EXCLUDED.source = 'free_download' THEN 'free_download'
          ELSE contacts.source
        END
    `;
    return true;
  } catch (cause) {
    console.error("saveContact", cause);
    return false;
  }
}

export async function listContacts(): Promise<ContactRow[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTable();
  const rows = await sql`
    SELECT email, first_seen, last_seen, locale, source, paid, last_reference
    FROM contacts
    ORDER BY last_seen DESC
  `;
  return rows as unknown as ContactRow[];
}
