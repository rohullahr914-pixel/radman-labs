import { NextRequest, NextResponse } from "next/server";
import { sessionClient, configured } from "@/lib/supabase";
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  if (!configured()) return NextResponse.redirect(new URL("/admin/login", url));
  const db = await sessionClient();
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  let ok = false;
  if (token_hash && (type === "invite" || type === "recovery")) {
    const { error } = await db.auth.verifyOtp({ token_hash, type });
    ok = !error;
  } else if (code) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    ok = !error;
  }
  return NextResponse.redirect(
    new URL(ok ? "/admin/password" : "/admin/login?link=invalid", url),
  );
}
