import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const locale = request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/")
    ? "en"
    : "fr";
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|data/|scenes/).*)"],
};
