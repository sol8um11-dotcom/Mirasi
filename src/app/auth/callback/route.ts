import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Handle OAuth error responses from Supabase (e.g. provider not configured)
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  if (errorParam) {
    console.error("OAuth callback error:", errorParam, errorDesc);
    const msg = encodeURIComponent(errorDesc || errorParam);
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
      console.error("Code exchange error:", error.message);
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
