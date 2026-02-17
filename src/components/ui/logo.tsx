import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  size?: number;
  className?: string;
}

/**
 * Mirasi Paisley Spiral Logo Icon
 * A casual artist's brushstroke spiral that flows inward, terminating as
 * an upper eyelid arc with a gold pupil beneath — "Every face tells a legend."
 * Based on the paisley (buta) motif, India's most iconic art pattern.
 */
export function LogoIcon({ size = 28, className }: LogoIconProps) {
  const uid = useId();
  const glowId = `mirasi-glow-${uid}`;
  const embossId = `mirasi-emboss-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-saffron", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle glow behind the gold pupil */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
        {/*
          3D Emboss V5 — Refined Subtle Metallic
          Shadow-driven depth with restrained highlights.
          Light source: upper-left. Like a weathered bronze coin.
          No feDiffuseLighting (pixelates at small sizes).
          All operations use viewBox coordinates (64×64), staying
          resolution-independent at any rendered pixel size.
        */}
        <filter id={embossId} x="-15%" y="-15%" width="130%" height="130%"
          colorInterpolationFilters="sRGB">

          {/* ── Layer 1: Soft drop shadow (depth/lift) ── */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="dropBlur" />
          <feOffset in="dropBlur" dx="0.6" dy="1" result="dropOff" />
          <feFlood floodColor="#050200" floodOpacity="0.45" result="dropFill" />
          <feComposite in="dropFill" in2="dropOff" operator="in" result="dropShadow" />

          {/* ── Layer 2: Dark bevel (lower-right edge — the main depth cue) ── */}
          <feMorphology in="SourceAlpha" operator="dilate" radius="0.35" result="fat" />
          <feOffset in="fat" dx="0.4" dy="0.6" result="darkEdge" />
          <feFlood floodColor="#1A0800" floodOpacity="0.75" result="darkFill" />
          <feComposite in="darkFill" in2="darkEdge" operator="in" result="darkBevel" />

          {/* ── Layer 3: Light bevel (upper-left catch light — subtle, not yellow) ── */}
          <feOffset in="fat" dx="-0.35" dy="-0.45" result="lightEdge" />
          <feFlood floodColor="#D4A843" floodOpacity="0.3" result="lightFill" />
          <feComposite in="lightFill" in2="lightEdge" operator="in" result="lightBevel" />

          {/* ── Layer 4: Top face — original strokes with gentle warm shift ── */}
          <feColorMatrix in="SourceGraphic" type="matrix"
            values="1.02 0.03 0    0 0.01
                    0    0.98 0.02 0 0.005
                    0    0    0.8  0 0
                    0    0    0    1 0"
            result="bronzeFace" />

          {/* ── Layer 5: Hairline ridge — extremely subtle inner highlight ── */}
          <feMorphology in="SourceAlpha" operator="erode" radius="0.3" result="thin" />
          <feOffset in="thin" dx="-0.2" dy="-0.3" result="ridgeOff" />
          <feComposite in="SourceAlpha" in2="ridgeOff" operator="out" result="ridgeMask" />
          <feFlood floodColor="#E8C878" floodOpacity="0.2" result="ridgeFill" />
          <feComposite in="ridgeFill" in2="ridgeMask" operator="in" result="ridgeHL" />

          {/* ── Stack all layers bottom→top ── */}
          <feMerge>
            <feMergeNode in="dropShadow" />
            <feMergeNode in="darkBevel" />
            <feMergeNode in="lightBevel" />
            <feMergeNode in="bronzeFace" />
            <feMergeNode in="ridgeHL" />
          </feMerge>
        </filter>
      </defs>
      {/* Spiral strokes with 3D emboss effect */}
      <g filter={`url(#${embossId})`}>
        {/* Outer spiral — thick, confident stroke */}
        <path
          d="M32 7
             C19 8 8 19 9 33
             C10 47 20 57 33 56
             C46 55 54 45 53 33"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mid spiral — medium thickness */}
        <path
          d="M53 33
             C52 23 44 16 35 16
             C26 17 20 24 20 32"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner spiral flowing into upper eyelid — one continuous stroke */}
        <path
          d="M20 32
             C20 40 26 46 34 45
             C40 44 44 39 43 34
             C41.5 30 38 28 35 28.5
             C33 29 31 29.5 29.5 31"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      {/* Gold pupil glow — stays flat (no emboss) */}
      <circle
        cx="34"
        cy="31.5"
        r="2.5"
        fill="#D4A843"
        opacity="0.25"
        filter={`url(#${glowId})`}
      />
      {/* Gold pupil — the watching eye */}
      <circle cx="34" cy="31.5" r="2" fill="#D4A843" />
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * Full Mirasi Logo (icon + wordmark in Urbanist)
 *
 * Gold "i" dots: We render the word using dotless "ı" (U+0131) in saffron,
 * then overlay a gold-colored regular "i" at the same position. The gold "i"
 * is clipped to only show its upper half (the dot area). Since the dotless ı
 * has no dot, the gold dot shows through perfectly positioned by the font
 * itself. Zero manual offset needed.
 *
 * Tagline: "Every face tells a legend."
 */
export function Logo({ size = "md", showIcon = true, className }: LogoProps) {
  const iconSize = size === "sm" ? 22 : size === "md" ? 28 : 36;
  const textSize =
    size === "sm" ? "text-base" : size === "md" ? "text-lg" : "text-2xl";

  // Characters: m·ı·r·a·s·ı (dotless i at positions 1 and 5)
  const chars = ["m", "\u0131", "r", "a", "s", "\u0131"] as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-bold font-display",
        textSize,
        className
      )}
      aria-label="mirasi"
    >
      {showIcon && <LogoIcon size={iconSize} />}
      <span className="text-saffron tracking-tight" aria-hidden="true">
        {chars.map((char, idx) => (
          <span key={idx} className="relative inline-block">
            {/* Base character — saffron dotless ı (or regular letter) */}
            {char}
            {/* Gold dot overlay: render a gold "i" on top, clipped to only
                the top ~30% where the tittle (dot) sits. The stem is hidden. */}
            {(idx === 1 || idx === 5) && (
              <span
                className="absolute inset-0 text-gold overflow-hidden"
                style={{ clipPath: "inset(0 0 70% 0)" }}
              >
                i
              </span>
            )}
          </span>
        ))}
      </span>
    </span>
  );
}
