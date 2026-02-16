"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { STYLES_DATA } from "@/lib/constants/styles-data";

const categoryColors: Record<string, string> = {
  royal: "bg-saffron/10 text-saffron",
  folk: "bg-success/10 text-success",
  modern: "bg-royal-blue/10 text-royal-blue",
};

const categoryLabels: Record<string, string> = {
  royal: "Royal Heritage",
  folk: "Folk Art",
  modern: "Modern",
};

// Gradient patterns per style (matching gallery style-card)
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

export function StyleCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 16
      : 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* Scroll buttons — hidden on mobile, visible on desktop */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-card transition-all hover:bg-card-hover hover:shadow-card-hover md:block"
        aria-label="Scroll left"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-card transition-all hover:bg-card-hover hover:shadow-card-hover md:block"
        aria-label="Scroll right"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        className="scroll-snap-x flex gap-4 px-1 pb-4"
      >
        {STYLES_DATA.map((style) => {
          const gradient =
            styleGradients[style.slug] || "from-gray-200/30 to-gray-300/30";

          return (
            <Link
              key={style.slug}
              href={`/create?style=${style.slug}`}
              className="scroll-snap-item group block w-[260px] sm:w-[280px]"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
                {/* Preview gradient */}
                <div
                  className={cn(
                    "relative flex h-36 items-center justify-center bg-gradient-to-br",
                    gradient
                  )}
                >
                  {/* Paisley motif */}
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 64 64"
                    fill="none"
                    className="text-foreground/8"
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
                      "absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                      categoryColors[style.category]
                    )}
                  >
                    {categoryLabels[style.category]}
                  </span>

                  {/* Region */}
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-card/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-medium text-muted">
                    {style.region}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5">
                  <h3 className="mb-1 text-sm font-semibold text-foreground group-hover:text-saffron transition-colors">
                    {style.name}
                  </h3>
                  <p className="mb-2.5 text-[11px] text-muted line-clamp-2 leading-relaxed">
                    {style.shortDescription}
                  </p>

                  {/* Subject tags */}
                  <div className="flex gap-1">
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
              </div>
            </Link>
          );
        })}
      </div>

      {/* Scroll hint gradient — fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
