"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { compressImage, createPreviewUrl } from "@/lib/image/compress";
import { STYLES_DATA, type StyleInfo } from "@/lib/constants/styles-data";
import { STYLE_CATEGORIES } from "@/lib/constants";
import { useGeneration } from "@/hooks/use-generation";
import { useUser } from "@/hooks/use-user";
import { useRazorpay } from "@/hooks/use-razorpay";
import { PRICING } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { CompressedImage, SubjectType, StyleCategory } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreateStep = "select-style" | "upload-photo" | "generating" | "result";

const categoryColors: Record<string, string> = {
  royal: "bg-saffron/10 text-saffron",
  folk: "bg-success/10 text-success",
  modern: "bg-royal-blue/10 text-royal-blue",
};

/** P0 styles that are live (have trained LoRAs or are ready for generation) */
const LIVE_STYLES = new Set(["warli-art", "madhubani-art", "tanjore-heritage"]);

// ─── Main Component ──────────────────────────────────────────────────────────

export function CreateFlow() {
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();

  // ── State ──
  const [step, setStep] = useState<CreateStep>("select-style");
  const [selectedStyle, setSelectedStyle] = useState<StyleInfo | null>(null);
  const [subjectType, setSubjectType] = useState<SubjectType>("human");
  const [uploadedImage, setUploadedImage] = useState<CompressedImage | null>(
    null
  );
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    StyleCategory | "all"
  >("all");

  // Polling hook
  const generation = useGeneration(
    step === "generating" ? generationId : null
  );

  // Auto-select style from query param
  useEffect(() => {
    const styleParam = searchParams.get("style");
    if (styleParam) {
      const found = STYLES_DATA.find((s) => s.slug === styleParam);
      if (found) {
        setSelectedStyle(found);
        setStep("upload-photo");
      }
    }
  }, [searchParams]);

  // When generation completes or fails, advance step
  useEffect(() => {
    if (generation.status === "completed" && generation.previewUrl) {
      setStep("result");
    }
    if (generation.status === "failed" && generation.error) {
      setError(generation.error);
      setStep("result");
    }
  }, [generation.status, generation.previewUrl, generation.error]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  // ── Handlers ──

  const handleStyleSelect = useCallback((style: StyleInfo) => {
    setSelectedStyle(style);
    setError(null);

    // Check subject support: if style doesn't support dogs, default to human
    const supportsPet = style.supportsDogs || style.supportsCats;
    if (!supportsPet) {
      setSubjectType("human");
    }

    setStep("upload-photo");
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const compressed = await compressImage(file);
        setUploadedImage(compressed);
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(createPreviewUrl(compressed.file));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process image.");
      }
    },
    [localPreviewUrl]
  );

  const handleUploadAndGenerate = useCallback(async () => {
    if (!uploadedImage || !selectedStyle || !user) return;
    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload
      const uploadForm = new FormData();
      uploadForm.append("image", uploadedImage.file);
      uploadForm.append("styleSlug", selectedStyle.slug);
      uploadForm.append("subjectType", subjectType);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      const uploadJson = await uploadRes.json();

      if (uploadJson.error) {
        throw new Error(uploadJson.error.message);
      }

      const genId = uploadJson.data.generationId;
      setGenerationId(genId);

      // Step 2: Trigger generation
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: genId }),
      });
      const generateJson = await generateRes.json();

      if (generateJson.error) {
        throw new Error(generateJson.error.message);
      }

      // Step 3: Switch to generating view (polling starts via useGeneration)
      setStep("generating");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUploading(false);
    }
  }, [uploadedImage, selectedStyle, subjectType, user]);

  const handleReset = useCallback(() => {
    setStep("select-style");
    setSelectedStyle(null);
    setSubjectType("human");
    setUploadedImage(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setGenerationId(null);
    setError(null);
    setUploading(false);
  }, [localPreviewUrl]);

  // ── Filtered styles ──
  const filteredStyles =
    categoryFilter === "all"
      ? STYLES_DATA
      : STYLES_DATA.filter((s) => s.category === categoryFilter);

  // ── Render ──
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Step progress indicator */}
      <StepIndicator currentStep={step} />

      {/* Error banner */}
      {error && step !== "result" && (
        <div className="mb-6 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Step: Select Style ─── */}
      {step === "select-style" && (
        <div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Choose Your Art Style
          </h1>
          <p className="mb-6 text-sm text-muted">
            Select from 15 authentic Indian art traditions
          </p>

          {/* Category filter tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {(
              [
                { key: "all", label: "All Styles" },
                ...Object.entries(STYLE_CATEGORIES).map(([key, val]) => ({
                  key,
                  label: val.label,
                })),
              ] as Array<{ key: StyleCategory | "all"; label: string }>
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategoryFilter(tab.key)}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                  categoryFilter === tab.key
                    ? "bg-saffron text-white shadow-sm"
                    : "bg-card text-muted border border-border hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Style grid — live P0 styles first, then coming soon */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[...filteredStyles].sort((a, b) => {
              const aLive = LIVE_STYLES.has(a.slug) ? 0 : 1;
              const bLive = LIVE_STYLES.has(b.slug) ? 0 : 1;
              return aLive - bLive;
            }).map((style) => {
              const isLive = LIVE_STYLES.has(style.slug);

              return (
                <button
                  key={style.slug}
                  onClick={() => isLive ? handleStyleSelect(style) : undefined}
                  disabled={!isLive}
                  className={cn(
                    "group text-left rounded-xl border border-border bg-card shadow-card overflow-hidden transition-all duration-200",
                    isLive
                      ? "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"
                      : "opacity-70 cursor-not-allowed"
                  )}
                >
                  {/* Style sample preview */}
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src={`/samples/${style.slug}.jpg`}
                      alt={`${style.name} style sample`}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-300",
                        isLive ? "group-hover:scale-105" : "grayscale-[30%]"
                      )}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Subtle dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                    {/* Coming Soon overlay for non-live styles */}
                    {!isLive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-card/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                          Coming Soon
                        </span>
                      </div>
                    )}

                    {/* Category badge */}
                    <span
                      className={cn(
                        "absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm",
                        categoryColors[style.category]
                      )}
                    >
                      {STYLE_CATEGORIES[style.category]?.label}
                    </span>

                    {/* Region badge */}
                    <span className="absolute top-2 right-2 rounded-full bg-card/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-medium text-muted">
                      {style.region}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className={cn(
                      "mb-1 text-sm font-semibold transition-colors",
                      isLive ? "text-foreground group-hover:text-saffron" : "text-muted"
                    )}>
                      {style.name}
                    </h3>
                    <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                      {style.shortDescription}
                    </p>

                    {/* Subject tags */}
                    <div className="mt-2 flex gap-1">
                      {style.supportsHumans && (
                        <span className="rounded bg-sand px-1.5 py-0.5 text-[9px] font-medium text-earth">
                          Humans
                        </span>
                      )}
                      {style.supportsDogs && (
                        <span className="rounded bg-sand px-1.5 py-0.5 text-[9px] font-medium text-earth">
                          Dogs
                        </span>
                      )}
                      {style.supportsCats && (
                        <span className="rounded bg-sand px-1.5 py-0.5 text-[9px] font-medium text-earth">
                          Cats
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Step: Upload Photo ─── */}
      {step === "upload-photo" && selectedStyle && (
        <div>
          {/* Back + selected style header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setStep("select-style");
                setUploadedImage(null);
                if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                setLocalPreviewUrl(null);
                setError(null);
              }}
              className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to styles
            </button>

            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                <Image
                  src={`/samples/${selectedStyle.slug}.jpg`}
                  alt={selectedStyle.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {selectedStyle.name}
                </h1>
                <p className="text-sm text-muted">
                  {selectedStyle.shortDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Subject type selector */}
          <SubjectSelector
            style={selectedStyle}
            subjectType={subjectType}
            onSelect={setSubjectType}
          />

          {/* Photo upload zone */}
          <PhotoUploadZone
            onFileSelect={handleFileSelect}
            uploadedImage={uploadedImage}
            previewUrl={localPreviewUrl}
            onClear={() => {
              setUploadedImage(null);
              if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
              setLocalPreviewUrl(null);
            }}
          />

          {/* Auth gate + Generate button */}
          {!userLoading && !user && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-card">
              <p className="mb-3 text-sm text-muted">
                Sign in to create your portrait
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = `/auth/login?redirect=${encodeURIComponent("/create?style=" + selectedStyle.slug)}`;
                }}
              >
                Sign In to Continue
              </Button>
            </div>
          )}

          {user && uploadedImage && (
            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                loading={uploading}
                onClick={handleUploadAndGenerate}
                className="w-full sm:w-auto"
              >
                Generate Portrait
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── Step: Generating ─── */}
      {step === "generating" && selectedStyle && (
        <GeneratingView
          styleName={selectedStyle.name}
          elapsedMs={generation.elapsedMs}
        />
      )}

      {/* ─── Step: Result ─── */}
      {step === "result" && selectedStyle && (
        <ResultView
          styleName={selectedStyle.name}
          previewUrl={generation.previewUrl}
          error={error || generation.error}
          onReset={handleReset}
          generationId={generationId}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: CreateStep }) {
  const steps: Array<{ key: CreateStep; label: string }> = [
    { key: "select-style", label: "Style" },
    { key: "upload-photo", label: "Upload" },
    { key: "generating", label: "Generate" },
    { key: "result", label: "Result" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-8 flex items-center justify-center gap-1">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              i <= currentIndex
                ? "bg-saffron text-white"
                : "bg-card text-muted border border-border"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "hidden text-xs font-medium sm:block",
              i <= currentIndex ? "text-foreground" : "text-muted"
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-1 h-[2px] w-6 sm:w-10 rounded-full",
                i < currentIndex ? "bg-saffron" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SubjectSelector({
  style,
  subjectType,
  onSelect,
}: {
  style: StyleInfo;
  subjectType: SubjectType;
  onSelect: (type: SubjectType) => void;
}) {
  const supportsPet = style.supportsDogs || style.supportsCats;

  // If only human is supported, don't show selector
  if (!supportsPet) return null;

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-foreground">
        Subject Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelect("human")}
          className={cn(
            "rounded-xl border p-4 text-center transition-all",
            subjectType === "human"
              ? "border-saffron bg-saffron/5 shadow-sm"
              : "border-border bg-card hover:border-saffron/30"
          )}
        >
          <div className="mb-1 text-2xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-foreground/60">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span
            className={cn(
              "text-sm font-medium",
              subjectType === "human" ? "text-saffron" : "text-foreground"
            )}
          >
            Human
          </span>
        </button>
        <button
          onClick={() => onSelect("pet")}
          className={cn(
            "rounded-xl border p-4 text-center transition-all",
            subjectType === "pet"
              ? "border-saffron bg-saffron/5 shadow-sm"
              : "border-border bg-card hover:border-saffron/30"
          )}
        >
          <div className="mb-1 text-2xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-foreground/60">
              <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
              <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
              <path d="M8 14v.5" /><path d="M16 14v.5" />
              <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
              <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
            </svg>
          </div>
          <span
            className={cn(
              "text-sm font-medium",
              subjectType === "pet" ? "text-saffron" : "text-foreground"
            )}
          >
            Pet
          </span>
        </button>
      </div>
    </div>
  );
}

function PhotoUploadZone({
  onFileSelect,
  uploadedImage,
  previewUrl,
  onClear,
}: {
  onFileSelect: (file: File) => void;
  uploadedImage: CompressedImage | null;
  previewUrl: string | null;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (uploadedImage && previewUrl) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex gap-4">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Upload preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">
                Photo ready
              </p>
              <p className="mt-1 text-xs text-muted">
                {uploadedImage.width} &times; {uploadedImage.height}px
              </p>
              <p className="text-xs text-muted">
                {formatFileSize(uploadedImage.compressedSize)} (was{" "}
                {formatFileSize(uploadedImage.originalSize)})
              </p>
            </div>
            <button
              onClick={onClear}
              className="self-start text-xs font-medium text-error hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
        dragActive
          ? "border-saffron bg-saffron/5"
          : "border-border bg-card hover:border-saffron/30"
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4 text-muted"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>

      <p className="mb-1 text-sm font-medium text-foreground">
        Drop your photo here, or tap to browse
      </p>
      <p className="text-xs text-muted">JPG, PNG, or WebP. Max 10MB.</p>
    </div>
  );
}

function GeneratingView({
  styleName,
  elapsedMs,
}: {
  styleName: string;
  elapsedMs: number;
}) {
  const seconds = Math.floor(elapsedMs / 1000);

  // Progress stages for visual feedback
  let stage = "Queued";
  if (seconds > 5) stage = "Processing";
  if (seconds > 30) stage = "Refining details";
  if (seconds > 60) stage = "Almost done";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Spinner size="lg" className="mb-6" />

      <h2 className="mb-2 text-xl font-bold text-foreground">
        Creating Your Portrait
      </h2>
      <p className="mb-1 text-sm text-muted">
        Transforming your photo into{" "}
        <span className="font-medium text-saffron">{styleName}</span>
      </p>
      <p className="mb-6 text-xs text-muted">Usually under 2 minutes</p>

      {/* Progress indicator */}
      <div className="w-full max-w-xs">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>{stage}</span>
          <span>{seconds}s</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div
            className="h-full rounded-full bg-saffron transition-all duration-1000"
            style={{
              width: `${Math.min((seconds / 120) * 100, 95)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

type PurchaseState = "idle" | "creating-order" | "checkout-open" | "verifying" | "purchased" | "error";

function ResultView({
  styleName,
  previewUrl,
  error,
  onReset,
  generationId,
  userEmail,
}: {
  styleName: string;
  previewUrl: string | null;
  error: string | null;
  onReset: () => void;
  generationId: string | null;
  userEmail?: string;
}) {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("idle");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [hdDownloadUrl, setHdDownloadUrl] = useState<string | null>(null);
  const { openCheckout } = useRazorpay();
  const priceRs = PRICING.digital.single / 100;

  const handleBuyHD = useCallback(async () => {
    if (!generationId) return;
    setPurchaseError(null);
    setPurchaseState("creating-order");

    try {
      // 1. Create order
      const orderRes = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, plan: "single" }),
      });
      const orderJson = await orderRes.json();

      if (orderJson.error) {
        // Already purchased — fetch download URL directly
        if (orderJson.error.status === 409) {
          setPurchaseState("verifying");
          const dlRes = await fetch(`/api/download/${generationId}`);
          const dlJson = await dlRes.json();
          if (dlJson.data?.downloadUrl) {
            setHdDownloadUrl(dlJson.data.downloadUrl);
            setPurchaseState("purchased");
            return;
          }
        }
        throw new Error(orderJson.error.message);
      }

      const { razorpayOrderId, amount, key } = orderJson.data;

      // 2. Open Razorpay checkout
      setPurchaseState("checkout-open");
      await openCheckout({
        razorpayOrderId,
        amount,
        key,
        prefill: { email: userEmail },
        onSuccess: async (response) => {
          setPurchaseState("verifying");
          try {
            // 3. Verify payment
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();

            if (verifyJson.error) {
              throw new Error(verifyJson.error.message);
            }

            setHdDownloadUrl(verifyJson.data.downloadUrl);
            setPurchaseState("purchased");
          } catch (err) {
            setPurchaseError(
              err instanceof Error ? err.message : "Payment verification failed."
            );
            setPurchaseState("error");
          }
        },
        onError: (err) => {
          setPurchaseError(err.description || "Payment failed.");
          setPurchaseState("error");
        },
        onDismiss: () => {
          setPurchaseState("idle");
        },
      });
    } catch (err) {
      setPurchaseError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setPurchaseState("error");
    }
  }, [generationId, userEmail, openCheckout]);

  const handleDownloadHD = useCallback(async () => {
    // If we already have a URL, use it; otherwise fetch a fresh one
    let url = hdDownloadUrl;
    if (!url && generationId) {
      const res = await fetch(`/api/download/${generationId}`);
      const json = await res.json();
      if (json.data?.downloadUrl) {
        url = json.data.downloadUrl;
        setHdDownloadUrl(url);
      }
    }
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `mirasi-${styleName.toLowerCase().replace(/\s+/g, "-")}-hd.jpg`;
      a.target = "_blank";
      a.click();
    }
  }, [hdDownloadUrl, generationId, styleName]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
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
            <line x1="15" x2="9" y1="9" y2="15" />
            <line x1="9" x2="15" y1="9" y2="15" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          Generation Failed
        </h2>
        <p className="mb-6 max-w-sm text-sm text-muted">{error}</p>
        <Button variant="primary" onClick={onReset}>
          Try Again
        </Button>
      </div>
    );
  }

  const isLoading =
    purchaseState === "creating-order" || purchaseState === "verifying";

  // Success state
  return (
    <div className="flex flex-col items-center py-6">
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Your Portrait is Ready!
      </h2>
      <p className="mb-6 text-sm text-muted">
        {styleName} by Mirasi
      </p>

      {/* Result image */}
      {previewUrl && (
        <div className="mb-6 w-full max-w-lg overflow-hidden rounded-2xl border border-border shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`${styleName} portrait by Mirasi`}
            className="w-full"
          />
        </div>
      )}

      {/* Purchase success banner */}
      {purchaseState === "purchased" && (
        <div className="mb-6 w-full max-w-lg rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-center">
          <p className="text-sm font-medium text-success">
            Payment successful! Your HD portrait is ready to download.
          </p>
        </div>
      )}

      {/* Purchase error banner */}
      {purchaseState === "error" && purchaseError && (
        <div className="mb-6 w-full max-w-lg rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-center">
          <p className="text-sm text-error">{purchaseError}</p>
        </div>
      )}

      {/* Watermark note (hide after purchase) */}
      {purchaseState !== "purchased" && (
        <p className="mb-6 text-center text-xs text-muted">
          This is a watermarked preview. Purchase the HD version to remove the
          watermark.
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {previewUrl && purchaseState !== "purchased" && (
          <Button
            variant="outline"
            onClick={() => {
              const a = document.createElement("a");
              a.href = previewUrl;
              a.download = `mirasi-${styleName.toLowerCase().replace(/\s+/g, "-")}-preview.jpg`;
              a.click();
            }}
          >
            Download Preview
          </Button>
        )}

        {purchaseState === "purchased" ? (
          <Button variant="primary" onClick={handleDownloadHD}>
            Download HD Portrait
          </Button>
        ) : (
          <Button
            variant="primary"
            loading={isLoading}
            disabled={purchaseState === "checkout-open"}
            onClick={handleBuyHD}
          >
            {purchaseState === "checkout-open"
              ? "Complete Payment..."
              : `Buy HD Version \u2014 Rs ${priceRs}`}
          </Button>
        )}

        <Button variant="ghost" onClick={onReset}>
          Create Another
        </Button>
      </div>

      {/* Share hint */}
      <p className="mt-8 text-center text-xs text-muted">
        Love your portrait? Share it with{" "}
        <span className="font-medium text-saffron">#mirasi</span>
      </p>
    </div>
  );
}
