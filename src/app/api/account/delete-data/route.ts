import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types";

/**
 * POST /api/account/delete-data
 * DPDP Right to Erasure: delete all user-uploaded photos and generated images.
 * Keeps order/payment records for legal/financial compliance.
 *
 * Auth: Required
 */
export async function POST(): Promise<
  NextResponse<ApiResponse<{ deleted: boolean }>>
> {
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

    const admin = createAdminClient();

    // 1. Get all user's generations to find storage paths
    const { data: generations } = await admin
      .from("generations")
      .select("id, source_image_path, generated_image_path, preview_image_path")
      .eq("user_id", user.id);

    if (generations && generations.length > 0) {
      // 2. Collect all storage paths for deletion
      const sourcePaths: string[] = [];
      const generatedPaths: string[] = [];
      const previewPaths: string[] = [];

      for (const g of generations) {
        if (g.source_image_path) sourcePaths.push(g.source_image_path);
        if (g.generated_image_path) generatedPaths.push(g.generated_image_path);
        if (g.preview_image_path) previewPaths.push(g.preview_image_path);
      }

      // 3. Delete storage files in parallel
      const deletePromises: Promise<unknown>[] = [];

      if (sourcePaths.length > 0) {
        deletePromises.push(
          admin.storage.from("source-images").remove(sourcePaths)
        );
      }
      if (generatedPaths.length > 0) {
        deletePromises.push(
          admin.storage.from("generated-images").remove(generatedPaths)
        );
      }
      if (previewPaths.length > 0) {
        deletePromises.push(
          admin.storage.from("preview-images").remove(previewPaths)
        );
      }

      await Promise.allSettled(deletePromises);

      // 4. Clear image paths in generations (keep records for order reference)
      await admin
        .from("generations")
        .update({
          source_image_path: "",
          generated_image_path: null,
          preview_image_path: null,
        })
        .eq("user_id", user.id);
    }

    // 5. Revoke DPDP consent
    await admin
      .from("profiles")
      .update({
        dpdp_consent: false,
        dpdp_consent_at: null,
      })
      .eq("id", user.id);

    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error("Delete data error:", err);
    return NextResponse.json(
      { error: { message: "Internal server error.", status: 500 } },
      { status: 500 }
    );
  }
}
