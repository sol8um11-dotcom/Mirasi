"use client";

import { RotatingText } from "./rotating-text";

const photoTypes = [
  "Your Photos",
  "Pet's Photos",
  "Family Photos",
  "Friends Photos",
];

const styleNames = [
  "Indian Art",
  "Madhubani Art",
  "Warli Art",
  "Tanjore Art",
  "Rajasthani Art",
  "Kerala Mural",
];

/**
 * Hero headline with two independently rotating text segments.
 * "Transform [Your Photos / Pet's Photos / ...] Into [Indian Art / Madhubani / ...] Masterpieces"
 */
export function HeroHeadline() {
  return (
    <h1 className="mb-5 max-w-3xl text-3xl font-bold leading-snug text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
      Transform{" "}
      <RotatingText
        texts={photoTypes}
        interval={3000}
        className="text-foreground"
      />
      <br className="hidden md:block" />{" "}
      Into{" "}
      <RotatingText
        texts={styleNames}
        interval={3500}
        className="text-saffron"
      />
      <br className="hidden md:block" />{" "}
      Masterpieces
    </h1>
  );
}
