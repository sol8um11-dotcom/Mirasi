"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Art style names cycled by the golden dot "writing" them.
 */
const ART_STYLES = [
  "Indian Art",
  "Madhubani Art",
  "Warli Art",
  "Tanjore Art",
  "Rajasthani Art",
  "Kerala Mural",
  "Pahari Art",
  "Mughal Art",
];

/**
 * Photo subject types cycled independently.
 */
const PHOTO_TYPES = [
  "Your Photos",
  "Pet's Photos",
  "Family Photos",
  "Friends Photos",
];

// Duration of one full spiral loop in ms — slower feels more deliberate/artistic
const SPIRAL_CYCLE_MS = 6000;
const PHOTO_CYCLE_MS = 3500;

// The combined spiral path from the logo, scaled up for hero background
// Original logo viewBox: 64x64 → scaled to 400x400 (×6.25)
// Three-segment path matching the exact logo: outer, mid, inner+eyelid
const SPIRAL_OUTER =
  "M200 43.75 C118.75 50 50 118.75 56.25 206.25 C62.5 293.75 125 356.25 206.25 350 C287.5 343.75 337.5 281.25 331.25 206.25";
const SPIRAL_MID =
  "M331.25 206.25 C325 143.75 275 100 218.75 100 C162.5 106.25 125 150 125 200";
const SPIRAL_INNER =
  "M125 200 C125 250 162.5 287.5 212.5 281.25 C250 275 275 243.75 268.75 212.5 C259.375 187.5 237.5 175 218.75 178.125 C206.25 181.25 196.875 186.875 184.375 196.875";

// Combined single path for the gold dot to trace
const SPIRAL_PATH = `${SPIRAL_OUTER} ${SPIRAL_MID.replace("M331.25 206.25 ", "")} ${SPIRAL_INNER.replace("M125 200 ", "")}`;

/**
 * HeroSpiral — An artistic paisley spiral drawn as a living background.
 *
 * The gold dot moves like an artist's nib dipped in gold ink, tracing the
 * spiral with variable speed — slowing at tight curves, gliding through
 * long arcs. It leaves a fading luminous trail and, upon reaching the
 * inner eye, the accumulated energy blooms outward and the art style name
 * transforms in a subtle golden flash.
 */
