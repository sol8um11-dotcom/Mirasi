"use client";

import Link from "next/link";
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

// Placeholder gradient patterns for each style (until real preview images exist)
const styleGradients: Record<string, string> = {
  "rajasthani-royal": "from-red-800/30 via-amber-600/20 to-yellow-500/30",
  "maratha-heritage": "from-red-900/30 via-amber-800/20 to-yellow-600/30",
  "tanjore-heritage": "from-amber-700/30 via-yellow-500/20 to-orange-400/30",
  "mysore-palace": "from-emerald-800/30 via-yellow-600/20 to-amber-500/30",
  "punjab-royal": "from-orange-600/30 via-amber-500/20 to-red-500/30",
  "bengal-renaissance": "from-amber-600/30 via-stone-400/20 to-yellow-700/30",
  "kerala-mural": "from-yellow-600/30 via-red-600/20 to-green-700/30",
  "pahari-mountain": "from-pink-300/30 via-sky-300/20 to-green-400/30",
  "deccani-royal": "from-blue-900/30 via-emerald-700/20 to-amber-600/30",
  "miniature-art": "from-amber-700/30 via-blue-600/20 to-red-600/30",
  "madhubani-art": "from-red-600/30 via-yellow-500/20 to-blue-600/30",
  "warli-art": "from-amber-800/30 via-orange-700/20 to-amber-900/30",
  "pichwai-art": "from-blue-900/30 via-pink-400/20 to-amber-500/30",
  "anime-portrait": "from-pink-400/30 via-blue-400/20 to-purple-400/30",
  "bollywood-retro": "from-red-500/30 via-yellow-400/20 to-orange-500/30",
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
  const gradient = styleGradients[slug] || "from-gray-200/30 to-gray-300/30";

  return (
    <Link
      href={`/create?style=${slug}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
        {/* Preview area with gradient placeholder */}
        <div
          className={cn(
            "relative flex h-48 items-center justify-center bg-gradient-to-br",
            gradient
          )}
        >
          {/* Paisley pattern overlay */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 64 64"
            fill="none"
            className="text-foreground/10"
          >
            <path
              d="M32 7 C19 8 8 19 9 33 C10 47 20 57 33 56 C46 55 54 45 53 33"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M53 33 C52 23 44 16 35 16 C26 17 20 24 20 32"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M20 32 C20 40 26 46 34 45 C40 44 44 39 43 34 C41.5 30 38 28 35 28.5 C33 29 31 29.5 29.5 31"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="34" cy="31.5" r="2" fill="currentColor" />
          </svg>

          {/* Category badge */}
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
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
