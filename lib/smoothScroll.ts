"use client";

import Lenis from "lenis";

let lenis: Lenis | null = null;
let initialized = false;

export function getLenis() {
  return lenis;
}

export function initLenis() {
  if (typeof window === "undefined" || initialized) return lenis;
  initialized = true;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  lenis = new Lenis({ lerp: 0.08 });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}
