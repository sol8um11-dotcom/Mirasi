import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

// ─── Model Endpoints ─────────────────────────────────────────────────────────

/** Kontext Pro for humans — best identity preservation + style transfer ($0.04/image) */
const KONTEXT_PRO = "fal-ai/flux-pro/kontext" as const;

/** Kontext LoRA for pets — custom LoRA weights improve style adherence for animals ($0.035/MP) */
const KONTEXT_LORA = "fal-ai/flux-kontext-lora" as const;

// ─── Generation Parameters ───────────────────────────────────────────────────

export interface GenerationParams {
  imageUrl: string;
  prompt: string;
  subjectType: "human" | "pet";
  /** LoRA URL for pet styles (used with KONTEXT_LORA endpoint) */
  loraUrl?: string;
  /** LoRA weight scale (0-4, default 0.85) */
  loraScale?: number;
  /** How strongly the model follows the prompt (default: 4.0 for humans, 3.5 for pets) */
  guidanceScale?: number;
  /** Number of inference steps (default: 50 for humans, 30 for pets) */
  numInferenceSteps?: number;
  /** Seed for reproducibility */
  seed?: number;
}

/**
 * Submit a generation job to the appropriate fal.ai pipeline.
 *
 * Human portraits → Kontext Pro (better facial identity preservation)
 * Pet portraits   → Kontext LoRA (custom style LoRAs for animal features)
 *                   Falls back to Kontext Pro if no LoRA is configured for the style
 */
export async function submitGeneration(
  params: GenerationParams
): Promise<string> {
  const useLora = params.subjectType === "pet" && params.loraUrl;

  if (useLora) {
    // ─── Pet pipeline: Kontext LoRA ───
    const result = await fal.queue.submit(KONTEXT_LORA, {
      input: {
        image_url: params.imageUrl,
        prompt: params.prompt,
        loras: [
          {
            path: params.loraUrl!,
            scale: params.loraScale ?? 0.85,
          },
        ],
        guidance_scale: params.guidanceScale ?? 3.5,
        num_inference_steps: params.numInferenceSteps ?? 30,
        output_format: "jpeg",
        ...(params.seed !== undefined && { seed: params.seed }),
      },
    });
    return result.request_id;
  } else {
    // ─── Human pipeline (or pet fallback): Kontext Pro ───
    // Cast input to bypass strict SDK types — the API accepts these params
    const kontextInput: Record<string, unknown> = {
      image_url: params.imageUrl,
      prompt: params.prompt,
      guidance_scale: params.guidanceScale ?? 4.0,
      num_inference_steps: params.numInferenceSteps ?? 50,
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
  subjectType: "human" | "pet" = "human",
  hasLora: boolean = false
): Promise<FalQueueResponse> {
  const model =
    subjectType === "pet" && hasLora ? KONTEXT_LORA : KONTEXT_PRO;

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
  subjectType: "human" | "pet" = "human",
  hasLora: boolean = false
): Promise<FalGenerationResult> {
  const model =
    subjectType === "pet" && hasLora ? KONTEXT_LORA : KONTEXT_PRO;

  const result = await fal.queue.result(model, {
    requestId,
  });

  return result.data as FalGenerationResult;
}
