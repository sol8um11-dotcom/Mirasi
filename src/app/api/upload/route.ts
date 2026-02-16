import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";
import {
  MAX_IMAGE_SIZE_BYTES,
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOADS_PER_HOUR,
} from "@/lib/constants";

/**
 * POST /api/upload
 * Upload a compressed photo and create a generation record.
 *
 * Body: FormData { image: File, styleSlug: string, subjectType: "pet"|"human" }
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

    // 2. Parse FormData
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const styleSlug = formData.get("styleSlug") as string | null;
    const subjectType = formData.get("subjectType") as string | null;

    if (!image || !styleSlug || !subjectType) {
      return NextResponse.json(
        {
          error: {
            message: "Missing required fields: image, styleSlug, subjectType",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate image
    if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json(
        {
          error: {
            message: "Unsupported image type. Use JPG, PNG, or WebP.",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: { message: "Image too large. Maximum 10MB.", status: 400 } },
        { status: 400 }
      );
    }

    // 4. Validate subject type
    if (subjectType !== "pet" && subjectType !== "human") {
      return NextResponse.json(
        {
          error: {
            message: 'Subject type must be "pet" or "human".',
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 5. Rate-limit: uploads in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: uploadCount } = await admin
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if ((uploadCount ?? 0) >= MAX_UPLOADS_PER_HOUR) {
      return NextResponse.json(
        {
          error: {
            message: `Upload limit reached (${MAX_UPLOADS_PER_HOUR}/hour). Please try again later.`,
            status: 429,
          },
        },
        { status: 429 }
      );
    }

    // 6. Look up style by slug
    const { data: style, error: styleError } = await admin
      .from("styles")
      .select("id")
      .eq("slug", styleSlug)
      .eq("is_active", true)
      .single();

    if (styleError || !style) {
      return NextResponse.json(
        { error: { message: "Art style not found.", status: 404 } },
        { status: 404 }
      );
    }

    // 7. Generate a unique ID for the generation first (used in file path)
    const generationId = crypto.randomUUID();

    // 8. Upload image to Supabase Storage
    const imagePath = `${user.id}/${generationId}.jpg`;
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("source-images")
      .upload(imagePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: { message: "Failed to upload image.", status: 500 } },
        { status: 500 }
      );
    }

    // 9. Insert generation record
    const { error: insertError } = await admin.from("generations").insert({
      id: generationId,
      user_id: user.id,
      style_id: style.id,
      subject_type: subjectType,
      source_image_path: imagePath,
      status: "pending",
    });

    if (insertError) {
      console.error("Generation insert error:", insertError);
      // Clean up uploaded image
      await admin.storage.from("source-images").remove([imagePath]);
      return NextResponse.json(
        { error: { message: "Failed to create generation.", status: 500 } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { generationId } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
