"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" className="text-saffron" />
          <path d="M20 32 L28 40 L44 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-muted" />
        </svg>
      </div>
      <h1 className="mb-3 text-2xl font-bold text-foreground">
        You&apos;re Offline
      </h1>
      <p className="mb-6 max-w-sm text-base text-muted">
        It looks like you&apos;ve lost your internet connection. Mirasi
        needs an active connection to create art portraits.
      </p>
      <button
        onClick={() => typeof window !== "undefined" && window.location.reload()}
        className="rounded-xl bg-saffron px-6 py-3 font-semibold text-white transition-colors hover:bg-saffron-dark active:scale-[0.98]"
      >
        Try Again
      </button>
    </div>
  );
}
