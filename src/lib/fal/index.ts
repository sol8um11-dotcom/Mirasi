import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

// ─── Model Endpoints ─────────────────────────────────────────────────────────

/**
 * Flux Dev img2img — FULL repaint with strength control ($0.03/MP)
 * Used for human portraits and pet fallback. Regenerates the entire image
 * at the specified strength level, producing true painterly artwork.
 */
const FLUX_DEV_IMG2IMG = "fal-ai/flux/dev/image-to-image" as const;

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
  /** Transformation intensity (0.01-1.0). Higher = more repaint. Only for Flux Dev img2img. */
  strength?: number;
  /** Seed for reproducibility */
  seed?: number;
}

/**
 * Submit a generation job to the appropriate fal.ai pipeline.
 *
 * ROUTING RULES (V9):
 * - Human portraits → Flux Dev img2img (full repaint with strength control)
 * - Pet portraits with LoRA → Kontext LoRA (trained style LoRAs)
 * - Pet portraits without LoRA → Flux Dev img2img (same as humans)
 *
 * WHY NOT KONTEXT PRO:
 * Kontext Pro is an IMAGE EDITING model — it preserves the input photo by design.
 * This produces "photo with accessories" instead of "fully transformed artwork."
 * Flux Dev img2img with high strength (0.85-0.92) regenerates the ENTIRE image,
 * producing true painterly output comparable to competitors like Fable.
 *
 * LoRAs were trained on PET datasets only. Applying them to human
 * subjects destroys identity and causes gender-swapping artifacts.
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
      // Kontext LoRA API defaults: guidance_scale 2.5, steps 30, strength 0.88
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
    // ─── Flux Dev img2img: Full repaint (humans + pet fallback) ───
    // strength controls how much of the original image is preserved:
    //   0.85 = heavy transformation, some composition preserved (good for naturalistic styles)
    //   0.90 = near-total repaint (good for abstract/geometric styles like Warli)
    //   0.95 = almost completely regenerated
    const fluxInput: Record<string, unknown> = {
      image_url: params.imageUrl,
      prompt: params.prompt,
      strength: params.strength ?? 0.87,
      guidance_scale: params.guidanceScale ?? 7.0,
      num_inference_steps: params.numInferenceSteps ?? 40,
      output_format: "jpeg",
      enable_safety_checker: true,
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    const result = await fal.queue.submit(FLUX_DEV_IMG2IMG, {
      input: fluxInput as never,
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
  const model = hasLora ? KONTEXT_LORA : FLUX_DEV_IMG2IMG;

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
  const model = hasLora ? KONTEXT_LORA : FLUX_DEV_IMG2IMG;

  const result = await fal.queue.result(model, {
    requestId,
  });

  return result.data as FalGenerationResult;
}
