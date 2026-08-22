import { NextResponse } from "next/server";
import { listPaidOrders } from "@/lib/orders";
import { getSessionEmail } from "@/lib/session";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Connectez-vous." }, { status: 401 });
  }
  const orders = await listPaidOrders(email);
  return NextResponse.json({ email, orders });
}
