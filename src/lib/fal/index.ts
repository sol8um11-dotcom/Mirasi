import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

// ─── Model Endpoints ─────────────────────────────────────────────────────────

/**
 * PuLID Flux — identity-preserving generation from face reference ($0.033/MP)
 * Generates a NEW image from the text prompt while preserving facial identity
 * from the reference image. Uses InsightFace embeddings + Flux backbone.
 * Has `id_weight` knob to dial between identity fidelity vs style freedom.
 * BEST option for "paint this person in art style X" use case.
 */
const PULID_FLUX = "fal-ai/flux-pulid" as const;

/** Kontext LoRA — custom LoRA weights for pet style adherence ($0.035/MP) */
const KONTEXT_LORA = "fal-ai/flux-kontext-lora" as const;

/**
 * Kontext Pro — fallback for pets without LoRA ($0.04/image)
 * Still used as pet fallback because PuLID is designed for human faces.
 */
const KONTEXT_PRO = "fal-ai/flux-pro/kontext" as const;

// ─── Pipeline type tracking ─────────────────────────────────────────────────

/**
 * Which fal.ai pipeline was used for a generation.
 * Must be stored so the polling route knows which endpoint to check.
 */
export type PipelineType = "pulid" | "kontext-lora" | "kontext-pro";

/**
 * Determine the fal.ai model endpoint from pipeline type.
 */
function getModelEndpoint(pipeline: PipelineType): string {
  switch (pipeline) {
    case "pulid":
      return PULID_FLUX;
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
  /** PuLID identity weight (0-1). Higher = more identity, less style freedom */
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
 * ROUTING RULES (V10 — PuLID Flux):
 * - Human portraits → PuLID Flux (identity-preserving generation)
 * - Pet portraits with LoRA → Kontext LoRA (trained style LoRAs)
 * - Pet portraits without LoRA → Kontext Pro (fallback — PuLID is for human faces)
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
      strength: 0.88,
      output_format: "jpeg",
      resolution_mode: "match_input",
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    const result = await fal.queue.submit(KONTEXT_LORA, {
      input: loraInput as never,
    });
    return { requestId: result.request_id, pipeline: "kontext-lora" };
  }

  if (params.subjectType === "human") {
    // ─── PuLID Flux: Identity-preserving generation (HUMANS) ───
    // PuLID takes a reference face image and generates a new image from the
    // text prompt while preserving that person's facial identity.
    // id_weight controls the balance: higher = more identity, lower = more style.
    const pulidInput: Record<string, unknown> = {
      reference_image_url: params.imageUrl,
      prompt: params.prompt,
      id_weight: params.idWeight ?? 0.7,
      guidance_scale: params.guidanceScale ?? 4.0,
      num_inference_steps: params.numInferenceSteps ?? 30,
      max_sequence_length: "512",
      output_format: "jpeg",
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    const result = await fal.queue.submit(PULID_FLUX, {
      input: pulidInput as never,
    });
    return { requestId: result.request_id, pipeline: "pulid" };
  }

  // ─── Kontext Pro: Pet fallback (no LoRA trained for this style) ───
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
