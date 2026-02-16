"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-error"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-bold text-foreground">
        Something went wrong
      </h2>
      <p className="mb-6 max-w-sm text-sm text-muted">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
