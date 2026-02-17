import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Log all callback params for debugging
  const allParams = Object.fromEntries(searchParams.entries());
  console.log("[Callback] Received params:", JSON.stringify(allParams));
  console.log("[Callback] Origin:", origin);
  console.log("[Callback] Full URL:", request.url);

  // Handle OAuth error responses from Supabase (e.g. provider not configured)
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  if (errorParam) {
    console.error("[Callback] OAuth error:", errorParam, errorDesc);
    const msg = encodeURIComponent(errorDesc || errorParam || "unknown_error");
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${msg}`);
  }

  if (code) {
    console.log("[Callback] Got code, exchanging for session...");
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log("[Callback] Session exchange successful! Redirecting to:", next);
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("[Callback] Code exchange FAILED:", error.message, error);
      const msg = encodeURIComponent(`Code exchange failed: ${error.message}`);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${msg}`);
    }
  }

  // No code and no error — this shouldn't happen
  console.error("[Callback] No code and no error in callback. Params:", allParams);
  const msg = encodeURIComponent("No authorization code received. Please try again.");
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${msg}`);
}
