import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

// ─── Model Endpoints ─────────────────────────────────────────────────────────

/**
 * Kontext Pro — identity-preserving style transfer for humans ($0.04/image)
 * PROVEN to work well with V2 identity-first prompts.
 * This is the model that produced our best results in the very first session.
 */
const KONTEXT_PRO = "fal-ai/flux-pro/kontext" as const;

/** Kontext LoRA — custom LoRA weights for pet style adherence ($0.035/MP) */
const KONTEXT_LORA = "fal-ai/flux-kontext-lora" as const;

// ─── Pipeline type tracking ─────────────────────────────────────────────────

/**
 * Which fal.ai pipeline was used for a generation.
 * Must be stored so the polling route knows which endpoint to check.
 *
 * V11: Removed "pulid" — back to Kontext Pro for all humans.
 */
export type PipelineType = "kontext-pro" | "kontext-lora";

/**
 * Determine the fal.ai model endpoint from pipeline type.
 */
function getModelEndpoint(pipeline: PipelineType): string {
  switch (pipeline) {
    case "kontext-lora":
      return KONTEXT_LORA;
    case "kontext-pro":
      return KONTEXT_PRO;
  }
}

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
  /** Transformation intensity — used by LoRA pipeline only */
  strength?: number;
  /** PuLID identity weight — UNUSED in V11 (kept for interface compat) */
  idWeight?: number;
  /** Seed for reproducibility */
  seed?: number;
}

export interface SubmitResult {
  requestId: string;
  pipeline: PipelineType;
}

/**
 * Submit a generation job to the appropriate fal.ai pipeline.
 *
 * V11 ROUTING — Back to Basics:
 * - ALL humans → Kontext Pro (proven identity preservation with V2 prompts)
 * - Pets with LoRA → Kontext LoRA (trained style LoRAs)
 * - Pets without LoRA → Kontext Pro (fallback)
 *
 * REMOVED: PuLID Flux (V10) — generated beautiful art but lost facial identity completely.
 * REMOVED: Flux Dev img2img (V9) — destroyed identity at high strength.
 */
export async function submitGeneration(
  params: GenerationParams
): Promise<SubmitResult> {
  if (params.subjectType === "pet" && params.loraUrl) {
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
      strength: params.strength ?? 0.88,
      output_format: "jpeg",
      resolution_mode: "match_input",
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    const result = await fal.queue.submit(KONTEXT_LORA, {
      input: loraInput as never,
    });
    return { requestId: result.request_id, pipeline: "kontext-lora" };
  }

  // ─── Kontext Pro: Humans + Pet fallback ───
  // NOTE: Kontext Pro does NOT support num_inference_steps or strength params.
  // Only guidance_scale controls the style/identity balance.
  const kontextInput: Record<string, unknown> = {
    image_url: params.imageUrl,
    prompt: params.prompt,
    guidance_scale: params.guidanceScale ?? 3.5,
    output_format: "jpeg",
    safety_tolerance: "2",
    ...(params.seed !== undefined && { seed: params.seed }),
  };
  const result = await fal.queue.submit(KONTEXT_PRO, {
    input: kontextInput as never,
  });
  return { requestId: result.request_id, pipeline: "kontext-pro" };
}

/**
 * Check the status of a queued generation.
 */
export async function checkGenerationStatus(
  requestId: string,
  pipeline: PipelineType
): Promise<FalQueueResponse> {
  const model = getModelEndpoint(pipeline);

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
  pipeline: PipelineType
): Promise<FalGenerationResult> {
  const model = getModelEndpoint(pipeline);

  const result = await fal.queue.result(model, {
    requestId,
  });

  return result.data as FalGenerationResult;
}
