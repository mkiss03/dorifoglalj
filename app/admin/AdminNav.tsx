"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/szerkeszto", label: "Oldal-szerkesztő", icon: PenSquare },
];

function isActive(pathname: string, href: string) {
  return pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <nav aria-label="Admin" className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                active ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              {label}
            </Link>
          );
        })}
      </nav>

      <nav aria-label="Admin" className="hidden shrink-0 lg:sticky lg:top-8 lg:block lg:w-56">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink-soft hover:bg-panel"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
