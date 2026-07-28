"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { Container } from "./ui/Container";
import { Logo } from "./Logo";
import { categories } from "@/lib/categories";

const navLinks = [
  { label: "Szolgáltatóknak", href: "#szolgaltatoknak" },
  { label: "Árlista", href: "#arlista" },
  { label: "Blog", href: "#blog" },
  { label: "Kapcsolat", href: "#kapcsolat" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper px-4 pb-2 pt-3 lg:px-6 lg:pt-4">
      <div className="shadow-card mx-auto max-w-7xl rounded-full bg-white">
        <div className="flex h-14 items-center justify-between px-5 lg:h-16 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Logo className="text-lg lg:text-xl" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                className="flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:bg-paper-alt hover:text-ink"
                aria-expanded={catOpen}
              >
                Kategóriák
                <ChevronDown
                  className={clsx("h-4 w-4 transition-transform duration-200", catOpen && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                  >
                    <div className="shadow-sheet grid grid-cols-2 gap-1 rounded-2xl bg-white p-3">
                      {categories.map((c) => (
                        <div
                          key={c.slug}
                          className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-paper-alt"
                        >
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel text-ink">
                            <c.icon className="h-4 w-4" strokeWidth={1.75} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-ink">{c.name}</span>
                            <span className="block text-xs text-ink-soft">
                              {c.items.slice(0, 3).join(", ")}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:bg-paper-alt hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/bejelentkezes"
              className="px-3 py-2 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Belépés
            </Link>
            <Link
              href="/regisztracio"
              className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90"
            >
              Regisztráció
            </Link>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-paper-alt lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <Container className="pt-2">
              <div className="shadow-card rounded-3xl bg-white p-5">
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-accent-dark">
                  Kategóriák
                </p>
                <div className="grid grid-cols-2 gap-1 pb-3">
                  {categories.map((c) => (
                    <div key={c.slug} className="flex items-center gap-2 rounded-xl px-1 py-2">
                      <c.icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                      <span className="text-sm text-ink">{c.name}</span>
                    </div>
                  ))}
                </div>
                <div className="my-1 h-px bg-line" />
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-1 py-2.5 text-[15px] font-medium text-ink-soft"
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="flex gap-3 pt-3">
                  <Link
                    href="/bejelentkezes"
                    className="shadow-card flex-1 rounded-full bg-paper-alt px-4 py-2.5 text-center text-[15px] font-medium text-ink"
                  >
                    Belépés
                  </Link>
                  <Link
                    href="/regisztracio"
                    className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center text-[15px] font-semibold text-paper"
                  >
                    Regisztráció
                  </Link>
                </div>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
