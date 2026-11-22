import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
export function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function sessionClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Proxy refreshes cookies for server components. */
          }
        },
      },
    },
  );
}
export async function requireAdmin() {
  if (!configured())
    throw new Error(
      "Supabase is not configured. Follow the README setup steps.",
    );
  const db = await sessionClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user || user.email !== "rohullahr914@gmail.com")
    throw new Error("Administrator access required.");
  const { data } = await db
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .eq("role", "admin")
    .single();
  if (!data) throw new Error("Administrator access required.");
  return db;
}
