"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { Container } from "./ui/Container";
import { ContactModal } from "./ContactModal";
import type { SiteContent } from "@/lib/content/types";

export function Faq({ content }: { content: SiteContent["faq"] }) {
  const [open, setOpen] = useState<string | null>(content.items[0]?.id ?? null);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section id="gyik" className="scroll-mt-16 bg-paper-alt py-14 lg:scroll-mt-20 lg:py-20">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.3fr] lg:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">{content.intro}</p>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="mt-6 inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-ink/90"
          >
            {content.contact_button_label}
          </button>
        </div>

        <div className="shadow-sheet divide-y divide-line/70 rounded-3xl bg-white px-5 sm:px-8">
          {content.items.map((item, i) => {
            const isOpen = open === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel text-xs font-semibold text-ink">
                      {i + 1}
                    </span>
                    <span className="font-display text-lg text-ink">{item.question}</span>
                  </span>
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                      isOpen ? "rotate-45 bg-accent-dark text-paper" : "bg-paper-alt text-ink"
                    )}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pb-5 pl-12 text-[15px] leading-relaxed text-ink-soft">
                        {item.answer.split("\n\n").map((p, pi) => (
                          <p key={pi}>{p}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </section>
  );
}
