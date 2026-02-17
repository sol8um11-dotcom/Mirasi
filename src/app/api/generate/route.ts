import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitGeneration, type GenerationParams } from "@/lib/fal";
import type { ApiResponse } from "@/types";
import { MAX_GENERATIONS_PER_DAY } from "@/lib/constants";
import { buildPrompt, getStyleConfig } from "@/lib/fal/prompts";

/**
 * POST /api/generate
 * Trigger AI generation for a pending generation record.
 *
 * Body: JSON { generationId: string }
 * Auth: Required (middleware-protected)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ generationId: string }>>> {
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
    const { generationId } = body;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: { message: "Missing generationId.", status: 400 } },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 3. Fetch generation and verify ownership + status
    const { data: generation, error: genError } = await admin
      .from("generations")
      .select("*, style:styles(*)")
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

    if (generation.status !== "pending") {
      return NextResponse.json(
        {
          error: {
            message: `Generation is already ${generation.status}.`,
            status: 409,
          },
        },
        { status: 409 }
      );
    }

    // 4. Rate-limit: generations today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount } = await admin
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString())
      .neq("status", "failed");

    if ((todayCount ?? 0) >= MAX_GENERATIONS_PER_DAY) {
      return NextResponse.json(
        {
          error: {
            message: `Daily limit reached (${MAX_GENERATIONS_PER_DAY}/day). Try again tomorrow.`,
            status: 429,
          },
        },
        { status: 429 }
      );
    }

    // 5. Get source image URL from Supabase Storage
    // Create a signed URL valid for 10 minutes (fal.ai needs to download it)
    const { data: signedUrlData, error: urlError } = await admin.storage
      .from("source-images")
      .createSignedUrl(generation.source_image_path, 600);

    if (urlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", urlError);
      return NextResponse.json(
        { error: { message: "Failed to access source image.", status: 500 } },
        { status: 500 }
      );
    }

    // 6. Build prompt and get style-specific generation config
    const style = generation.style;
    const subjectType = generation.subject_type as "human" | "pet";
    const styleConfig = getStyleConfig(style.slug);
    const prompt = buildPrompt(style.slug, subjectType, style.prompt_template);

    // 7. Submit to the appropriate fal.ai pipeline
    const genParams: GenerationParams = {
      imageUrl: signedUrlData.signedUrl,
      prompt,
      subjectType,
      guidanceScale: styleConfig.guidanceScale,
      numInferenceSteps: styleConfig.numInferenceSteps,
      // Apply LoRA if available for this style (trained for both humans and pets)
      ...(styleConfig.loraUrl
        ? { loraUrl: styleConfig.loraUrl, loraScale: styleConfig.loraScale }
        : {}),
    };

    const requestId = await submitGeneration(genParams);

    // 8. Update generation record
    const { error: updateError } = await admin
      .from("generations")
      .update({
        status: "processing",
        fal_request_id: requestId,
        prompt_used: prompt,
      })
      .eq("id", generationId);

    if (updateError) {
      console.error("Generation update error:", updateError);
    }

    return NextResponse.json(
      { data: { generationId } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Generate route error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
