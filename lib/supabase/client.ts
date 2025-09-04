import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a browser-safe Supabase client.
 *
 * SECURITY NOTES:
 * - Only use the anon key here. NEVER use the service role key in client-side code.
 * - Ensure Row Level Security (RLS) is enabled and policies are applied to all tables.
 * - Use server-side clients for privileged operations (see lib/supabase/server.ts).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Check your .env.local configuration."
    );
  }

  if (!anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Ensure only the anon key is used here."
    );
  }

  if (anonKey.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
    // Basic guard: prevents accidental use of service role keys by mistake
    console.warn(
      "⚠️ Warning: Make sure you are not using the service role key in NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Only the anon key should ever be exposed client-side."
    );
  }

  return createBrowserClient(url, anonKey);
}