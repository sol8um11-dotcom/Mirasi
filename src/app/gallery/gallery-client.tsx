"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { StyleCard } from "@/components/gallery/style-card";
import { STYLES_DATA } from "@/lib/constants/styles-data";
import type { StyleCategory } from "@/types";

type FilterCategory = "all" | StyleCategory;

const filters: { value: FilterCategory; label: string; count: number }[] = [
  { value: "all", label: "All Styles", count: 15 },
  { value: "royal", label: "Royal Heritage", count: 10 },
  { value: "folk", label: "Folk Art", count: 3 },
  { value: "modern", label: "Modern", count: 2 },
];

export function GalleryClient() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filteredStyles =
    activeFilter === "all"
      ? STYLES_DATA
      : STYLES_DATA.filter((s) => s.category === activeFilter);

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
              activeFilter === f.value
                ? "bg-saffron text-white shadow-sm"
                : "bg-sand text-earth hover:bg-cream-dark"
            )}
          >
            {f.label}
            <span
              className={cn(
                "ml-1.5 text-xs",
                activeFilter === f.value ? "text-white/80" : "text-muted"
              )}
            >
              ({f.count})
            </span>
          </button>
        ))}
      </div>

      {/* Styles grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStyles.map((style, i) => (
          <StyleCard
            key={style.slug}
            name={style.name}
            slug={style.slug}
            category={style.category}
            shortDescription={style.shortDescription}
            region={style.region}
            supportsDogs={style.supportsDogs}
            supportsCats={style.supportsCats}
            supportsHumans={style.supportsHumans}
            index={i}
          />
        ))}
      </div>

      {/* Note about subject restrictions */}
      <div className="mt-8 rounded-xl border border-border bg-card p-4 text-center text-xs text-muted">
        <p>
          <strong className="text-foreground/70">Note:</strong> Deccani Royal and
          Miniature Art styles support cats and humans only (no dogs), respecting
          the cultural traditions these art forms are inspired by.
        </p>
      </div>
    </>
  );
}
