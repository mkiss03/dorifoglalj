/** A CMS "richtext" mezők konvenciója: üres sor (`\n\n`) új bekezdést jelent
 * — ugyanaz a minta, mint a `components/Faq.tsx` válasz-szövegeinél. */
export function RichText({ text }: { text: string }) {
  return (
    <div className="mt-2 space-y-2">
      {text.split("\n\n").map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
