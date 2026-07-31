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
    name: "Haj",
    icon: Scissors,
    items: [
      "Fodrászat",
      "Barber",
      "Hajhosszabbítás",
      "Alkalmi frizurák",
      "Menyasszonyi frizurák",
      "Hajkezelések",
      "Hajfestés",
    ],
  },
  {
    slug: "korom",
    name: "Köröm",
    icon: Hand,
    items: ["Manikűr", "Műköröm", "Gél lakk", "Pedikűr", "Körömápolás"],
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
    items: ["Gyanta", "Cukorgyanta", "IPL", "Lézer"],
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
    name: "PMU",
    icon: Stamp,
    items: ["Szemöldök", "Ajak", "Szemhéj"],
  },
];

export const categoryIconBySlug: Record<string, LucideIcon> = Object.fromEntries(
  categories.map((c) => [c.slug, c.icon])
);
