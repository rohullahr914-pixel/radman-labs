"use client";
import { useActionState, useState } from "react";
import { login, requestReset, setPassword } from "@/app/admin/login/actions";
import { Button } from "./ui/button";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  const [sent, setSent] = useState(false);
  const [resetError, setResetError] = useState("");
  return (
    <>
      <form action={action} className="stack">
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue="rohullahr914@gmail.com"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
          />
        </label>
        {state.error && (
          <p role="alert" className="error-text">
            {state.error}
          </p>
        )}
        <Button disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <Button
        className="mt-4"
        variant="ghost"
        disabled={sent}
        onClick={async () => {
          setSent(true);
          try {
            const result = await requestReset();
            setResetError(result.error);
            if (result.error) setSent(false);
          } catch {
            setResetError("Recovery request failed. Please try again.");
            setSent(false);
          }
        }}
      >
        Set or reset your password
      </Button>
      {resetError && (
        <p className="error-text" role="alert">
          {resetError}
        </p>
      )}
      {sent && !resetError && (
        <p className="success-text" role="status">
          If the account is configured, a secure link will arrive by email.
          Please wait before requesting another.
        </p>
      )}
    </>
  );
}
export function PasswordForm() {
  const [state, action, pending] = useActionState(setPassword, { error: "" });
  return (
    <form className="stack" action={action}>
      <label>
        New password
        <input
          name="password"
          type="password"
          minLength={12}
          maxLength={200}
          required
          autoComplete="new-password"
        />
      </label>
      <label>
        Confirm password
        <input
          name="confirm"
          type="password"
          minLength={12}
          maxLength={200}
          required
          autoComplete="new-password"
        />
      </label>
      {state.error && (
        <p className="error-text" role="alert">
          {state.error}
        </p>
      )}
      <Button disabled={pending}>Set password</Button>
    </form>
  );
}
