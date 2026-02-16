import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * POST /api/webhook/razorpay
 * Razorpay webhook handler — safety net for payment.captured / payment.failed.
 * No auth required (excluded from middleware protectedPaths).
 * Always returns 200 to prevent Razorpay retries.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";

    // 2. Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ status: "invalid_signature" }, { status: 200 });
    }

    // 3. Parse event
    const event = JSON.parse(rawBody);
    const eventType: string = event.event;

    const admin = createAdminClient();

    if (eventType === "payment.captured") {
      await handlePaymentCaptured(admin, event.payload);
    } else if (eventType === "payment.failed") {
      await handlePaymentFailed(admin, event.payload);
    }

    // Always 200 — prevent Razorpay retries
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200 to avoid infinite retries
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

async function handlePaymentCaptured(
  admin: ReturnType<typeof createAdminClient>,
  payload: { payment: { entity: RazorpayPaymentEntity } }
) {
  const payment = payload.payment.entity;
  const razorpayOrderId = payment.order_id;

  // Find our order
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (!order) {
    console.error("Webhook: order not found for", razorpayOrderId);
    return;
  }

  // Idempotent: skip if already paid
  if (order.status === "paid") return;

  // Update order to paid
  await admin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id);

  // Insert payment record (idempotent check)
  const { data: existingPayment } = await admin
    .from("payments")
    .select("id")
    .eq("razorpay_payment_id", payment.id)
    .maybeSingle();

  if (!existingPayment) {
    await admin.from("payments").insert({
      order_id: order.id,
      razorpay_payment_id: payment.id,
      razorpay_signature: "", // webhook doesn't have client signature
      amount: payment.amount,
      currency: payment.currency,
      status: "captured",
      verified: true,
    });
  }
}

async function handlePaymentFailed(
  admin: ReturnType<typeof createAdminClient>,
  payload: { payment: { entity: RazorpayPaymentEntity } }
) {
  const payment = payload.payment.entity;
  const razorpayOrderId = payment.order_id;

  // Find our order
  const { data: order } = await admin
    .from("orders")
    .select("id, status")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (!order) return;

  // Don't downgrade a paid order
  if (order.status === "paid") return;

  // Mark order as failed
  await admin
    .from("orders")
    .update({ status: "failed" })
    .eq("id", order.id);
}

/** Minimal Razorpay payment entity shape for webhook payload */
interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
}
