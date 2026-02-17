"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StyleCategory } from "@/types";

interface StyleCardProps {
  name: string;
  slug: string;
  category: StyleCategory;
  shortDescription: string;
  region: string;
  supportsDogs: boolean;
  supportsCats: boolean;
  supportsHumans: boolean;
  index: number;
  /** Whether this style is live for generation (false = Coming Soon) */
  isLive?: boolean;
}

const categoryColors: Record<StyleCategory, string> = {
  royal: "bg-saffron/10 text-saffron",
  folk: "bg-success/10 text-success",
  modern: "bg-royal-blue/10 text-royal-blue",
};

const categoryLabels: Record<StyleCategory, string> = {
  royal: "Royal Heritage",
  folk: "Folk Art",
  modern: "Modern",
};

export function StyleCard({
  name,
  slug,
  category,
  shortDescription,
  region,
  supportsDogs,
  supportsCats,
  supportsHumans,
  index,
  isLive = true,
}: StyleCardProps) {
  const wrapperClass = cn(
    "group block animate-fade-in",
    !isLive && "cursor-not-allowed"
  );
  const wrapperStyle = {
    animationDelay: `${index * 50}ms`,
    animationFillMode: "both" as const,
  };

  const cardContent = (
    <div className={cn(
      "overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200",
      isLive
        ? "hover:shadow-card-hover hover:-translate-y-0.5"
        : "opacity-75"
    )}>
      {/* Preview area with real AI-generated sample */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={`/samples/${slug}.jpg`}
          alt={`${name} style sample`}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            isLive ? "group-hover:scale-105" : "grayscale-[30%]"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

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
            "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
            categoryColors[category]
          )}
        >
          {categoryLabels[category]}
        </span>

        {/* Region badge */}
        <span className="absolute top-3 right-3 rounded-full bg-card/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-muted">
          {region}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={cn(
          "mb-1 text-base font-semibold transition-colors",
          isLive ? "text-foreground group-hover:text-saffron" : "text-muted"
        )}>
          {name}
        </h3>
        <p className="mb-3 text-xs text-muted line-clamp-2">
          {shortDescription}
        </p>

        {/* Subject support tags */}
        <div className="flex gap-1.5">
          {supportsHumans && (
            <span className="rounded-md bg-sand px-2 py-0.5 text-[10px] font-medium text-earth">
              Humans
            </span>
          )}
          {supportsDogs && (
            <span className="rounded-md bg-sand px-2 py-0.5 text-[10px] font-medium text-earth">
              Dogs
            </span>
          )}
          {supportsCats && (
            <span className="rounded-md bg-sand px-2 py-0.5 text-[10px] font-medium text-earth">
              Cats
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isLive) {
    return (
      <Link
        href={`/create?style=${slug}`}
        className={wrapperClass}
        style={wrapperStyle}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {cardContent}
    </div>
  );
}
