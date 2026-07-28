"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={
        "shadow-overlay fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper transition-transform duration-200 lg:hidden " +
        (visible ? "translate-y-0" : "translate-y-full")
      }
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href="#kereses"
        className="flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-semibold text-ink"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
        Időpontot keresek
      </a>
    </div>
  );
}
