"use client";

import { useEffect, useRef, useState } from "react";

// A marketing oldal lg: töréspontja 1024px — ennél szélesebb referencia-
// szélességen renderelve biztosan a "desktop" elrendezés fut, amit aztán
// CSS transform-mal zsugorítunk a rendelkezésre álló helyre. Enélkül a
// komponensek Tailwind sm:/lg: osztályai a BÖNGÉSZŐ szélessége szerint
// döntenének (nem a szűk doboz szerint), és a szöveg egyszerűen levágódna
// ahelyett, hogy mobil nézetre váltana.
const REFERENCE_WIDTH = 1280;

export function DevicePreview({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    function measure() {
      if (!outerRef.current || !innerRef.current) return;
      setScale(outerRef.current.offsetWidth / REFERENCE_WIDTH);
      setContentHeight(innerRef.current.scrollHeight);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="w-full overflow-hidden" style={{ height: contentHeight * scale || undefined }}>
      <div
        ref={innerRef}
        style={{ width: REFERENCE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
