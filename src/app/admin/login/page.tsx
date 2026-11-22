import { LoginForm } from "@/components/login-form";
import { configured } from "@/lib/supabase";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ link?: string; updated?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="panel login stack">
      <div className="eyebrow">Radman Labs / Owner access</div>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your applications.</p>
      {params.link === "invalid" && (
        <p className="error-text" role="alert">
          This invitation or recovery link is invalid or expired. Request a
          fresh password link below.
        </p>
      )}
      {params.updated === "1" && (
        <p className="success-text" role="status">
          Your password has been updated. Sign in with your new password.
        </p>
      )}
      {!configured() && (
        <p className="notice">
          Setup required: connect Supabase and provision the owner account using
          the README.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
