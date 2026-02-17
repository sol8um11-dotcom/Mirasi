import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Handle OAuth error responses from Supabase
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  if (errorParam) {
    const msg = encodeURIComponent(errorDesc || errorParam || "unknown_error");
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${msg}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
      const msg = encodeURIComponent(`Sign-in failed: ${error.message}`);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${msg}`);
    }
  }

  const msg = encodeURIComponent("No authorization code received. Please try again.");
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error&message=${msg}`);
}
