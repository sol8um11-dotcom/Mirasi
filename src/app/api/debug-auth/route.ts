import { NextResponse } from "next/server";

/**
 * Debug endpoint to check OAuth configuration.
 * DELETE THIS AFTER FIXING THE ISSUE.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check 1: Are env vars present?
  const envCheck = {
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
    anonKeyPresent: !!anonKey,
    anonKeyLength: anonKey?.length ?? 0,
  };

  // Check 2: Can we reach the Supabase auth settings?
  let authSettings = null;
  let authError = null;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    authSettings = await res.json();
  } catch (err) {
    authError = err instanceof Error ? err.message : String(err);
  }

  // Check 3: Test the Google OAuth authorize endpoint
  let oauthTest = null;
  let oauthError = null;
  try {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=https://mirasi.vercel.app/auth/callback`,
      {
        headers: { apikey: anonKey! },
        redirect: "manual", // Don't follow the redirect, just check it
      }
    );
    oauthTest = {
      status: res.status,
      location: res.headers.get("location")?.substring(0, 200) + "...",
      redirectsToGoogle: res.headers.get("location")?.includes("accounts.google.com") ?? false,
    };
  } catch (err) {
    oauthError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    envCheck,
    googleEnabled: authSettings?.external?.google ?? "unknown",
    phoneEnabled: authSettings?.external?.phone ?? "unknown",
    authError,
    oauthTest,
    oauthError,
    tip: "If googleEnabled=true and oauthTest redirects to Google, the issue is likely: (1) Google consent screen in Testing mode (only test users can sign in), or (2) Supabase Site URL / Redirect URLs not including mirasi.vercel.app",
  });
}
