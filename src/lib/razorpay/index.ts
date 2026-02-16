import Razorpay from "razorpay";
import crypto from "crypto";
import type { RazorpayOrderResponse } from "@/types";

// Lazy-initialized singleton — avoids module-level side effects
let instance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return instance;
}

/**
 * Create a Razorpay order (server-side only).
 * Amount is in paise (e.g. 9900 = Rs 99).
 */
export async function createRazorpayOrder(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    notes: params.notes ?? {},
  });

  return order as unknown as RazorpayOrderResponse;
}

/**
 * Verify Razorpay payment signature (client callback verification).
 * Uses RAZORPAY_KEY_SECRET with HMAC-SHA256 over "orderId|paymentId".
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

/**
 * Verify Razorpay webhook signature.
 * Uses RAZORPAY_WEBHOOK_SECRET with HMAC-SHA256 over the raw request body.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
