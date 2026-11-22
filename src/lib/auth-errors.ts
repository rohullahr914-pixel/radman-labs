export function authMessage(code?: string, status?: number) {
  if (code === "email_not_confirmed")
    return "Confirm the owner email using the Supabase invitation, then try again.";
  if (code === "invalid_credentials")
    return "The email or password was not accepted. Use “Set or reset your password” to establish a new owner password. If no email arrives, the owner account may need to be invited in Supabase.";
  if (code === "email_provider_disabled" || code === "provider_disabled")
    return "Password sign-in is disabled for this project. Enable the Email provider in Supabase Authentication.";
  if (
    status === 429 ||
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit"
  )
    return "Too many attempts. Please wait a few minutes before trying again.";
  if (status === 401 || status === 403)
    return "The authentication service rejected this request. Check the production Supabase URL and public API key.";
  return "The authentication service could not be reached. Check the connection and the project configuration, then try again.";
}
