import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkGenerationStatus,
  getGenerationResult,
  type PipelineType,
} from "@/lib/fal";
import { getStyleConfig } from "@/lib/fal/prompts";
import { watermarkImage } from "@/lib/image/watermark";
import type { ApiResponse, GenerationStatus } from "@/types";

interface GenerationStatusResponse {
  status: GenerationStatus;
  previewUrl?: string;
  error?: string;
}

/**
 * Derive which fal.ai pipeline was used from the generation record.
 * This is deterministic from subject_type + style LoRA availability.
 */
function derivePipeline(
  subjectType: string,
  styleSlug: string | undefined
): PipelineType {
  if (subjectType === "human") {
    return "pulid";
  }
  if (subjectType === "pet" && styleSlug) {
    const config = getStyleConfig(styleSlug);
    if (config.loraUrl) {
      return "kontext-lora";
    }
  }
  return "kontext-pro";
}

/**
 * GET /api/generation/[id]
 * Poll the status of a generation. When complete, post-processes
 * (watermark + storage upload) and returns the preview URL.
 *
 * Auth: Required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<GenerationStatusResponse>>> {
  try {
    const { id: generationId } = await params;

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

    // 2. Fetch generation (with style slug) and verify ownership
    const { data: generation, error: genError } = await admin
      .from("generations")
      .select("*, style:styles(slug)")
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

    // 3. If already completed, return existing preview
    if (generation.status === "completed" && generation.preview_image_path) {
      const { data: publicUrl } = admin.storage
        .from("preview-images")
        .getPublicUrl(generation.preview_image_path);

      return NextResponse.json({
        data: {
          status: "completed",
          previewUrl: publicUrl.publicUrl,
        },
      });
    }

    // 4. If failed, return error
    if (generation.status === "failed") {
      return NextResponse.json({
        data: {
          status: "failed",
          error: generation.error_message || "Generation failed.",
        },
      });
    }

    // 5. If pending (not yet submitted to fal.ai), return pending
    if (generation.status === "pending") {
      return NextResponse.json({
        data: { status: "pending" },
      });
    }

    // 6. Status is "processing" — check fal.ai queue
    if (!generation.fal_request_id) {
      return NextResponse.json({
        data: {
          status: "failed",
          error: "Missing fal.ai request ID.",
        },
      });
    }

    // Derive which pipeline was used from subject_type + style
    const pipeline = derivePipeline(
      generation.subject_type,
      generation.style?.slug
    );
    const falStatus = await checkGenerationStatus(
      generation.fal_request_id,
      pipeline
    );

    // Still processing
    if (
      falStatus.status === "IN_QUEUE" ||
      falStatus.status === "IN_PROGRESS"
    ) {
      return NextResponse.json({
        data: { status: "processing" },
      });
    }

    // Failed at fal.ai
    if (falStatus.status === "FAILED") {
      await admin
        .from("generations")
        .update({
          status: "failed",
          error_message: "AI generation failed. Please try again.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", generationId);

      return NextResponse.json({
        data: {
          status: "failed",
          error: "AI generation failed. Please try again.",
        },
      });
    }

    // 7. COMPLETED — post-process
    const startTime = new Date(generation.created_at).getTime();
    const generationTimeMs = Date.now() - startTime;

    try {
      // Fetch the generated result
      const result = await getGenerationResult(
        generation.fal_request_id,
        pipeline
      );

      if (!result.images || result.images.length === 0) {
        throw new Error("No images returned from AI.");
      }

      const generatedImageUrl = result.images[0].url;

      // Download the generated image
      const imageResponse = await fetch(generatedImageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download generated image.");
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Upload full-res (unwatermarked) to generated-images bucket
      const hdPath = `${user.id}/${generationId}-hd.png`;
      const { error: hdUploadError } = await admin.storage
        .from("generated-images")
        .upload(hdPath, imageBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (hdUploadError) {
        console.error("HD upload error:", hdUploadError);
      }

      // Apply watermark
      const watermarkedBuffer = await watermarkImage(imageBuffer);

      // Upload watermarked preview to preview-images bucket (public)
      const previewPath = `${generationId}-preview.jpg`;
      const { error: previewUploadError } = await admin.storage
        .from("preview-images")
        .upload(previewPath, watermarkedBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (previewUploadError) {
        console.error("Preview upload error:", previewUploadError);
        throw new Error("Failed to save preview image.");
      }

      // Get public URL for the preview
      const { data: publicUrl } = admin.storage
        .from("preview-images")
        .getPublicUrl(previewPath);

      // Update generation record
      await admin
        .from("generations")
        .update({
          status: "completed",
          generated_image_path: hdPath,
          preview_image_path: previewPath,
          generation_time_ms: generationTimeMs,
          completed_at: new Date().toISOString(),
        })
        .eq("id", generationId);

      return NextResponse.json({
        data: {
          status: "completed",
          previewUrl: publicUrl.publicUrl,
        },
      });
    } catch (processError) {
      console.error("Post-processing error:", processError);

      // Mark as failed
      await admin
        .from("generations")
        .update({
          status: "failed",
          error_message:
            processError instanceof Error
              ? processError.message
              : "Post-processing failed.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", generationId);

      return NextResponse.json({
        data: {
          status: "failed",
          error: "Failed to process generated image. Please try again.",
        },
      });
    }
  } catch (err) {
    console.error("Generation status route error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
