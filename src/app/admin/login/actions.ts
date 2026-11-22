"use server";
import { configured, sessionClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { authMessage } from "@/lib/auth-errors";
import { z } from "zod";
export async function login(_state: { error: string }, form: FormData) {
  if (!configured())
    return {
      error:
        "Supabase is not configured. Follow the README setup instructions.",
    };
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");
  if (
    email !== "rohullahr914@gmail.com" ||
    password.length < 1 ||
    password.length > 200
  )
    return { error: "Unable to sign in with those credentials." };
  const db = await sessionClient();
  let error;
  try {
    ({ error } = await db.auth.signInWithPassword({ email, password }));
  } catch {
    return { error: authMessage() };
  }
  if (error)
    console.error("Owner authentication failed", {
      code: error.code,
      status: error.status,
    });
  if (error)
    return {
      error: authMessage(error.code, error.status),
    };
  const { data, error: profileError } = await db
    .from("admin_profiles")
    .select("id")
    .eq("role", "admin")
    .single();
  if (!data) {
    await db.auth.signOut();
    return {
      error:
        profileError?.code === "42P01"
          ? "Database setup is incomplete. Apply the Supabase migrations, then provision the owner."
          : "Sign-in succeeded, but owner authorization is missing. Run supabase/bootstrap-admin.sql for the invited owner account.",
    };
  }
  redirect("/admin");
}
export async function requestReset() {
  if (!configured())
    return { error: "Supabase is not configured. Connect the project first." };
  const db = await sessionClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site)
    return {
      error: "The site origin is not configured. Set NEXT_PUBLIC_SITE_URL.",
    };
  try {
    const { error } = await db.auth.resetPasswordForEmail(
      "rohullahr914@gmail.com",
      { redirectTo: `${site}/auth/confirm` },
    );
    return error
      ? { error: authMessage(error.code, error.status) }
      : { error: "" };
  } catch {
    return { error: authMessage() };
  }
}
export async function setPassword(_state: { error: string }, form: FormData) {
  if (!configured()) return { error: "Supabase is not configured." };
  const parsed = z.string().min(12).max(200).safeParse(form.get("password"));
  if (!parsed.success)
    return { error: "Use a password of at least 12 characters." };
  if (form.get("password") !== form.get("confirm"))
    return { error: "Passwords do not match." };
  const db = await sessionClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user || user.email !== "rohullahr914@gmail.com")
    return { error: "Open a valid invitation or password reset link first." };
  const { error } = await db.auth.updateUser({ password: parsed.data });
  if (error)
    return { error: "Unable to set password. Request a fresh reset link." };
  await db.auth.signOut();
  redirect("/admin/login?updated=1");
}
