"use server";
import { configured, sessionClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
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
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error)
    return {
      error: "Unable to sign in. Check your credentials or try again later.",
    };
  const { data } = await db.from("admin_profiles").select("id").single();
  if (!data) {
    await db.auth.signOut();
    return { error: "Administrator access has not been provisioned." };
  }
  redirect("/admin");
}
export async function requestReset() {
  if (!configured()) return;
  const db = await sessionClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return;
  await db.auth.resetPasswordForEmail("rohullahr914@gmail.com", {
    redirectTo: `${site}/auth/confirm`,
  });
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
