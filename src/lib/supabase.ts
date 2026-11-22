import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseConfig } from "./supabase-config";
export const configured = () => Boolean(supabaseConfig());
export function publicClient() {
  return createClient(supabaseConfig()!.url, supabaseConfig()!.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function sessionClient() {
  const jar = await cookies();
  return createServerClient(supabaseConfig()!.url, supabaseConfig()!.key, {
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
  });
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
