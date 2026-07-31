"use client";

import { motion, type Variants } from "motion/react";
import { clsx } from "clsx";
import { Fragment } from "react";

type Segment = { text: string; className?: string };

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
};

const word: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const tags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
};

function segmentsToWords(segments: Segment[]) {
  const tokens: { text: string; className?: string }[] = [];
  let current = "";
  let currentClass: string | undefined;

  const flush = () => {
    if (current !== "") {
      tokens.push({ text: current, className: currentClass });
      current = "";
      currentClass = undefined;
    }
  };

  segments.forEach((seg) => {
    for (const ch of seg.text) {
      if (ch === " ") {
        flush();
      } else {
        if (current === "") currentClass = seg.className;
        current += ch;
      }
    }
  });
  flush();

  return tokens;
}

export function RevealText({
  segments,
  as = "h1",
  className,
  fieldAnchor,
}: {
  segments: Segment[];
  as?: keyof typeof tags;
  className?: string;
  /** Admin-szerkesztő: az élő előnézet kattintás-feloldója ezt keresi
   * elsőként — a szavankénti reveal-animáció miatt a szöveg szétdarabolva
   * jelenik meg a DOM-ban, így a normál szöveg-egyezés itt nem működne. */
  fieldAnchor?: string;
}) {
  const Tag = tags[as];
  const tokens = segmentsToWords(segments);

  return (
    <Tag
      className={clsx("overflow-hidden", className)}
      data-field-anchor={fieldAnchor}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {tokens.map((t, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-1 align-top">
            <motion.span variants={word} className={clsx("inline-block", t.className)}>
              {t.text}
            </motion.span>
          </span>
          {i < tokens.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
