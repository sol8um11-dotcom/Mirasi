"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  GENERATION_POLL_INTERVAL_MS,
  GENERATION_TIMEOUT_MS,
} from "@/lib/constants";
import type { GenerationStatus } from "@/types";

interface GenerationState {
  status: GenerationStatus | null;
  previewUrl: string | null;
  error: string | null;
  elapsedMs: number;
}

/**
 * Poll the generation status endpoint until completion or failure.
 * Automatically stops on "completed", "failed", or timeout.
 */
export function useGeneration(generationId: string | null) {
  const [state, setState] = useState<GenerationState>({
    status: null,
    previewUrl: null,
    error: null,
    elapsedMs: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset state when generationId changes
  useEffect(() => {
    if (!generationId) {
      stopPolling();
      setState({ status: null, previewUrl: null, error: null, elapsedMs: 0 });
      startTimeRef.current = null;
      return;
    }

    // Start fresh polling
    startTimeRef.current = Date.now();
    setState({
      status: "processing",
      previewUrl: null,
      error: null,
      elapsedMs: 0,
    });

    const poll = async () => {
      try {
        const elapsed = Date.now() - (startTimeRef.current || Date.now());

        // Timeout check
        if (elapsed > GENERATION_TIMEOUT_MS) {
          stopPolling();
          setState((prev) => ({
            ...prev,
            status: "failed",
            error:
              "Generation timed out. Please try again.",
            elapsedMs: elapsed,
          }));
          return;
        }

        const res = await fetch(`/api/generation/${generationId}`);
        const json = await res.json();

        if (json.error) {
          stopPolling();
          setState((prev) => ({
            ...prev,
            status: "failed",
            error: json.error.message || "An error occurred.",
            elapsedMs: elapsed,
          }));
          return;
        }

        const data = json.data;

        if (data.status === "completed") {
          stopPolling();
          setState({
            status: "completed",
            previewUrl: data.previewUrl || null,
            error: null,
            elapsedMs: elapsed,
          });
          return;
        }

        if (data.status === "failed") {
          stopPolling();
          setState({
            status: "failed",
            previewUrl: null,
            error: data.error || "Generation failed.",
            elapsedMs: elapsed,
          });
          return;
        }

        // Still processing — update elapsed time
        setState((prev) => ({
          ...prev,
          status: data.status || "processing",
          elapsedMs: elapsed,
        }));
      } catch {
        // Network error — keep polling (may be transient)
        const elapsed = Date.now() - (startTimeRef.current || Date.now());
        setState((prev) => ({
          ...prev,
          elapsedMs: elapsed,
        }));
      }
    };

    // Poll immediately, then on interval
    poll();
    intervalRef.current = setInterval(poll, GENERATION_POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [generationId, stopPolling]);

  return {
    ...state,
    stopPolling,
  };
}