export function HeroSpiral() {
  const [styleIndex, setStyleIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [textPhase, setTextPhase] = useState<"visible" | "bloom" | "fade" | "enter">("visible");
  const spiralRef = useRef<SVGPathElement>(null);
  const dotGroupRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGCircleElement[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const writingRef = useRef(false);
  const prevTRef = useRef(0);

  // Trail positions (last N positions of the dot for a comet-tail effect)
  const trailPositions = useRef<Array<{ x: number; y: number }>>([]);
  const TRAIL_LENGTH = 8;

  // ── Spiral dot animation (continuous loop via rAF) ──
  useEffect(() => {
    const spiral = spiralRef.current;
    if (!spiral) return;

    let totalLength: number;
    try {
      totalLength = spiral.getTotalLength();
    } catch {
      return; // SSR or SVG not ready
    }

    startTimeRef.current = performance.now();

    // Initialize trail circles
    trailPositions.current = [];

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const rawT = (elapsed % SPIRAL_CYCLE_MS) / SPIRAL_CYCLE_MS;

      // Multi-stage easing: slow start, cruise, slow at curves, gentle finish
      // Custom cubic bezier approximation for organic artist's hand
      const eased = artistEase(rawT);

      try {
        const point = spiral!.getPointAtLength(eased * totalLength);

        // Update dot position
        if (dotGroupRef.current) {
          dotGroupRef.current.setAttribute(
            "transform",
            `translate(${point.x}, ${point.y})`
          );
        }

        // Update trail — shift old positions, add new
        trailPositions.current.push({ x: point.x, y: point.y });
        if (trailPositions.current.length > TRAIL_LENGTH) {
          trailPositions.current.shift();
        }

        // Apply trail positions to circle refs
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          const circle = trailRef.current[i];
          if (!circle) continue;
          const pos = trailPositions.current[i];
          if (pos) {
            circle.setAttribute("cx", String(pos.x));
            circle.setAttribute("cy", String(pos.y));
            const age = i / TRAIL_LENGTH;
            circle.setAttribute("opacity", String(age * 0.12));
            circle.setAttribute("r", String(1.5 + age * 2));
          } else {
            circle.setAttribute("opacity", "0");
          }
        }
      } catch {
        // Ignore if element is removed
      }

      // Detect the moment the dot completes a loop (wraps from ~1.0 back to ~0.0)
      if (prevTRef.current > 0.92 && rawT < 0.08 && !writingRef.current) {
        writingRef.current = true;
        // Bloom phase — golden flash radiates from dot
        setTextPhase("bloom");
        setTimeout(() => {
          setTextPhase("fade");
          setTimeout(() => {
            setStyleIndex((prev) => (prev + 1) % ART_STYLES.length);
            setTextPhase("enter");
            setTimeout(() => {
              setTextPhase("visible");
              writingRef.current = false;
            }, 400);
          }, 200);
        }, 250);
      }
      prevTRef.current = rawT;

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Photo types rotation (independent timer) ──
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % PHOTO_TYPES.length);
    }, PHOTO_CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  // Register trail circle refs
  const setTrailRef = useCallback(
    (el: SVGCircleElement | null, idx: number) => {
      if (el) trailRef.current[idx] = el;
    },
    []
  );

  const svgSizeClass =
    "h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] md:h-[520px] md:w-[520px] lg:h-[600px] lg:w-[600px]";

  // Text animation classes based on phase
  const textClass = {
    visible: "opacity-100 translate-y-0 scale-100 blur-0",
    bloom: "opacity-100 translate-y-0 scale-[1.03] blur-0",
    fade: "opacity-0 translate-y-1 scale-95 blur-[2px]",
    enter: "opacity-100 translate-y-0 scale-100 blur-0",
  }[textPhase];

  return (
    <div className="relative flex flex-col items-center py-16 text-center md:py-24">
      {/* ── Background Spiral SVG (static, very faint etched pattern) ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 400 400"
          className={`${svgSizeClass} opacity-[0.04]`}
          fill="none"
        >
          {/* Outer */}
          <path
            d={SPIRAL_OUTER}
            stroke="#C75B12"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Mid */}
          <path
            d={SPIRAL_MID}
            stroke="#C75B12"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Inner + eyelid */}
          <path
            d={SPIRAL_INNER}
            stroke="#C75B12"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Gold pupil eye — the center */}
          <circle cx="212.5" cy="196.875" r="12.5" fill="#D4A843" opacity="0.5" />
        </svg>
      </div>

      {/* ── Animated Spiral with moving Gold Dot ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 400 400"
          className={svgSizeClass}
          fill="none"
        >
          <defs>
            {/* Warm gold glow for the moving dot */}
            <filter
              id="hero-dot-glow"
              x="-300%"
              y="-300%"
              width="700%"
              height="700%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            </filter>
            {/* Broader ambient glow for the bloom effect */}
            <filter
              id="hero-bloom"
              x="-500%"
              y="-500%"
              width="1100%"
              height="1100%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
            </filter>
            {/* Gradient along the spiral trail */}
            <linearGradient
              id="spiral-trail-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#C75B12" stopOpacity="0.08" />
              <stop offset="40%" stopColor="#D4A843" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C75B12" stopOpacity="0.05" />
            </linearGradient>
            {/* Radial gradient for the gold pupil at center */}
            <radialGradient id="pupil-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Animated spiral stroke — draws/undraws with breathing opacity */}
          <path
            ref={spiralRef}
            d={SPIRAL_PATH}
            stroke="url(#spiral-trail-grad)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className="hero-spiral-stroke"
          />

          {/* Luminous center eye — pulses gently */}
          <circle
            cx="212.5"
            cy="196.875"
            r="30"
            fill="url(#pupil-grad)"
            className="hero-center-pulse"
          />

          {/* Trail circles — comet tail behind the gold dot */}
          {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
            <circle
              key={i}
              ref={(el) => setTrailRef(el, i)}
              cx="0"
              cy="0"
              r="2"
              fill="#D4A843"
              opacity="0"
            />
          ))}

          {/* Moving Gold Dot group (bloom + glow + solid) */}
          <g ref={dotGroupRef}>
            {/* Bloom halo — visible during text transition */}
            <circle
              r="20"
              cx="0"
              cy="0"
              fill="#D4A843"
              opacity={textPhase === "bloom" ? "0.15" : "0"}
              filter="url(#hero-bloom)"
              className="transition-opacity duration-300"
            />
            {/* Outer glow */}
            <circle
              r="8"
              cx="0"
              cy="0"
              fill="#D4A843"
              opacity="0.2"
              filter="url(#hero-dot-glow)"
            />
            {/* Solid gold dot — the artist's pen nib */}
            <circle
              r="3.5"
              cx="0"
              cy="0"
              fill="#D4A843"
              className="hero-gold-dot"
            />
            {/* Inner bright core */}
            <circle r="1.5" cx="0" cy="0" fill="#E8C96A" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* ── Content (on top of spiral) ── */}
      <div className="relative z-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold md:text-sm">
          Every face tells a legend
        </p>

        <h1 className="mb-5 max-w-3xl text-3xl font-bold leading-snug text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
          Transform{" "}
          <PhotoRotator index={photoIndex} />
          <br className="hidden md:block" />{" "}
          Into{" "}
          <span className="relative inline-block">
            {/* Art style name — revealed with golden bloom from the dot */}
            <span
              className={`inline-block text-saffron transition-all duration-300 ease-out ${textClass}`}
            >
              {ART_STYLES[styleIndex]}
            </span>
          </span>
          <br className="hidden md:block" />{" "}
          Masterpieces
        </h1>

        <p className="mb-10 mx-auto max-w-lg text-base text-muted md:text-lg">
          AI-powered portraits inspired by 15 authentic Indian art traditions.
          From Rajasthani Miniatures to Madhubani Folk Art.
        </p>
      </div>
    </div>
  );
}

/**
 * Custom easing curve for the gold dot — mimics an artist's hand:
 *   - Slow, deliberate start (dipping the nib in ink)
 *   - Flowing cruise through the main arc
 *   - Gentle deceleration at tight inner curves
 *   - Soft landing at the center eye
 */
function artistEase(t: number): number {
  // Combination of sine ease and a slight pause in the middle
  // Creates a more organic, breathing rhythm
  const sinEase = -(Math.cos(Math.PI * t) - 1) / 2;
  // Add a subtle "breath" — slightly slower at 30% and 70%
  const breath = Math.sin(t * Math.PI * 2) * 0.02;
  return Math.max(0, Math.min(1, sinEase + breath));
}

/**
 * Photo type rotator with smooth crossfade.
 */
function PhotoRotator({ index }: { index: number }) {
  const [displayIndex, setDisplayIndex] = useState(index);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (index !== displayIndex) {
      setVisible(false);
      const timer = setTimeout(() => {
        setDisplayIndex(index);
        setVisible(true);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [index, displayIndex]);

  return (
    <span
      className={`inline-block text-foreground transition-all duration-300 ease-in-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {PHOTO_TYPES[displayIndex]}
    </span>
  );
}
