"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/szerkeszto", label: "Oldal-szerkesztő", icon: PenSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex gap-2 overflow-x-auto">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
