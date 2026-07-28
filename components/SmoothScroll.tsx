"use client";

import { useEffect } from "react";
import { initLenis } from "@/lib/smoothScroll";

export function SmoothScroll() {
  useEffect(() => {
    initLenis();
  }, []);

  return null;
}
