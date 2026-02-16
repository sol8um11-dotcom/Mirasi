import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay";
import type { ApiResponse } from "@/types";

interface VerifyPaymentResponse {
  downloadUrl: string;
  generationId: string;
}

/**
 * POST /api/verify-payment
 * Verify Razorpay payment signature after checkout success callback.
 *
 * Body: JSON { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Auth: Required
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<VerifyPaymentResponse>>> {
  try {
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

    // 2. Parse body
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: { message: "Missing payment fields.", status: 400 } },
        { status: 400 }
      );
    }

    // 3. Verify HMAC signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: { message: "Invalid payment signature.", status: 400 } },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 4. Look up order
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, user_id, generation_id, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: { message: "Order not found.", status: 404 } },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: { message: "Unauthorized.", status: 403 } },
        { status: 403 }
      );
    }

    // 5. Idempotent: if already paid, return download URL directly
    if (order.status === "paid") {
      const downloadUrl = await getSignedDownloadUrl(admin, order.generation_id);
      return NextResponse.json({
        data: { downloadUrl, generationId: order.generation_id },
      });
    }

    // 6. Update order to "paid"
    const { error: updateError } = await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json(
        { error: { message: "Failed to update order.", status: 500 } },
        { status: 500 }
      );
    }

    // 7. Fetch order amount for payment record
    const { data: orderData } = await admin
      .from("orders")
      .select("amount")
      .eq("id", order.id)
      .single();

    // 8. Insert payment record
    const { error: paymentError } = await admin.from("payments").insert({
      order_id: order.id,
      razorpay_payment_id,
      razorpay_signature,
      amount: orderData?.amount ?? 0,
      currency: "INR",
      status: "captured",
      verified: true,
    });

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      // Non-fatal: order is already marked paid
    }

    // 9. Generate signed download URL
    const downloadUrl = await getSignedDownloadUrl(admin, order.generation_id);

    return NextResponse.json({
      data: { downloadUrl, generationId: order.generation_id },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}

/**
 * Get a 5-minute signed URL for the HD generated image.
 */
async function getSignedDownloadUrl(
  admin: ReturnType<typeof createAdminClient>,
  generationId: string
): Promise<string> {
  // Get the image path from the generation
  const { data: generation } = await admin
    .from("generations")
    .select("generated_image_path")
    .eq("id", generationId)
    .single();

  if (!generation?.generated_image_path) {
    throw new Error("Generated image not found.");
  }

  const { data, error } = await admin.storage
    .from("generated-images")
    .createSignedUrl(generation.generated_image_path, 300); // 5 minutes

  if (error || !data?.signedUrl) {
    throw new Error("Failed to create download URL.");
  }

  return data.signedUrl;
}
