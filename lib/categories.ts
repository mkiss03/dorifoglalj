import {
  Scissors,
  Hand,
  Sparkles,
  Paintbrush,
  Eye,
  PenTool,
  Zap,
  Waves,
  Flame,
  Stamp,
  Armchair,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  slug: string;
  name: string;
  icon: LucideIcon;
  items: string[];
};

/** Ikon-lookup slug szerint — kliens-komponensekben ezt kell importálni,
 * NEM a `Category.icon`-t Server Componentből propként átadni: a LucideIcon
 * függvényreferencia nem szerializálható a server→client határon át. */

export const categories: Category[] = [
  {
    slug: "haj",
    name: "Fodrászat",
    icon: Scissors,
    items: ["Női fodrászat", "Férfi fodrászat", "Gyermek fodrászat"],
  },
  {
    slug: "korom",
    name: "Manikűr, pedikűr",
    icon: Hand,
    items: ["Műköröm", "Gél lakk"],
  },
  {
    slug: "kozmetika",
    name: "Kozmetika",
    icon: Sparkles,
    items: [
      "Arckezelések",
      "Bőrfiatalítás",
      "Problémás bőr kezelése",
      "Tisztító kezelések",
      "Hidratáló kezelések",
      "Anti-aging kezelések",
    ],
  },
  {
    slug: "smink",
    name: "Smink",
    icon: Paintbrush,
    items: ["Alkalmi smink", "Menyasszonyi smink", "Fotósmink"],
  },
  {
    slug: "szempilla",
    name: "Szempilla",
    icon: Eye,
    items: [
      "Szempilla építés",
      "Szempilla lifting",
      "Szempilla festés",
      "Szempilla eltávolítás",
    ],
  },
  {
    slug: "szemoldok",
    name: "Szemöldök",
    icon: PenTool,
    items: ["Laminálás", "Formázás", "Festés"],
  },
  {
    slug: "szortelenites",
    name: "Szőrtelenítés",
    icon: Zap,
    items: ["Gyantázás", "Cukorgyanta", "Tartós szőrtelenítés", "Lézer"],
  },
  {
    slug: "masszazs",
    name: "Masszázs",
    icon: Waves,
    items: [
      "Relax",
      "Svéd",
      "Gyógymasszázs",
      "Sportmasszázs",
      "Talpmasszázs",
      "Nyirokmasszázs",
    ],
  },
  {
    slug: "testkezelesek",
    name: "Testkezelések",
    icon: Flame,
    items: ["Alakformálás", "Cellulit kezelés", "Feszesítés", "Zsírbontás", "Gépi kezelések"],
  },
  {
    slug: "pmu",
    name: "Sminktetoválás",
    icon: Stamp,
    items: ["Szemöldök", "Ajak", "Szemhéj"],
  },
  {
    slug: "barber",
    name: "Barber",
    icon: Armchair,
    items: ["Férfi hajvágás", "Szakálligazítás", "Borotválás"],
  },
];

export const categoryIconBySlug: Record<string, LucideIcon> = Object.fromEntries(
  categories.map((c) => [c.slug, c.icon])
);

/** Nem valódi kategória, csak a szolgáltatói profil választójában
 * felajánlott "Egyéb" sor: ha a szolgáltató olyan szolgáltatást nyújt,
 * amire még nincs kategóriánk, ezt választja, és szabad szövegként megírja,
 * milyen megnevezést kér. A `categories` tömbbe szándékosan NEM kerül bele,
 * hogy a nyitóoldali kategória-csempék és a kereső szűrői változatlanok
 * maradjanak. */
export const OTHER_CATEGORY_SLUG = "egyeb";
export const OTHER_CATEGORY_LABEL = "Egyéb (új megnevezést kérek)";
