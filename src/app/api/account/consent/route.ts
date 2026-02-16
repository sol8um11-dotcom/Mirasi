import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DPDP_CONSENT_VERSION } from "@/lib/constants";
import type { ApiResponse } from "@/types";

/**
 * POST /api/account/consent
 * Update DPDP and marketing consent preferences.
 *
 * Body: JSON { dpdpConsent: boolean, marketingConsent: boolean }
 * Auth: Required
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ updated: boolean }>>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { message: "Authentication required", status: 401 } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dpdpConsent, marketingConsent } = body;

    if (typeof dpdpConsent !== "boolean" || typeof marketingConsent !== "boolean") {
      return NextResponse.json(
        { error: { message: "Invalid consent values.", status: 400 } },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("profiles")
      .update({
        dpdp_consent: dpdpConsent,
        dpdp_consent_at: dpdpConsent ? new Date().toISOString() : null,
        dpdp_consent_version: dpdpConsent ? DPDP_CONSENT_VERSION : null,
        marketing_consent: marketingConsent,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Consent update error:", error);
      return NextResponse.json(
        { error: { message: "Failed to update preferences.", status: 500 } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { updated: true } });
  } catch (err) {
    console.error("Consent error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
