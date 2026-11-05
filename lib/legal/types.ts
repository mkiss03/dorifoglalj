/**
 * Jogi dokumentumok (ÁSZF, adatkezelési tájékoztató) blokkszerkezete.
 * A `text` mezőkben `**félkövér**` jelölés lehet; az URL-eket és e-mail-címeket
 * a megjelenítő automatikusan linkké alakítja. Cellákban a `\n\n` bekezdéshatár.
 */
export type LegalBlock =
  | { t: "h2" | "h3" | "h4"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "kv"; rows: string[][] }
  | { t: "table"; head: string[]; rows: string[][] };
