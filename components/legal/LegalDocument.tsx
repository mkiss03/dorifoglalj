import { Fragment, type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import type { LegalBlock } from "@/lib/legal/types";

const TOKEN =
  /(\*\*[^*]+\*\*)|(https?:\/\/[^\s<>()]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** `**félkövér**`, URL és e-mail-cím felismerése egy szövegsorban. */
function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    const [token, bold, url, email] = match;
    if (bold) {
      out.push(
        <strong key={index} className="font-semibold text-ink">
          {bold.slice(2, -2)}
        </strong>,
      );
    } else {
      // A mondatvégi írásjel ne kerüljön bele a linkbe.
      const raw = url ?? email ?? token;
      const trimmed = raw.replace(/[.,;:]+$/, "");
      const href = url ? trimmed : `mailto:${trimmed}`;
      out.push(
        <a
          key={index}
          href={href}
          className="break-words text-accent-dark underline decoration-accent-dark/30 underline-offset-2 hover:decoration-accent-dark"
          {...(url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {trimmed}
        </a>,
      );
      if (trimmed.length < raw.length) out.push(raw.slice(trimmed.length));
    }
    last = index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function Paragraphs({ text }: { text: string }) {
  const parts = text.split("\n\n");
  if (parts.length === 1) return <Inline text={text} />;
  return (
    <div className="space-y-2">
      {parts.map((part, i) => (
        <p key={i}>
          <Inline text={part} />
        </p>
      ))}
    </div>
  );
}

function headingId(index: number) {
  return `pont-${index + 1}`;
}

function Block({ block, id }: { block: LegalBlock; id: string }) {
  switch (block.t) {
    case "h2":
      return (
        <h2
          id={id}
          className="scroll-mt-24 border-t border-line pt-10 font-display text-2xl tracking-tight text-ink first:border-t-0 first:pt-0"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="pt-3 font-display text-lg text-ink">{block.text}</h3>
      );
    case "h4":
      return <h4 className="pt-2 font-semibold text-ink">{block.text}</h4>;
    case "p":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-1.5 pl-5 marker:text-accent-dark">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case "kv":
      return (
        <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper-alt/60 text-sm">
          {block.rows.map(([label, value], i) => (
            <div
              key={i}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4"
            >
              <dt className="font-semibold text-ink">{label}</dt>
              <dd className="min-w-0 break-words">
                <Paragraphs text={value ?? ""} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-paper-alt text-ink">
              <tr>
                {block.head.map((cell, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {block.rows.map((row, r) => (
                <tr key={r} className="align-top">
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-3">
                      <Paragraphs text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function LegalDocument({
  title,
  meta,
  blocks,
}: {
  title: string;
  meta: { label: string; value: string }[];
  blocks: LegalBlock[];
}) {
  const parts = blocks.flatMap((block, index) =>
    block.t === "h2" ? [{ text: block.text, index }] : [],
  );

  return (
    <section className="py-14 lg:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">
            Jogi információk
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            {meta.map((item, i) => (
              <Fragment key={item.label}>
                {i > 0 && <span className="px-2 text-line">·</span>}
                {item.label}:{" "}
                <span className="font-semibold text-ink">{item.value}</span>
              </Fragment>
            ))}
          </p>

          <nav
            aria-label="Tartalomjegyzék"
            className="mt-8 rounded-2xl border border-line bg-paper-alt/60 p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Tartalom
            </p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {parts.map(({ text, index }) => (
                <li key={index}>
                  <a
                    href={`#${headingId(index)}`}
                    className="text-ink hover:text-accent-dark"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {blocks.map((block, index) => (
              <Block key={index} block={block} id={headingId(index)} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
