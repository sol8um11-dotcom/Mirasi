"use client";

import Link from "next/link";
import Image from "next/image";
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
        {STYLES_DATA.map((style) => (
            <Link
              key={style.slug}
              href={`/create?style=${style.slug}`}
              className="scroll-snap-item group block w-[260px] sm:w-[280px]"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
                {/* Preview with real AI-generated sample */}
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={`/samples/${style.slug}.jpg`}
                    alt={`${style.name} style sample`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="280px"
                  />
                  {/* Subtle dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                  {/* Category badge */}
                  <span
                    className={cn(
                      "absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm",
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
        ))}
      </div>

      {/* Scroll hint gradient — fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
