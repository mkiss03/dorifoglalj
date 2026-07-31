import { categories } from "@/lib/categories";
import { faqItems } from "@/lib/faq";
import type { ContentEntry } from "./types";

const CATEGORY_PHOTOS: Record<string, string> = {
  haj: "/images/hair-color.jpg",
  korom: "/images/nails-pink.jpg",
  kozmetika: "/images/facial-treatment.jpg",
  smink: "/images/makeup-flatlay.jpg",
};

/** Egyetlen forrás-igazság: minden szerkeszthető mező kulcsa, admin-címkéje,
 * típusa és jelenlegi (kódba égetett) alapértéke. Ez hajtja a szerkesztő
 * form-ját ÉS a publikus oldal fallback-jét (üres DB = pontosan ez látszik). */
export const CONTENT_SCHEMA: ContentEntry[] = [
  // ---------------------------------------------------------------- header
  {
    key: "header.nav_links",
    section: "header",
    label: "Fő navigáció",
    kind: "list",
    mode: "free",
    itemLabel: "Menüpont",
    fields: [
      { key: "label", label: "Felirat", kind: "text" },
      { key: "href", label: "Cél (link vagy #horgony)", kind: "text" },
    ],
    default: [
      { id: "nl-1", label: "Szolgáltatók keresése", href: "/kereses" },
      { id: "nl-2", label: "Szolgáltatóknak", href: "#szolgaltatoknak" },
      { id: "nl-3", label: "Árlista", href: "#arlista" },
      { id: "nl-4", label: "Blog", href: "#blog" },
      { id: "nl-5", label: "Kapcsolat", href: "#kapcsolat" },
    ],
  },
  { key: "header.categories_menu_label", section: "header", label: "„Kategóriák” menügomb", kind: "text", default: "Kategóriák" },
  { key: "header.login_label", section: "header", label: "„Belépés” gomb", kind: "text", default: "Belépés" },
  { key: "header.register_label", section: "header", label: "„Regisztráció” gomb", kind: "text", default: "Regisztráció" },

  // ------------------------------------------------------------------ hero
  { key: "hero.eyebrow", section: "hero", label: "Felirat a cím felett", kind: "text", default: "Foglalás 0–24 órában, online" },
  {
    key: "hero.heading_segments",
    section: "hero",
    label: "Főcím (3 rész — a középső színes kiemeléssel jelenik meg)",
    kind: "list",
    mode: "fixed",
    itemLabel: "Szövegrész",
    fields: [{ key: "text", label: "Szöveg", kind: "text" }],
    default: [
      { id: "lead", text: "Fodrász, körmös, kozmetikus — időpont " },
      { id: "accent", text: "30 másodperc alatt," },
      { id: "tail", text: " telefon nélkül." },
    ],
  },
  {
    key: "hero.paragraph",
    section: "hero",
    label: "Bevezető szöveg",
    kind: "textarea",
    default:
      "Az IttFoglalj.hu összeköti a vendégeket és a szépségipari szolgáltatókat — böngéssz kategória vagy település szerint, nézd meg a valós szabad időpontokat, és foglalj regisztráció nélkül.",
  },
  { key: "hero.search_button_label", section: "hero", label: "Keresés gomb szövege", kind: "text", default: "Keresés" },
  {
    key: "hero.stats",
    section: "hero",
    label: "Statisztika-sor",
    kind: "list",
    mode: "fixed",
    itemLabel: "Statisztika",
    fields: [
      { key: "value", label: "Érték", kind: "text" },
      { key: "label", label: "Leírás", kind: "text" },
    ],
    default: [
      { id: "categories", value: "10", label: "fő kategória, 50+ szolgáltatástípus" },
      { id: "free", value: "0 Ft", label: "regisztrációs és foglalási díj" },
      { id: "hours", value: "0–24", label: "non-stop online időpontfoglalás" },
      { id: "sync", value: "1 naptár", label: "web és Facebook szinkronban" },
    ],
  },
  { key: "hero.collage_image", section: "hero", label: "Kép a főcím mellett", kind: "image", default: "/images/hair-styling.jpg" },
  { key: "hero.collage_alt", section: "hero", label: "Kép leírása (alt szöveg)", kind: "text", default: "Fodrász munka közben, meleg fényben" },

  // ------------------------------------------------------------ categories
  { key: "categories.eyebrow", section: "categories", label: "Felirat a cím felett", kind: "text", default: "Kategóriák" },
  { key: "categories.heading", section: "categories", label: "Címsor", kind: "text", default: "Mit szeretnél lefoglalni?" },
  {
    key: "categories.intro",
    section: "categories",
    label: "Bevezető szöveg",
    kind: "textarea",
    default: "Szépségipari szolgáltatók egy helyen — a szolgáltató oldalán pontosan látod, mire foglalsz, és jegyzetet is fűzhetsz hozzá.",
  },
  {
    key: "categories.items",
    section: "categories",
    label: "Kategóriák (a lista maga rögzített, csak a tartalmuk szerkeszthető)",
    kind: "list",
    mode: "fixed",
    itemLabel: "Kategória",
    fields: [
      { key: "name", label: "Név", kind: "text" },
      { key: "items", label: "Példa szolgáltatások", kind: "stringlist", itemLabel: "Szolgáltatás" },
      { key: "photo", label: "Fotó (ha van, kiemelt kártyaként jelenik meg)", kind: "image" },
    ],
    default: categories.map((c) => ({
      id: c.slug,
      name: c.name,
      items: c.items,
      photo: CATEGORY_PHOTOS[c.slug] ?? null,
    })),
  },

  // ------------------------------------------------------------ howitworks
  { key: "howitworks.eyebrow", section: "howitworks", label: "Felirat a cím felett", kind: "text", default: "Egyszerű folyamat" },
  { key: "howitworks.heading", section: "howitworks", label: "Címsor", kind: "text", default: "Hogyan működik?" },
  {
    key: "howitworks.steps",
    section: "howitworks",
    label: "Lépések",
    kind: "list",
    mode: "fixed",
    itemLabel: "Lépés",
    fields: [
      { key: "title", label: "Cím", kind: "text" },
      { key: "text", label: "Leírás", kind: "text" },
    ],
    default: [
      { id: "search", title: "Keresd meg", text: "Válaszd ki a számodra megfelelő szolgáltatót kategória, település vagy szolgáltatás alapján." },
      { id: "pick", title: "Válaszd ki", text: "Nézd meg a szolgáltató szabad időpontjait, szolgáltatásait és referenciáit." },
      { id: "book", title: "Foglalj", text: "Foglalj időpontot néhány kattintással — gyorsan, egyszerűen, telefonálás nélkül." },
    ],
  },
  {
    key: "howitworks.mock_results",
    section: "howitworks",
    label: "1. lépés minta-találatai",
    kind: "list",
    mode: "fixed",
    itemLabel: "Minta találat",
    fields: [
      { key: "name", label: "Név", kind: "text" },
      { key: "area", label: "Terület", kind: "text" },
    ],
    default: [
      { id: "r1", name: "Anna Nails Studio", area: "Budapest, XIII. ker." },
      { id: "r2", name: "Aurum Hajszalon", area: "Budapest, VI. ker." },
    ],
  },
  { key: "howitworks.mock_booking_service_day", section: "howitworks", label: "2. lépés minta szolgáltatás/nap", kind: "text", default: "Gél lakk · kedd" },
  { key: "howitworks.mock_confirmation_title", section: "howitworks", label: "3. lépés minta cím", kind: "text", default: "Foglalás visszaigazolva" },
  { key: "howitworks.mock_confirmation_detail", section: "howitworks", label: "3. lépés minta részlet", kind: "text", default: "Kedd, 13:30 · Anna Nails Studio" },

  // ------------------------------------------------------------ comparison
  { key: "comparison.eyebrow", section: "comparison", label: "Felirat a cím felett", kind: "text", default: "A különbség" },
  { key: "comparison.heading", section: "comparison", label: "Címsor", kind: "text", default: "A régi módszer helyett" },
  { key: "comparison.old_way_title", section: "comparison", label: "Bal oszlop címe", kind: "text", default: "A megszokott út" },
  {
    key: "comparison.old_way_items",
    section: "comparison",
    label: "Bal oszlop pontjai",
    kind: "stringlist",
    itemLabel: "Pont",
    default: [
      "Telefonálás nyitvatartási időben",
      "Várakozás egy visszahívásra",
      "Bizonytalan, gyakran elavult szabad időpontok",
      "Könnyen elfelejtett, le nem írt időpontok",
    ],
  },
  { key: "comparison.new_way_title", section: "comparison", label: "Jobb oszlop címe", kind: "text", default: "Az IttFoglalj módszer" },
  {
    key: "comparison.new_way_items",
    section: "comparison",
    label: "Jobb oszlop pontjai",
    kind: "stringlist",
    itemLabel: "Pont",
    default: [
      "Foglalás 0–24 órában, pár kattintással",
      "Azonnali visszaigazolás e-mailben",
      "Mindig aktuális, valós szabad időpontok",
      "Automatikus emlékeztető az időpont előtt",
    ],
  },

  // ----------------------------------------------------------------- whyus
  { key: "whyus.eyebrow", section: "whyus", label: "Felirat a cím felett", kind: "text", default: "Vendégeknek" },
  { key: "whyus.heading", section: "whyus", label: "Címsor", kind: "text", default: "Miért az IttFoglalj?" },
  {
    key: "whyus.points",
    section: "whyus",
    label: "Pontok",
    kind: "list",
    mode: "fixed",
    itemLabel: "Pont",
    fields: [
      { key: "label", label: "Cím", kind: "text" },
      { key: "text", label: "Leírás", kind: "text" },
      { key: "visual", label: "Kiemelt szöveg", kind: "text" },
    ],
    default: [
      { id: "calendar", label: "Valós szabad időpontok", text: "Amit látsz, azt foglalhatod — nincs elavult naptár.", visual: "09:00 · 11:00 · 13:30" },
      { id: "click", label: "Egyszerű online foglalás", text: "Néhány kattintás, és kész is a helyed.", visual: "1 → 2 → 3 kattintás" },
      { id: "shield", label: "Megbízható szolgáltatók", text: "Valódi adatlapok, referenciákkal, árakkal.", visual: "Ellenőrzött adatlap" },
      { id: "timer", label: "Gyors, kényelmes", text: "Foglalás percek alatt, telefonálás nélkül.", visual: "Kevesebb, mint 60 mp" },
    ],
  },

  // ----------------------------------------------------------- browsebycity
  { key: "browsebycity.eyebrow", section: "browsebycity", label: "Felirat a cím felett", kind: "text", default: "Bárhol Magyarországon" },
  { key: "browsebycity.heading", section: "browsebycity", label: "Címsor", kind: "text", default: "Böngéssz település szerint" },
  { key: "browsebycity.featured_label", section: "browsebycity", label: "„Legnépszerűbb” felirat", kind: "text", default: "Legnépszerűbb" },
  { key: "browsebycity.expand_label", section: "browsebycity", label: "„Összes település” gomb", kind: "text", default: "Összes település megjelenítése" },

  // ------------------------------------------------------------ forproviders
  { key: "forproviders.eyebrow", section: "forproviders", label: "Felirat a cím felett", kind: "text", default: "Szolgáltatóknak" },
  {
    key: "forproviders.heading",
    section: "forproviders",
    label: "Címsor",
    kind: "text",
    default: "Szerezz új vendégeket, és kezeld a foglalásaidat egy helyen.",
  },
  {
    key: "forproviders.promises",
    section: "forproviders",
    label: "Ígéretek",
    kind: "list",
    mode: "free",
    itemLabel: "Ígéret",
    fields: [
      { key: "title", label: "Cím", kind: "text" },
      { key: "text", label: "Leírás", kind: "textarea" },
    ],
    default: [
      { id: "p1", title: "A vendéglistád a tiéd.", text: "Bármikor exportálod — nincs bezárva egy platformba." },
      {
        id: "p2",
        title: "Naptár, emlékeztetők, nyilatkozatok — egy helyen.",
        text: "Automatikus SMS/e-mail emlékeztető, digitális beleegyező nyilatkozat, napi bevétel-kimutatás.",
      },
      {
        id: "p3",
        title: "Facebook- és Instagram-oldaladról direkt foglalás.",
        text: "Egyetlen naptárt kezelsz — ugyanaz szinkronban fut a közösségi oldaladon és egy beágyazható widgetben is, ha saját honlapod van.",
      },
    ],
  },
  {
    key: "forproviders.benefits",
    section: "forproviders",
    label: "Funkció-lista",
    kind: "list",
    mode: "fixed",
    itemLabel: "Funkció",
    fields: [{ key: "label", label: "Szöveg", kind: "text" }],
    default: [
      { id: "profile", label: "Saját adatlap és bemutatkozás" },
      { id: "gallery", label: "Referencia munkák galériája" },
      { id: "tag", label: "Szolgáltatások és árlista" },
      { id: "calendar", label: "Szabad időpontok kezelése" },
      { id: "bell", label: "Automatikus visszaigazolás" },
      { id: "chart", label: "Bevétel-kimutatás" },
      { id: "repeat", label: "Visszatérő időpontok" },
      { id: "filecheck", label: "Digitális nyilatkozatok" },
    ],
  },
  { key: "forproviders.cta_label", section: "forproviders", label: "CTA gomb szövege", kind: "text", default: "Csatlakozom szolgáltatóként" },
  { key: "forproviders.mock_date_label", section: "forproviders", label: "Minta-naptár dátuma", kind: "text", default: "Kedd, november 17." },
  {
    key: "forproviders.mock_staff",
    section: "forproviders",
    label: "Minta-naptár munkatársai",
    kind: "list",
    mode: "fixed",
    itemLabel: "Munkatárs",
    fields: [
      { key: "initials", label: "Monogram", kind: "text" },
      { key: "name", label: "Név", kind: "text" },
    ],
    default: [
      { id: "staff-0", initials: "AK", name: "Anna" },
      { id: "staff-1", initials: "RT", name: "Réka" },
      { id: "staff-2", initials: "ZP", name: "Zsófi" },
    ],
  },
  {
    key: "forproviders.mock_bookings",
    section: "forproviders",
    label: "Minta-naptár foglalásai (elrendezésük kódban rögzített)",
    kind: "list",
    mode: "fixed",
    itemLabel: "Minta időpont",
    fields: [
      { key: "name", label: "Vendég neve", kind: "text" },
      { key: "service", label: "Szolgáltatás", kind: "text" },
    ],
    default: [
      { id: "b1", name: "Kiss Anna", service: "Gél lakk" },
      { id: "b2", name: "Tóth Réka", service: "Manikűr" },
      { id: "b3", name: "Nagy Éva", service: "Műköröm" },
      { id: "b4", name: "Papp Zsófi", service: "Vágás" },
      { id: "b5", name: "Kovács Lili", service: "Festés" },
      { id: "b6", name: "Szabó Kata", service: "Arckezelés" },
    ],
  },
  {
    key: "forproviders.mock_facebook_note",
    section: "forproviders",
    label: "Facebook-szinkron megjegyzés",
    kind: "text",
    default: "Ugyanez a naptár jelenik meg a Facebook-oldaladon is.",
  },

  // ---------------------------------------------------------------- ctabanner
  { key: "ctabanner.eyebrow", section: "ctabanner", label: "Felirat a cím felett", kind: "text", default: "Miért érdemes minket választani?" },
  {
    key: "ctabanner.heading_segments",
    section: "ctabanner",
    label: "Címsor (3 rész — a középső színes kiemeléssel jelenik meg)",
    kind: "list",
    mode: "fixed",
    itemLabel: "Szövegrész",
    fields: [{ key: "text", label: "Szöveg", kind: "text" }],
    default: [
      { id: "lead", text: "Nem csupán egy időpontfoglaló rendszer — " },
      { id: "accent", text: "közösség" },
      { id: "tail", text: ", ahol vendégek és szolgáltatók egymásra találnak." },
    ],
  },
  {
    key: "ctabanner.paragraph",
    section: "ctabanner",
    label: "Bevezető szöveg",
    kind: "textarea",
    default: "Célunk, hogy a vendégek könnyedén megtalálják a számukra legmegfelelőbb szolgáltatókat, a szolgáltatók pedig egyszerűen és hatékonyan építhessék vállalkozásukat.",
  },
  { key: "ctabanner.cta_label", section: "ctabanner", label: "CTA gomb szövege", kind: "text", default: "Időpontot keresek" },
  { key: "ctabanner.image", section: "ctabanner", label: "Kép", kind: "image", default: "/images/salon-interior.jpg" },
  { key: "ctabanner.image_alt", section: "ctabanner", label: "Kép leírása (alt szöveg)", kind: "text", default: "Modern szépségszalon belső tere" },

  // -------------------------------------------------------------------- faq
  { key: "faq.eyebrow", section: "faq", label: "Felirat a cím felett", kind: "text", default: "Gyakori kérdések" },
  { key: "faq.heading", section: "faq", label: "Címsor", kind: "text", default: "Amit még jó tudni" },
  { key: "faq.intro", section: "faq", label: "Bevezető szöveg", kind: "textarea", default: "Nem találtad meg amit kerestél? Írj nekünk, és szívesen segítünk eligazodni." },
  { key: "faq.contact_button_label", section: "faq", label: "Kapcsolat gomb szövege", kind: "text", default: "Kapcsolatfelvétel" },
  {
    key: "faq.items",
    section: "faq",
    label: "Kérdés–válasz párok",
    kind: "list",
    mode: "free",
    itemLabel: "Kérdés",
    fields: [
      { key: "question", label: "Kérdés", kind: "text" },
      { key: "answer", label: "Válasz (üres sor = új bekezdés)", kind: "richtext" },
    ],
    default: faqItems.map((item, i) => ({ id: `faq-${i}`, ...item })),
  },

  // ------------------------------------------------------- featuredproviders
  { key: "featuredproviders.eyebrow", section: "featuredproviders", label: "Felirat a cím felett", kind: "text", default: "Szolgáltatói adatlapok" },
  { key: "featuredproviders.heading", section: "featuredproviders", label: "Címsor", kind: "text", default: "Így néz ki egy adatlap az IttFoglalj.hu-n" },
  {
    key: "featuredproviders.disclaimer",
    section: "featuredproviders",
    label: "Kis megjegyzés a kártyák mellett",
    kind: "textarea",
    default: "Előnézeti minta — indulás után valódi szolgáltatók adatlapjai jelennek meg itt.",
  },
  {
    key: "featuredproviders.cards",
    section: "featuredproviders",
    label: "Minta-kártyák",
    kind: "list",
    mode: "free",
    itemLabel: "Kártya",
    fields: [
      { key: "name", label: "Név", kind: "text" },
      { key: "category", label: "Kategória", kind: "text" },
      { key: "area", label: "Terület", kind: "text" },
      { key: "rating", label: "Értékelés (1–5)", kind: "text" },
      { key: "tags", label: "Címkék", kind: "stringlist", itemLabel: "Címke" },
      { key: "slots", label: "Szabad időpontok", kind: "stringlist", itemLabel: "Időpont" },
      { key: "image", label: "Kép", kind: "image" },
    ],
    default: [
      {
        id: "fp1",
        name: "Anna Nails Studio",
        category: "Köröm",
        area: "Budapest, XIII. kerület",
        rating: "5",
        tags: ["Gél lakk", "Műköröm"],
        slots: ["10:00", "13:30", "16:00"],
        image: "/images/nails-closeup.jpg",
      },
      {
        id: "fp2",
        name: "Aurum Hajszalon",
        category: "Haj",
        area: "Budapest, VI. kerület",
        rating: "4",
        tags: ["Vágás", "Alkalmi frizura"],
        slots: ["09:30", "14:00"],
        image: "/images/hair-styling.jpg",
      },
      {
        id: "fp3",
        name: "Classic Barber Stúdió",
        category: "Haj · Barber",
        area: "Debrecen",
        rating: "5",
        tags: ["Szakállvágás", "Fazon"],
        slots: ["11:00", "15:30", "17:00"],
        image: "/images/barber-shave.jpg",
      },
      {
        id: "fp4",
        name: "Bella Kozmetika",
        category: "Kozmetika",
        area: "Szeged",
        rating: "5",
        tags: ["Arckezelés", "Hidratálás"],
        slots: ["12:00", "16:30"],
        image: "/images/facial-treatment.jpg",
      },
    ],
  },

  // ---------------------------------------------------------------- footer
  { key: "footer.tagline", section: "footer", label: "Mottó a logó alatt", kind: "text", default: "Ahol a szabad időpontok várnak." },
  {
    key: "footer.columns",
    section: "footer",
    label: "Linkoszlopok",
    kind: "list",
    mode: "free",
    itemLabel: "Oszlop",
    fields: [
      { key: "title", label: "Cím", kind: "text" },
      {
        key: "links",
        label: "Linkek",
        kind: "sublist",
        itemLabel: "Link",
        fields: [
          { key: "label", label: "Felirat", kind: "text" },
          { key: "href", label: "Cél (link vagy #horgony)", kind: "text" },
        ],
      },
    ],
    default: [
      {
        id: "col-1",
        title: "Vendégeknek",
        links: [
          { id: "l-1", label: "Szolgáltatók keresése", href: "/kereses" },
          { id: "l-2", label: "Hogyan működik", href: "#kategoriak" },
          { id: "l-3", label: "Kategóriák", href: "#kategoriak" },
          { id: "l-4", label: "Gyakori kérdések", href: "#gyik" },
        ],
      },
      {
        id: "col-2",
        title: "Szolgáltatóknak",
        links: [
          { id: "l-5", label: "Csatlakozom szolgáltatóként", href: "#szolgaltatoknak" },
          { id: "l-6", label: "Árlista", href: "#arlista" },
          { id: "l-7", label: "Funkciók", href: "#szolgaltatoknak" },
        ],
      },
      {
        id: "col-3",
        title: "Jogi információk",
        links: [
          { id: "l-8", label: "Adatkezelési tájékoztató", href: "#" },
          { id: "l-9", label: "Általános Szerződési Feltételek", href: "#" },
          { id: "l-10", label: "Impresszum", href: "#" },
        ],
      },
    ],
  },
  { key: "footer.newsletter_heading", section: "footer", label: "Hírlevél-blokk címe", kind: "text", default: "Iratkozz fel hírlevelünkre" },
  { key: "footer.newsletter_subtext", section: "footer", label: "Hírlevél-blokk szövege", kind: "textarea", default: "Új funkciók és szolgáltatók — ritkán, csak ha érdemes." },
  { key: "footer.copyright_suffix", section: "footer", label: "Copyright-sor (az évszám automatikus)", kind: "text", default: "IttFoglalj.hu — Minden jog fenntartva." },
  { key: "footer.bottom_note", section: "footer", label: "Alsó sor jobb oldali szövege", kind: "text", default: "Készült Magyarországon" },
  { key: "footer.facebook_url", section: "footer", label: "Facebook link", kind: "text", default: "#" },
  { key: "footer.instagram_url", section: "footer", label: "Instagram link", kind: "text", default: "#" },
  { key: "footer.popular_categories_label", section: "footer", label: "„Népszerű kategóriák” felirat", kind: "text", default: "Népszerű kategóriák" },
  { key: "footer.popular_cities_label", section: "footer", label: "„Népszerű települések” felirat", kind: "text", default: "Népszerű települések" },

  // ------------------------------------------------------- mobilestickycta
  { key: "mobilestickycta.label", section: "mobilestickycta", label: "Gomb szövege", kind: "text", default: "Időpontot keresek" },
];
