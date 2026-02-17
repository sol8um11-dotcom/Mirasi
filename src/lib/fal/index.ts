import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

// ─── Model Endpoints ─────────────────────────────────────────────────────────

/** Kontext Pro — best identity preservation + style transfer ($0.04/image) */
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
  /** How strongly the model follows the prompt (Kontext Pro default: 3.5, LoRA default: 2.5) */
  guidanceScale?: number;
  /** Number of inference steps (Kontext Pro: up to 50, LoRA: 10-50 default 30) */
  numInferenceSteps?: number;
  /** Seed for reproducibility */
  seed?: number;
}

/**
 * Submit a generation job to the appropriate fal.ai pipeline.
 *
 * ROUTING RULES:
 * - Human portraits → ALWAYS Kontext Pro (maximum identity preservation)
 * - Pet portraits with LoRA → Kontext LoRA (trained style LoRAs)
 * - Pet portraits without LoRA → Kontext Pro (fallback)
 *
 * LoRAs were trained on PET datasets only. Applying them to human
 * subjects destroys identity and causes gender-swapping artifacts.
 */
export async function submitGeneration(
  params: GenerationParams
): Promise<string> {
  // Note: Kontext image-to-image endpoints do NOT support image_size —
  // they output at the input image's resolution. The client already
  // compresses/resizes to 1024×1024 max, so output matches input.

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
      // strength: how much to transform the input (0.01-1.0, default 0.88)
      // docs say "higher values are better for this model"
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
    // ─── No LoRA: Kontext Pro (human portraits + pet fallback) ───
    // NOTE: Kontext Pro does NOT accept num_inference_steps — it handles
    // step count internally. Only send supported params.
    const kontextInput: Record<string, unknown> = {
      image_url: params.imageUrl,
      prompt: params.prompt,
      // Kontext Pro API default guidance_scale is 3.5
      guidance_scale: params.guidanceScale ?? 3.5,
      output_format: "jpeg",
      // safety_tolerance 2 = moderate (1=strictest, 6=most permissive)
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
