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
      { id: "nl-5", label: "Kapcsolat", href: "#gyik" },
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
      { id: "lead", text: "Fodrász, körmös, kozmetikus: időpont " },
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
      "Az IttFoglalj.hu összeköti a vendégeket a szépségipari szolgáltatókkal. Böngéssz kategória vagy település szerint, nézd meg a valós szabad időpontokat, és regisztráció nélkül foglalj.",
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
      { id: "categories", value: "10", label: "fő kategória, 46+ szolgáltatástípus" },
      { id: "free", value: "0 Ft", label: "regisztrációs és foglalási díj" },
      { id: "hours", value: "0–24", label: "non-stop online időpontfoglalás" },
      { id: "sync", value: "1 naptár", label: "Google és Apple naptárral szinkronban" },
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
    default: "Szépségipari szolgáltatók egy helyen: a szolgáltató oldalán pontosan látod, mire foglalsz, és jegyzetet is fűzhetsz hozzá.",
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
    key: "howitworks.disclaimer",
    section: "howitworks",
    label: "Kis megjegyzés a képernyők mellett",
    kind: "text",
    default: "Illusztráció, mintaadatokkal.",
  },
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
      { id: "book", title: "Foglalj", text: "Foglalj időpontot néhány kattintással, telefonálás nélkül." },
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
      "Azonnali visszaigazolás a képernyőn",
      "Mindig aktuális, valós szabad időpontok",
      "Egy kattintással a saját naptáradba mentheted",
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
      { id: "calendar", label: "Valós szabad időpontok", text: "Amit látsz, azt foglalhatod, mert nincs elavult naptár a háttérben.", visual: "09:00 · 11:00 · 13:30" },
      { id: "click", label: "Egyszerű online foglalás", text: "Néhány kattintás, és kész is a helyed.", visual: "1 → 2 → 3 kattintás" },
      { id: "shield", label: "Megbízható szolgáltatók", text: "Valódi adatlapok, referenciákkal, árakkal.", visual: "Ellenőrzött adatlap" },
      { id: "timer", label: "Gyors, kényelmes", text: "Foglalás percek alatt, telefonálás nélkül.", visual: "Kevesebb, mint 60 mp" },
    ],
  },

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
      {
        id: "p1",
        title: "Foglalás percek alatt, telefonálás nélkül.",
        text: "A vendégeid regisztráció nélkül, közvetlenül a saját foglalási oldaladon foglalhatnak időpontot.",
      },
      {
        id: "p2",
        title: "Mindig naprakész naptár.",
        text: "A szabad időpontjaid automatikusan frissülnek a nyitvatartásod és a meglévő foglalásaid alapján, így dupla foglalás nem fordulhat elő.",
      },
      {
        id: "p3",
        title: "Egy link, amit bárhol megoszthatsz.",
        text: "A foglalási oldalad linkjét kiteheted a Facebook- vagy Instagram-oldaladra is, és QR-kóddal is megoszthatod.",
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
      { id: "gallery", label: "Logó és borítókép" },
      { id: "tag", label: "Szolgáltatások és árlista" },
      { id: "calendar", label: "Nyitvatartás és szünet (puffer) kezelése" },
      { id: "bell", label: "Azonnali, automatikus visszaigazolás" },
      { id: "chart", label: "Manuális/telefonos foglalás felvétele" },
      { id: "repeat", label: "Megosztható link és QR-kód" },
      { id: "filecheck", label: "Naptár-szinkron (.ics feed)" },
    ],
  },
  { key: "forproviders.cta_label", section: "forproviders", label: "CTA gomb szövege", kind: "text", default: "Csatlakozom szolgáltatóként" },
  { key: "forproviders.mock_date_label", section: "forproviders", label: "Minta-naptár dátuma", kind: "text", default: "Kedd, november 17." },
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
      { id: "b3", name: "Papp Zsófi", service: "Vágás" },
    ],
  },
  {
    key: "forproviders.mock_facebook_note",
    section: "forproviders",
    label: "Facebook-megosztás megjegyzés",
    kind: "text",
    default: "Ezt a linket oszd meg a Facebook-oldaladon is.",
  },
  {
    key: "forproviders.mock_disclaimer",
    section: "forproviders",
    label: "Kis megjegyzés a minta-naptár mellett",
    kind: "text",
    default: "Illusztráció, mintaadatokkal.",
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
      { id: "lead", text: "Egy hely, ahol " },
      { id: "accent", text: "vendégek és szolgáltatók" },
      { id: "tail", text: " egymásra találnak." },
    ],
  },
  {
    key: "ctabanner.paragraph",
    section: "ctabanner",
    label: "Bevezető szöveg",
    kind: "textarea",
    default: "A vendégeknek megkönnyítjük, hogy megtalálják a hozzájuk illő szolgáltatót. A szolgáltatóknak pedig egy egyszerű eszközt adunk, amivel a vállalkozásukat építhetik.",
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
  { key: "featuredproviders.eyebrow", section: "featuredproviders", label: "Felirat a cím felett", kind: "text", default: "Már nálunk foglalható" },
  { key: "featuredproviders.heading", section: "featuredproviders", label: "Címsor", kind: "text", default: "Néhány szolgáltató, akihez most is időpontot foglalhatsz" },

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
          { id: "l-2", label: "Hogyan működik", href: "#hogyan-mukodik" },
          { id: "l-3", label: "Kategóriák", href: "#kategoriak" },
          { id: "l-4", label: "Gyakori kérdések", href: "#gyik" },
        ],
      },
      {
        id: "col-2",
        title: "Szolgáltatóknak",
        links: [
          { id: "l-5", label: "Csatlakozom szolgáltatóként", href: "#szolgaltatoknak" },
        ],
      },
      {
        id: "col-3",
        title: "Jogi információk",
        links: [
          { id: "l-8", label: "Adatkezelési tájékoztató", href: "/adatkezeles" },
          { id: "l-9", label: "Általános Szerződési Feltételek", href: "/aszf" },
          { id: "l-10", label: "Impresszum", href: "/impresszum" },
        ],
      },
    ],
  },
  { key: "footer.copyright_suffix", section: "footer", label: "Copyright-sor (az évszám automatikus)", kind: "text", default: "IttFoglalj.hu — Minden jog fenntartva." },
  { key: "footer.bottom_note", section: "footer", label: "Alsó sor jobb oldali szövege", kind: "text", default: "Készült Magyarországon" },
  { key: "footer.facebook_url", section: "footer", label: "Facebook link", kind: "text", default: "#" },
  { key: "footer.instagram_url", section: "footer", label: "Instagram link", kind: "text", default: "#" },
  { key: "footer.popular_categories_label", section: "footer", label: "„Népszerű kategóriák” felirat", kind: "text", default: "Népszerű kategóriák" },
  { key: "footer.popular_cities_label", section: "footer", label: "„Népszerű települések” felirat", kind: "text", default: "Népszerű települések" },

  // ------------------------------------------------------- mobilestickycta
  { key: "mobilestickycta.label", section: "mobilestickycta", label: "Gomb szövege", kind: "text", default: "Időpontot keresek" },

  // ------------------------------------------------------------------ legal
  // Az ÁSZF, az Adatkezelési tájékoztató és az Impresszum közös üzemeltetői
  // adatai — egy helyen szerkesztve, mindhárom oldal ezt olvassa.
  { key: "legal.company_name", section: "legal", label: "Cégnév", kind: "text", default: "[Cégnév]" },
  { key: "legal.company_address", section: "legal", label: "Székhely", kind: "text", default: "[Székhely]" },
  { key: "legal.tax_number", section: "legal", label: "Adószám", kind: "text", default: "[Adószám]" },
  { key: "legal.registration_number", section: "legal", label: "Cégjegyzékszám", kind: "text", default: "[Cégjegyzékszám]" },
  { key: "legal.registering_court", section: "legal", label: "Nyilvántartó (illetékes cégbíróság)", kind: "text", default: "[Illetékes cégbíróság]" },

  // ------------------------------------------------------------------- aszf
  {
    key: "aszf.disclaimer",
    section: "aszf",
    label: "Megjegyzés-doboz szövege (üresen hagyva eltűnik)",
    kind: "textarea",
    default:
      "Ez az oldal még véglegesítés alatt áll: a szögletes zárójelben szereplő adatok a szolgáltató cégbejegyzési adataival lesznek kitöltve. A leírtak a rendszer jelenlegi, tényleges működését tükrözik.",
  },
  {
    key: "aszf.service_body",
    section: "aszf",
    label: "„A szolgáltatás” szövege",
    kind: "richtext",
    default:
      "Az IttFoglalj.hu egy időpontfoglaló piactér, amely összeköti a szépségipari (fodrász, köröm, kozmetika, masszázs stb.) szolgáltatókat és az időpontot kereső vendégeket. A platform maga nem nyújtja a lefoglalt szolgáltatásokat: az adott foglalás teljesítéséért a kiválasztott szolgáltató felel.",
  },
  {
    key: "aszf.guests_body",
    section: "aszf",
    label: "„Vendégeknek” szövege",
    kind: "richtext",
    default:
      "Időpontot regisztráció nélkül, ingyenesen foglalhatsz. A foglalás a szolgáltató által megadott szabad időpontok közül, a foglalás pillanatában azonnal megerősítésre kerül. Külön e-mailes visszaigazolást a rendszer jelenleg nem küld, a képernyőn megjelenő visszaigazolás számít véglegesnek. Önálló, vendég-oldali módosítási vagy lemondási funkció jelenleg nincs, ehhez közvetlenül a szolgáltatót kell keresni. Ha a szolgáltató mondja le a foglalást, és megadtál e-mail címet, erről automatikus e-mail értesítést kapsz.",
  },
  {
    key: "aszf.providers_body",
    section: "aszf",
    label: "„Szolgáltatóknak” szövege",
    kind: "richtext",
    default:
      "A regisztráció és a platform használata jelenleg díjmentes. Az új szolgáltatói fiókok manuális jóváhagyáson esnek át: a regisztrációt követően a platform üzemeltetője egyezteti a részleteket, majd aktiválja a fiókot. A jóváhagyásig a szolgáltató profilja nem jelenik meg a keresésben, és nem fogadhat foglalást.",
  },
  {
    key: "aszf.liability_body",
    section: "aszf",
    label: "„Felelősség” szövege",
    kind: "richtext",
    default:
      "A platform közvetítői szerepet tölt be: a foglalt szolgáltatás minőségéért, a szolgáltató és a vendég közötti egyeztetésért, valamint az esetleges elmaradt vagy módosított időpontokért a szolgáltató felel. A platform törekszik a pontos, naprakész adatok megjelenítésére, de nem garantálja a szolgáltatók által megadott adatok teljességét vagy pontosságát.",
  },
  {
    key: "aszf.modification_body",
    section: "aszf",
    label: "„Módosítás” szövege",
    kind: "textarea",
    default:
      "A jelen feltételeket a platform üzemeltetője időről időre módosíthatja, a mindenkor hatályos változat ezen az oldalon érhető el.",
  },

  // ------------------------------------------------------------ adatkezeles
  {
    key: "adatkezeles.disclaimer",
    section: "adatkezeles",
    label: "Megjegyzés-doboz szövege (üresen hagyva eltűnik)",
    kind: "textarea",
    default:
      "Ez az oldal még véglegesítés alatt áll: a szögletes zárójelben szereplő adatok a szolgáltató cégbejegyzési adataival lesznek kitöltve. A leírt adatkezelési gyakorlat magát a rendszer működését pontosan tükrözi.",
  },
  {
    key: "adatkezeles.data_categories",
    section: "adatkezeles",
    label: "„Milyen adatokat kezelünk” listája",
    kind: "list",
    mode: "fixed",
    itemLabel: "Adatkategória",
    fields: [
      { key: "label", label: "Kiemelt cím", kind: "text" },
      { key: "text", label: "Szöveg", kind: "textarea" },
    ],
    default: [
      {
        id: "guest",
        label: "Foglaláskor (vendégként):",
        text: "név, telefonszám, és — ha megadod — e-mail cím, a foglalás időpontja és a választott szolgáltatás. Regisztráció nem szükséges.",
      },
      {
        id: "provider",
        label: "Szolgáltatói regisztrációkor:",
        text: "e-mail cím és jelszó (a jelszót titkosítva, a Supabase Auth kezeli), vállalkozás neve, kategória, település, cím, telefonszám, bemutatkozó szöveg, weboldal/közösségi média linkek, feltöltött logó és borítókép.",
      },
      {
        id: "cookies",
        label: "Munkamenet-sütik:",
        text: "kizárólag a bejelentkezés fenntartásához szükséges, funkcionálisan kötelező sütik. Marketing- vagy követő sütiket nem használunk.",
      },
    ],
  },
  {
    key: "adatkezeles.purpose_body",
    section: "adatkezeles",
    label: "„Az adatkezelés célja és jogalapja” szövege",
    kind: "richtext",
    default:
      "A foglalással kapcsolatos adatokat a szolgáltatás nyújtásához (a foglalás létrehozásához és a szolgáltató tájékoztatásához) kezeljük, jogalapja a szerződés teljesítése (GDPR 6. cikk (1) b)). A szolgáltatói fiók adatait a regisztrációval létrejövő szerződés teljesítéséhez kezeljük.",
  },
  {
    key: "adatkezeles.recipients_body",
    section: "adatkezeles",
    label: "„Kik férnek hozzá az adatokhoz” szövege",
    kind: "richtext",
    default:
      "A foglalás adatait kizárólag az érintett szolgáltató és a platform üzemeltetője látja. Adatfeldolgozóként a Supabase, Inc. (adatbázis- és hitelesítés-szolgáltatás), a Vercel Inc. (alkalmazás-üzemeltetés) és a Resend, Inc. (foglalás-lemondásról értesítő e-mailek kiküldése) működik közre. Harmadik félnek marketingcélra nem adjuk át az adataidat.",
  },
  {
    key: "adatkezeles.retention_period",
    section: "adatkezeles",
    label: "Megőrzési idő (a mondatba fűzve: „...ideig őrizzük meg”)",
    kind: "text",
    default: "[X]",
  },
  {
    key: "adatkezeles.retention_extra_body",
    section: "adatkezeles",
    label: "Megőrzési idő — kiegészítő szöveg (a fiókadatokról)",
    kind: "richtext",
    default: "A szolgáltatói fiók adatait a fiók törléséig, illetve — ha ezt kéred — a törlési kérelem teljesítéséig kezeljük.",
  },
  {
    key: "adatkezeles.rights_body",
    section: "adatkezeles",
    label: "„Jogaid” szövege",
    kind: "textarea",
    default:
      "Bármikor kérhetsz tájékoztatást a rólad kezelt adatokról, kérheted azok helyesbítését, törlését, kezelésük korlátozását, valamint tiltakozhatsz a kezelésük ellen. Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, naih.hu) fordulhatsz.",
  },

  // ------------------------------------------------------------- impresszum
  {
    key: "impresszum.disclaimer",
    section: "impresszum",
    label: "Megjegyzés-doboz szövege (üresen hagyva eltűnik)",
    kind: "textarea",
    default:
      "Ez az oldal még véglegesítés alatt áll: a szögletes zárójelben szereplő adatok a szolgáltató cégbejegyzési adataival lesznek kitöltve.",
  },
  {
    key: "impresszum.hosting_body",
    section: "impresszum",
    label: "„Tárhelyszolgáltató” szövege",
    kind: "richtext",
    default:
      "Supabase, Inc. (adatbázis- és tárhelyszolgáltatás) · Vercel Inc. (alkalmazás-üzemeltetés). Az oldal tényleges infrastruktúra-szolgáltatóinak pontos, aktuális elérhetőségei itt kerülnek feltüntetésre.",
  },
  {
    key: "impresszum.enforcement_body",
    section: "impresszum",
    label: "„Jogérvényesítési lehetőségek” szövege",
    kind: "richtext",
    default: "Panasszal a Nemzeti Fogyasztóvédelmi Hatósághoz, illetve a lakóhely szerint illetékes békéltető testülethez fordulhatsz.",
  },
];
