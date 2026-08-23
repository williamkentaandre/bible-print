import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { contactsConfigured, listContacts } from "@/lib/contacts";

function exportSecret() {
  return (process.env.CONTACTS_EXPORT_SECRET || process.env.SESSION_SECRET || "").trim();
}

function sameSecret(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const expected = exportSecret();
  const given =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    request.nextUrl.searchParams.get("secret")?.trim() ||
    "";
  if (!expected || !sameSecret(given, expected)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!contactsConfigured()) {
    return NextResponse.json({ error: "Base non configurée." }, { status: 503 });
  }

  const rows = await listContacts();
  const header = [
    "email",
    "first_seen",
    "last_seen",
    "locale",
    "source",
    "paid",
    "last_reference",
  ];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        csvCell(row.email),
        csvCell(row.first_seen),
        csvCell(row.last_seen),
        csvCell(row.locale),
        csvCell(row.source),
        csvCell(row.paid ? "1" : "0"),
        csvCell(row.last_reference),
      ].join(","),
    ),
  ];

  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bibledeco-contacts.csv"',
    },
  });
}
