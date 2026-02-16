import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/razorpay";
import { PRICING } from "@/lib/constants";
import type { ApiResponse } from "@/types";

interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

/**
 * POST /api/order/create
 * Create a Razorpay order for a completed generation.
 *
 * Body: JSON { generationId: string, plan?: "single" | "pack3" | "pack5" }
 * Auth: Required (middleware-protected)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CreateOrderResponse>>> {
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
    const { generationId, plan = "single" } = body;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: { message: "Missing generationId.", status: 400 } },
        { status: 400 }
      );
    }

    const amount =
      PRICING.digital[plan as keyof typeof PRICING.digital] ??
      PRICING.digital.single;

    const admin = createAdminClient();

    // 3. Fetch generation and verify ownership + status
    const { data: generation, error: genError } = await admin
      .from("generations")
      .select("id, user_id, status, generated_image_path")
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

    if (generation.status !== "completed") {
      return NextResponse.json(
        { error: { message: "Generation not completed yet.", status: 400 } },
        { status: 400 }
      );
    }

    // 4. Check for existing paid order (prevent double-purchase)
    const { data: existingOrder } = await admin
      .from("orders")
      .select("id")
      .eq("generation_id", generationId)
      .eq("status", "paid")
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json(
        { error: { message: "Already purchased.", status: 409 } },
        { status: 409 }
      );
    }

    // 5. Create Razorpay order
    const orderId = crypto.randomUUID();
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: orderId,
      notes: {
        generationId,
        userId: user.id,
      },
    });

    // 6. Insert order row
    const { error: insertError } = await admin.from("orders").insert({
      id: orderId,
      user_id: user.id,
      generation_id: generationId,
      razorpay_order_id: razorpayOrder.id,
      amount,
      currency: "INR",
      status: "created",
    });

    if (insertError) {
      console.error("Order insert error:", insertError);
      return NextResponse.json(
        { error: { message: "Failed to create order.", status: 500 } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          orderId,
          razorpayOrderId: razorpayOrder.id,
          amount,
          currency: "INR",
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
