import { Spinner } from "@/components/ui/spinner";

export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 h-8 w-40 animate-pulse rounded bg-card" />
      <div className="mb-8 h-5 w-64 animate-pulse rounded bg-card" />

      {/* Tab skeleton */}
      <div className="mb-6 flex gap-4 border-b border-border pb-3">
        <div className="h-5 w-24 animate-pulse rounded bg-card" />
        <div className="h-5 w-16 animate-pulse rounded bg-card" />
        <div className="h-5 w-20 animate-pulse rounded bg-card" />
      </div>

      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
