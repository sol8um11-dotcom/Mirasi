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
}: StyleCardProps) {
  return (
    <Link
      href={`/create?style=${slug}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
        {/* Preview area with real AI-generated sample */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={`/samples/${slug}.jpg`}
            alt={`${name} style sample`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Subtle dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

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
          <h3 className="mb-1 text-base font-semibold text-foreground group-hover:text-saffron transition-colors">
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
    </Link>
  );
}
