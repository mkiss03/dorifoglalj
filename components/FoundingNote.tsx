import { BadgePercent } from "lucide-react";

type Block = { kind: "p" | "li"; text: string };

const BULLET = /^[•\-–*]\s*/;

/** Az admin szerkesztő sima szövegmezőjéből (Enterrel tördelve) bekezdéseket
 * és felsorolást készít. A •, - vagy – jellel kezdődő sor felsorolás-elem;
 * a jel nélküli sor, ami közvetlenül egy másik után jön (üres sor nélkül),
 * az előzőhöz fűződik — így a máshonnan bemásolt, sor közepén eltört szöveg
 * is egyben marad. */
export function parseNote(text: string): Block[] {
  const blocks: Block[] = [];
  let afterBlank = true;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      afterBlank = true;
      continue;
    }
    if (BULLET.test(line)) {
      blocks.push({ kind: "li", text: line.replace(BULLET, "") });
    } else if (!afterBlank && blocks.length > 0) {
      blocks[blocks.length - 1].text += ` ${line}`;
    } else {
      blocks.push({ kind: "p", text: line });
    }
    afterBlank = false;
  }
  return blocks;
}

export function FoundingNote({ text, className = "" }: { text: string; className?: string }) {
  const blocks = parseNote(text);
  if (blocks.length === 0) return null;

  // Egymást követő felsorolás-elemek egy listába.
  const groups: (Block | Block[])[] = [];
  for (const b of blocks) {
    const last = groups[groups.length - 1];
    if (b.kind === "li" && Array.isArray(last)) last.push(b);
    else groups.push(b.kind === "li" ? [b] : b);
  }
  const leadIsTitle = blocks.length > 1 && blocks[0].kind === "p";

  return (
    <div
      data-field-anchor="forproviders.founding_note"
      className={`flex items-start gap-3 rounded-2xl border border-accent-dark/20 bg-accent-light/40 p-5 ${className}`}
    >
      <BadgePercent className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" strokeWidth={2} />
      <div className="min-w-0 space-y-2 text-[13px] leading-relaxed text-ink">
        {groups.map((g, i) =>
          Array.isArray(g) ? (
            <ul key={i} className="space-y-1.5">
              {g.map((li, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                  <span>{li.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={i} className={i === 0 && leadIsTitle ? "font-semibold" : undefined}>
              {g.text}
            </p>
          )
        )}
      </div>
    </div>
  );
}
