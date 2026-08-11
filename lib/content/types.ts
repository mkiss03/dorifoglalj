/** Az admin-szerkesztő és a publikus oldal közös tartalom-típusai. */

export type ScalarKind = "text" | "textarea" | "richtext" | "image";

/** Lista-elem mezője — legfeljebb egy szintig ágyazható (sublist). */
export type ItemFieldDef =
  | { key: string; label: string; kind: ScalarKind }
  | { key: string; label: string; kind: "stringlist"; itemLabel: string }
  | { key: string; label: string; kind: "sublist"; itemLabel: string; fields: ItemFieldDef[] };

export type SectionId =
  | "header"
  | "hero"
  | "categories"
  | "howitworks"
  | "comparison"
  | "whyus"
  | "forproviders"
  | "ctabanner"
  | "faq"
  | "featuredproviders"
  | "footer"
  | "mobilestickycta"
  | "legal"
  | "aszf"
  | "adatkezeles"
  | "impresszum";

export type ContentEntry =
  | { key: string; section: SectionId; label: string; kind: ScalarKind; default: string }
  | { key: string; section: SectionId; label: string; kind: "stringlist"; itemLabel: string; default: string[] }
  | {
      key: string;
      section: SectionId;
      label: string;
      kind: "list";
      mode: "fixed" | "free";
      itemLabel: string;
      fields: ItemFieldDef[];
      default: Record<string, unknown>[];
    };

export const SECTION_LABELS: Record<SectionId, string> = {
  header: "Fejléc",
  hero: "Hero (nyitó szekció)",
  categories: "Kategóriák",
  howitworks: "Hogyan működik",
  comparison: "A különbség",
  whyus: "Miért az IttFoglalj",
  forproviders: "Szolgáltatóknak",
  ctabanner: "CTA banner",
  faq: "Gyakori kérdések",
  featuredproviders: "Szolgáltatói adatlap-minta",
  footer: "Lábléc",
  mobilestickycta: "Mobil alsó sáv",
  legal: "Cégadatok",
  aszf: "ÁSZF",
  adatkezeles: "Adatkezelési tájékoztató",
  impresszum: "Impresszum",
};

/** DB-ből feloldott, mindig teljesen kitöltött tartalom-fa — ezt kapják
 * props-ban a marketing-komponensek, és ezt tartja a szerkesztő draft state-je. */
export type SiteContent = {
  header: {
    nav_links: { id: string; label: string; href: string }[];
    categories_menu_label: string;
    login_label: string;
    register_label: string;
  };
  hero: {
    eyebrow: string;
    heading_segments: { id: string; text: string }[];
    paragraph: string;
    search_button_label: string;
    stats: { id: string; value: string; label: string }[];
    collage_image: string;
    collage_alt: string;
  };
  categories: {
    eyebrow: string;
    heading: string;
    intro: string;
    items: { id: string; name: string; items: string[]; photo: string | null }[];
  };
  howitworks: {
    eyebrow: string;
    heading: string;
    disclaimer: string;
    steps: { id: string; title: string; text: string }[];
    mock_results: { id: string; name: string; area: string }[];
    mock_booking_service_day: string;
    mock_confirmation_title: string;
    mock_confirmation_detail: string;
  };
  comparison: {
    eyebrow: string;
    heading: string;
    old_way_title: string;
    old_way_items: string[];
    new_way_title: string;
    new_way_items: string[];
  };
  whyus: {
    eyebrow: string;
    heading: string;
    points: { id: string; label: string; text: string; visual: string }[];
  };
  forproviders: {
    eyebrow: string;
    heading: string;
    promises: { id: string; title: string; text: string }[];
    benefits: { id: string; label: string }[];
    cta_label: string;
    mock_date_label: string;
    mock_bookings: { id: string; name: string; service: string }[];
    mock_facebook_note: string;
    mock_disclaimer: string;
  };
  ctabanner: {
    eyebrow: string;
    heading_segments: { id: string; text: string }[];
    paragraph: string;
    cta_label: string;
    image: string;
    image_alt: string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    intro: string;
    contact_button_label: string;
    items: { id: string; question: string; answer: string }[];
  };
  featuredproviders: {
    eyebrow: string;
    heading: string;
    disclaimer: string;
    cards: {
      id: string;
      name: string;
      category: string;
      area: string;
      rating: string;
      tags: string[];
      slots: string[];
      image: string;
    }[];
  };
  footer: {
    tagline: string;
    columns: { id: string; title: string; links: { id: string; label: string; href: string }[] }[];
    copyright_suffix: string;
    bottom_note: string;
    facebook_url: string;
    instagram_url: string;
    popular_categories_label: string;
    popular_cities_label: string;
  };
  mobilestickycta: {
    label: string;
  };
  /** A három jogi oldal közös üzemeltetői adatai — egy helyen szerkesztve,
   * mindhárom oldal (ÁSZF, Adatkezelés, Impresszum) ezt olvassa. */
  legal: {
    company_name: string;
    company_address: string;
    tax_number: string;
    registration_number: string;
    registering_court: string;
  };
  aszf: {
    disclaimer: string;
    service_body: string;
    guests_body: string;
    providers_body: string;
    liability_body: string;
    modification_body: string;
  };
  adatkezeles: {
    disclaimer: string;
    data_categories: { id: string; label: string; text: string }[];
    purpose_body: string;
    recipients_body: string;
    retention_period: string;
    retention_extra_body: string;
    rights_body: string;
  };
  impresszum: {
    disclaimer: string;
    hosting_body: string;
    enforcement_body: string;
  };
};
