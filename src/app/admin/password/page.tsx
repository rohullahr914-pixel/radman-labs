import { PasswordForm } from "@/components/login-form";
export default function Password() {
  return (
    <div className="panel login stack">
      <h1>Set your password.</h1>
      <p>
        Use the secure link sent by Supabase. Choose at least 12 characters.
      </p>
      <PasswordForm />
    </div>
  );
}
