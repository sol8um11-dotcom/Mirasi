import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

interface DownloadResponse {
  downloadUrl: string;
}

/**
 * GET /api/download/[generationId]
 * Get a signed URL for HD image download.
 * Requires auth + verified payment for the generation.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
): Promise<NextResponse<ApiResponse<DownloadResponse>>> {
  try {
    const { generationId } = await params;

    // 1. Authenticate
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

    const admin = createAdminClient();

    // 2. Verify generation ownership
    const { data: generation, error: genError } = await admin
      .from("generations")
      .select("id, user_id, generated_image_path")
      .eq("id", generationId)
      .single();

    if (genError || !generation) {
      return NextResponse.json(
        { error: { message: "Generation not found.", status: 404 } },
        { status: 404 }
      );
    }

    if (generation.user_id !== user.id) {
      return NextResponse.json(
        { error: { message: "Unauthorized.", status: 403 } },
        { status: 403 }
      );
    }

    // 3. Check for verified payment (order → payment)
    const { data: paidOrder } = await admin
      .from("orders")
      .select("id")
      .eq("generation_id", generationId)
      .eq("status", "paid")
      .maybeSingle();

    if (!paidOrder) {
      return NextResponse.json(
        { error: { message: "Payment required.", status: 403 } },
        { status: 403 }
      );
    }

    // Get payment record for download tracking
    const { data: paymentRecord } = await admin
      .from("payments")
      .select("id")
      .eq("order_id", paidOrder.id)
      .maybeSingle();

    // 4. Generate signed URL (5 min expiry)
    if (!generation.generated_image_path) {
      return NextResponse.json(
        { error: { message: "Generated image not found.", status: 404 } },
        { status: 404 }
      );
    }

    const { data: signedData, error: signError } = await admin.storage
      .from("generated-images")
      .createSignedUrl(generation.generated_image_path, 300);

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: { message: "Failed to create download URL.", status: 500 } },
        { status: 500 }
      );
    }

    // 5. Log download
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    await admin.from("downloads").insert({
      generation_id: generationId,
      user_id: user.id,
      payment_id: paymentRecord?.id ?? null,
      download_type: "hd",
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json({
      data: { downloadUrl: signedData.signedUrl },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
