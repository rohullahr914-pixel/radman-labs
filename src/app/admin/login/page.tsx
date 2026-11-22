import { LoginForm } from "@/components/login-form";
import { configured } from "@/lib/supabase";
export default function Login() {
  return (
    <div className="panel login stack">
      <div className="eyebrow">Radman Labs / Owner access</div>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your applications.</p>
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
