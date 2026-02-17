"use client";

import { useState, useEffect } from "react";

interface RotatingTextProps {
  texts: string[];
  /** Interval in ms between rotations (default: 3000) */
  interval?: number;
  className?: string;
}

/**
 * Animated text rotator with fade-up transition.
 * Cycles through an array of strings on a timer.
 */
export function RotatingText({ texts, interval = 3000, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out
      setVisible(false);
      // After fade out, switch text and fade in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <span
      className={`inline-block transition-all duration-300 ease-in-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${className ?? ""}`}
    >
      {texts[index]}
    </span>
  );
}
