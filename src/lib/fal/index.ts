import { fal } from "@fal-ai/client";
import type { FalQueueResponse, FalGenerationResult } from "@/types";

// Configure fal client — credentials read from FAL_KEY env var
fal.config({ credentials: process.env.FAL_KEY! });

const FAL_MODEL = "fal-ai/flux-pro/kontext" as const;

/**
 * Submit a generation job to fal.ai Flux Kontext Pro queue.
 * Returns the request_id for polling.
 */
export async function submitGeneration(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const result = await fal.queue.submit(FAL_MODEL, {
    input: {
      image_url: imageUrl,
      prompt,
    },
  });

  return result.request_id;
}

/**
 * Check the status of a queued generation.
 */
export async function checkGenerationStatus(
  requestId: string
): Promise<FalQueueResponse> {
  const status = await fal.queue.status(FAL_MODEL, {
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
  requestId: string
): Promise<FalGenerationResult> {
  const result = await fal.queue.result(FAL_MODEL, {
    requestId,
  });

  return result.data as FalGenerationResult;
}
