"use client";

import { useState, useEffect, useRef } from "react";

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

// Duration of one full spiral loop in ms
const SPIRAL_CYCLE_MS = 4000;
const PHOTO_CYCLE_MS = 3000;

// The combined spiral path from the logo, scaled up for hero background
// Original logo viewBox: 64x64 → scaled to 400x400 (×6.25)
const SPIRAL_PATH =
  "M200 40 " +
  "C118 50 48 118 55 208 " +
  "C62 298 125 360 208 355 " +
  "C291 350 340 283 335 208 " +
  "C330 143 275 98 220 100 " +
  "C165 105 125 150 125 200 " +
  "C125 250 162 290 215 285 " +
  "C252 280 278 245 272 212 " +
  "C264 188 240 175 222 178 " +
  "C210 182 196 187 188 196";

/**
 * HeroSpiral — The logo's paisley spiral drawn as a large background element.
 * The gold dot traces along the spiral in a continuous loop, and when it
 * reaches the inner tip, it "writes" the next art style name with a
 * smooth handwriting-reveal animation.
 */
export function HeroSpiral() {
  const [styleIndex, setStyleIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const spiralRef = useRef<SVGPathElement>(null);
  const dotGroupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const writingRef = useRef(false);

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

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const t = (elapsed % SPIRAL_CYCLE_MS) / SPIRAL_CYCLE_MS;

      // Ease-in-out for organic artist's hand motion
      const eased =
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      try {
        const point = spiral!.getPointAtLength(eased * totalLength);
        if (dotGroupRef.current) {
          dotGroupRef.current.setAttribute(
            "transform",
            `translate(${point.x}, ${point.y})`
          );
        }
      } catch {
        // Ignore if element is removed
      }

      // Near inner tip (~93%), trigger text change
      if (t > 0.90 && t < 0.95 && !writingRef.current) {
        writingRef.current = true;
        setTextVisible(false);
        setTimeout(() => {
          setStyleIndex((prev) => (prev + 1) % ART_STYLES.length);
          setTextVisible(true);
          setTimeout(() => {
            writingRef.current = false;
          }, 600);
        }, 300);
      }

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

  const svgSizeClass =
    "h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] md:h-[520px] md:w-[520px] lg:h-[600px] lg:w-[600px]";

  return (
    <div className="relative flex flex-col items-center py-16 text-center md:py-24">
      {/* ── Background Spiral SVG (static, very faint) ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 400 400"
          className={`${svgSizeClass} opacity-[0.06]`}
          fill="none"
        >
          <path
            d={SPIRAL_PATH}
            stroke="#C75B12"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
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
            <filter
              id="hero-dot-glow"
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            </filter>
            <linearGradient
              id="spiral-trail-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#C75B12" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#D4A843" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C75B12" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Animated spiral stroke trail — draws/undraws continuously */}
          <path
            ref={spiralRef}
            d={SPIRAL_PATH}
            stroke="url(#spiral-trail-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="hero-spiral-stroke"
          />

          {/* Moving Gold Dot group (glow + solid dot) */}
          <g ref={dotGroupRef}>
            {/* Outer glow */}
            <circle
              r="10"
              cx="0"
              cy="0"
              fill="#D4A843"
              opacity="0.25"
              filter="url(#hero-dot-glow)"
            />
            {/* Solid gold dot — the artist's pen tip */}
            <circle
              r="4.5"
              cx="0"
              cy="0"
              fill="#D4A843"
              className="hero-gold-dot"
            />
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
            {/* Art style name — "written" by the gold dot */}
            <span
              className={`inline-block text-saffron transition-all duration-300 ease-in-out ${
                textVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-1 scale-95"
              }`}
            >
              {ART_STYLES[styleIndex]}
            </span>
            {/* Saffron underline — drawn by the dot */}
            <span
              className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-saffron via-gold to-transparent transition-all duration-500 ease-out ${
                textVisible ? "w-full" : "w-0"
              }`}
            />
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
