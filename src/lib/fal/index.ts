import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

// ─── Model Endpoints ─────────────────────────────────────────────────────────

/**
 * Kontext Pro — identity-preserving style transfer ($0.04/image)
 * Best identity preservation of any model on fal.ai.
 * Limitation: editing model, not full repaint — but identity is non-negotiable.
 * We compensate with aggressive prompts + high guidance_scale.
 */
const KONTEXT_PRO = "fal-ai/flux-pro/kontext" as const;

/** Kontext LoRA — custom LoRA weights for pet style adherence ($0.035/MP) */
const KONTEXT_LORA = "fal-ai/flux-kontext-lora" as const;

// ─── Generation Parameters ───────────────────────────────────────────────────

export interface GenerationParams {
  imageUrl: string;
  prompt: string;
  subjectType: "human" | "pet";
  /** LoRA URL — ONLY used for pet subjects (pet-trained LoRAs) */
  loraUrl?: string;
  /** LoRA weight scale (0-2, default 1.0 per API docs) */
  loraScale?: number;
  /** How strongly the model follows the prompt */
  guidanceScale?: number;
  /** Number of inference steps */
  numInferenceSteps?: number;
  /** Transformation intensity — used by LoRA pipeline only. Kontext Pro does not support this. */
  strength?: number;
  /** Seed for reproducibility */
  seed?: number;
}

/**
 * Submit a generation job to the appropriate fal.ai pipeline.
 *
 * ROUTING RULES (V9b — Kontext Pro restored):
 * - Human portraits → Kontext Pro (identity preservation is non-negotiable)
 * - Pet portraits with LoRA → Kontext LoRA (trained style LoRAs)
 * - Pet portraits without LoRA → Kontext Pro (fallback)
 *
 * V9 LESSON LEARNED:
 * Flux Dev img2img has `strength` for full repaint, but DESTROYS identity.
 * Kontext Pro preserves identity but undertransforms.
 * Solution: Push Kontext Pro harder with guidance_scale 7.0+ and V9 prompts.
 * Future: Two-step pipeline (paint with Flux Dev → face-restore with PuLID/InstantID).
 */
export async function submitGeneration(
  params: GenerationParams
): Promise<string> {
  if (params.loraUrl) {
    // ─── LoRA pipeline: Kontext LoRA (PET subjects only) ───
    const loraInput: Record<string, unknown> = {
      image_url: params.imageUrl,
      prompt: params.prompt,
      loras: [
        {
          path: params.loraUrl,
          scale: params.loraScale ?? 1.0,
        },
      ],
      guidance_scale: params.guidanceScale ?? 2.5,
      num_inference_steps: params.numInferenceSteps ?? 30,
      strength: 0.88,
      output_format: "jpeg",
      resolution_mode: "match_input",
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    const result = await fal.queue.submit(KONTEXT_LORA, {
      input: loraInput as never,
    });
    return result.request_id;
  } else {
    // ─── Kontext Pro (humans + pet fallback) ───
    // Push guidance_scale to 7.0 with V9 aggressive prompts for maximum
    // style transformation while keeping Kontext Pro's identity preservation.
    // NOTE: Kontext Pro does NOT accept num_inference_steps or strength.
    const kontextInput: Record<string, unknown> = {
      image_url: params.imageUrl,
      prompt: params.prompt,
      guidance_scale: params.guidanceScale ?? 7.0,
      output_format: "jpeg",
      safety_tolerance: "2",
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    const result = await fal.queue.submit(KONTEXT_PRO, {
      input: kontextInput as never,
    });
    return result.request_id;
  }
}

/**
 * Check the status of a queued generation.
 * Routes to the correct endpoint based on which pipeline was used.
 */
export async function checkGenerationStatus(
  requestId: string,
  hasLora: boolean = false
): Promise<FalQueueResponse> {
  const model = hasLora ? KONTEXT_LORA : KONTEXT_PRO;

  const status = await fal.queue.status(model, {
    requestId,
    logs: false,
  });

  return {
    request_id: requestId,
    status: status.status as FalQueueResponse["status"],
    response_url: status.response_url,
  };
}

/**
 * Get the completed result of a generation.
 * Only call this when status is COMPLETED.
 */
export async function getGenerationResult(
  requestId: string,
  hasLora: boolean = false
): Promise<FalGenerationResult> {
  const model = hasLora ? KONTEXT_LORA : KONTEXT_PRO;

  const result = await fal.queue.result(model, {
    requestId,
  });

  return result.data as FalGenerationResult;
}
