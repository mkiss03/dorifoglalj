/**
 * PoweredByWelisse — "Powered by Welisse" jelvény.
 *
 * Nincs semmilyen külső függősége (nem használ lucide-react-et, motion-t
 * vagy Tailwindet) — szándékosan lekapcsolva a projekt design tokenjeitől,
 * saját inline stílusokkal, hogy bármelyik jövőbeli ügyfél-projektbe
 * változtatás nélkül átvihető legyen.
 */
export function PoweredByWelisse({
  theme = "dark",
  utm = "",
  markSrc = "/brand/welisse-mark.png",
  markSrc2x = "/brand/welisse-mark@2x.png",
  style = {},
}: {
  theme?: "dark" | "light";
  utm?: string;
  markSrc?: string;
  markSrc2x?: string;
  style?: React.CSSProperties;
}) {
  const muted = theme === "dark" ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.5)";
  const strong = theme === "dark" ? "rgba(255,255,255,0.85)" : "#0F172A";

  const href =
    "https://welisse.hu/" +
    (utm ? `?utm_source=${encodeURIComponent(utm)}&utm_medium=footer&utm_campaign=powered_by` : "");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="powered-by-welisse"
      aria-label="Készítette a Welisse — welisse.hu"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.8rem",
        lineHeight: 1,
        letterSpacing: "0.01em",
        textDecoration: "none",
        color: muted,
        transition: "color 0.2s ease, opacity 0.2s ease",
        opacity: 0.85,
        ...style,
      }}
    >
      <span>Powered by</span>
      <img
        src={markSrc}
        srcSet={markSrc2x ? `${markSrc} 1x, ${markSrc2x} 2x` : undefined}
        alt=""
        width={30}
        height={16}
        loading="lazy"
        decoding="async"
        style={{ display: "block", height: "16px", width: "auto" }}
      />
      <span style={{ fontWeight: 700, color: strong }}>Welisse</span>

      <style>{`
        .powered-by-welisse:hover { opacity: 1 !important; color: #00E5FF !important; }
        .powered-by-welisse:focus-visible {
          outline: 2px solid #00E5FF; outline-offset: 4px; border-radius: 6px;
        }
      `}</style>
    </a>
  );
}
