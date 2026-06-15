import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses ALL RLS policies.
// Only import this in server-side code (API routes, server components).
// Never expose to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Add it to .env.local (Supabase dashboard → Settings → API → service_role)."
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
