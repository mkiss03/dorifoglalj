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

  // Háttérben lévő fülön a böngésző visszafogja/leállítja a
  // requestAnimationFrame-et. Amikor a fül újra láthatóvá válik, a
  // következő raf-hívás egy nagyon nagy időbélyeg-ugrást kap (a rejtett
  // időszak hosszát), amit a Lenis interpolációja próbál "behozni" —
  // ez okozza a felcserélt/akadozó görgetési irányt visszaváltáskor.
  // Ezért a rejtett-láthatóvá válás pillanatában újraszinkronizáljuk a
  // Lenis belső állapotát a tényleges scroll-pozícióra.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      lenis?.resize();
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    }
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}
