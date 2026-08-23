import { NextRequest, NextResponse } from "next/server";
import { saveContact } from "@/lib/contacts";
import { parseLocale } from "@/i18n";
import { isEmail, normalizeEmail } from "@/lib/session";

export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    locale?: string;
    reference?: string;
    source?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const source =
    body.source === "login" || body.source === "checkout" || body.source === "paid"
      ? body.source
      : "lead";

  await saveContact({
    email,
    locale: parseLocale(body.locale),
    source,
    reference: body.reference,
  });

  return NextResponse.json({ ok: true });
}
