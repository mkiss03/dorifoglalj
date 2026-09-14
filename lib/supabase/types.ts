/** Előre definiált alkalom-címkék, amikre a szolgáltató munkát vállal. */
export type ProviderTag =
  | "eskuvo"
  | "hetkoznapi"
  | "party"
  | "ballagas"
  | "szuletesnap"
  | "ceges_esemeny";

export const PROVIDER_TAGS: ProviderTag[] = [
  "eskuvo",
  "hetkoznapi",
  "party",
  "ballagas",
  "szuletesnap",
  "ceges_esemeny",
];

export const TAG_LABELS: Record<ProviderTag, string> = {
  eskuvo: "Esküvő",
  hetkoznapi: "Hétköznapi",
  party: "Party",
  ballagas: "Ballagás",
  szuletesnap: "Születésnap",
  ceges_esemeny: "Céges esemény",
};

/** Elfogadott fizetési módok a szolgáltatónál — a szolgáltató maga jelöli
 * be a profiljában, informatív jelzés a vendégek felé (nincs tényleges
 * online fizetés a rendszerben). A korábbi `accepts_card_payment` boolean
 * megmarad és szinkronban tartjuk vele (bankkartya = true). */
export type PaymentMethod =
  | "keszpenz"
  | "bankkartya"
  | "atutalas"
  | "szep_kartya"
  | "mobilfizetes"
  | "utalvany";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "keszpenz",
  "bankkartya",
  "atutalas",
  "szep_kartya",
  "mobilfizetes",
  "utalvany",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  keszpenz: "Készpénz",
  bankkartya: "Bankkártya",
  atutalas: "Banki átutalás",
  szep_kartya: "SZÉP kártya",
  mobilfizetes: "Mobilfizetés (Revolut, Apple Pay…)",
  utalvany: "Utalvány, ajándékkártya",
};

/** Szolgáltató jóváhagyási állapota — a regisztráció után 'pending', amíg
 * Dóri manuálisan aktiválja a Supabase dashboardon. */
export type ProviderStatus = "pending" | "active" | "suspended";

export type Provider = {
  id: string;
  business_name: string;
  category: string | null;
  /** Csak akkor van kitöltve, ha a `category` az "egyeb" — a szolgáltató
   * által kért, még nem létező kategória-megnevezés (Dóri ez alapján tud
   * új kategóriát felvenni). */
  category_other: string | null;
  city: string | null;
  /** A megye HUNGARY_REGIONS-beli id-je (pl. "HU-BA") — a szolgáltató
   * választja ki regisztrációkor, mert szabad szöveges város-mezőből nem
   * lehetne megbízhatóan visszakövetkeztetni. */
  county: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  buffer_minutes: number;
  tags: ProviderTag[];
  /** A szolgáltató maga jelöli be a profiljában — informatív jelző a
   * vendégek felé, nincs hozzá tényleges online kártyás fizetés.
   * A `payment_methods`-szal szinkronban tartott, visszafelé kompatibilis
   * mező (igaz, ha a `payment_methods` tartalmazza a "bankkartya"-t). */
  accepts_card_payment: boolean;
  /** Minden elfogadott fizetési mód (a bankkártyán túl is). */
  payment_methods: PaymentMethod[];
  status: ProviderStatus;
  approved_at: string | null;
  slug: string;
  ics_token: string;
  booking_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ProviderService = {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  active: boolean;
  price_huf: number;
  duration_minutes: number;
  created_at: string;
};

/** Egy szolgáltatónál dolgozó munkatárs — akkor is létezik (pontosan 1
 * sorral), ha a szolgáltató egyszemélyes vállalkozás; ez esetben a UI
 * mindenhol elrejti a staff-választót. Nincs saját bejelentkezése — a
 * tulajdonos egy dashboardból kezeli. */
export type StaffMember = {
  id: string;
  provider_id: string;
  name: string;
  specialty: string | null;
  photo_url: string | null;
  active: boolean;
  created_at: string;
};

/** StaffMember + a hozzárendelt szolgáltatás-id-k listája (`staff_services` join). */
export type StaffMemberWithServices = StaffMember & { service_ids: string[] };

/** Weekday: 1 = hétfő … 7 = vasárnap (ISO), a `time` oszlopok "HH:MM:SS" formátumban jönnek vissza. */
export type Availability = {
  id: string;
  provider_id: string;
  staff_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  created_at: string;
};

/** Eseti (nem ismétlődő) kizárás a heti nyitvatartáson belül — pl. "kedden
 * 8-9 között el kell mennem valahova". `start_time`/`end_time` null = egész
 * napos kizárás. */
export type ProviderBlock = {
  id: string;
  provider_id: string;
  staff_id: string;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  provider_id: string;
  staff_id: string;
  service_id: string | null;
  service_name: string;
  price_huf: number | null;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: "confirmed" | "cancelled";
  created_at: string;
};

/** A `search_providers` RPC visszatérési sorai — a kereső eredménylistájához. */
export type SearchProvider = {
  id: string;
  slug: string;
  business_name: string;
  category: string | null;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  tags: ProviderTag[];
};

/** A `list_active_cities_by_county` RPC visszatérési sorai — a HungaryMap
 * dinamikus, megyénkénti város-popupjának adatforrása. */
export type CountyCityCount = {
  county: string;
  city: string;
  provider_count: number;
};

/** A `get_public_provider` RPC visszatérési alakja — csak publikus mezők. */
export type PublicProvider = {
  id: string;
  slug: string;
  business_name: string;
  city: string | null;
  address: string | null;
  category: string | null;
  /** "egyeb" kategória esetén a szolgáltató saját megnevezése — ezt
   * mutatjuk a publikus oldalon a kategória helyén. */
  category_other: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  tags: ProviderTag[];
  accepts_card_payment: boolean;
  payment_methods: PaymentMethod[];
  /** Csak az aktív munkatársak. Ha csak 1 elem van, a foglalási felület
   * nem mutat staff-választót — csendben ezt az egyet használja. */
  staff: {
    id: string;
    name: string;
    specialty: string | null;
    photo_url: string | null;
  }[];
  services: {
    id: string;
    name: string;
    description: string | null;
    price_huf: number;
    duration_minutes: number;
    /** Mely (aktív) munkatársak végzik ezt a szolgáltatást. */
    staff_ids: string[];
  }[];
};

/** A `create_booking` / `create_manual_booking` RPC-k visszatérési alakja.
 * A `create_booking` (vendég-oldali) válasza a schema_v16.sql óta a
 * visszaigazoló emailhez szükséges provider/staff adatokat is
 * tartalmazza; a `create_manual_booking` (dashboard) válasza ezeket
 * nem adja vissza, mert ott nincs email-küldés. */
export type CreateBookingResult =
  | {
      ok: true;
      booking_id: string;
      service_name: string;
      starts_at: string;
      ends_at: string;
      price_huf?: number;
      provider_name?: string;
      provider_phone?: string | null;
      provider_address?: string | null;
      provider_city?: string | null;
      staff_name?: string | null;
    }
  | {
      ok: false;
      error:
        | "missing_fields"
        | "provider_not_found"
        | "service_not_found"
        | "staff_not_found"
        | "staff_not_eligible"
        | "in_past"
        | "outside_hours"
        | "slot_blocked"
        | "slot_taken";
    };

/** A `create_hold` RPC visszatérési alakja — rövid életű zárolás egy sávra. */
export type CreateHoldResult =
  | { ok: true; hold_token: string; expires_at: string; ends_at: string }
  | {
      ok: false;
      error:
        | "provider_not_found"
        | "service_not_found"
        | "staff_not_found"
        | "staff_not_eligible"
        | "in_past"
        | "outside_hours"
        | "slot_blocked"
        | "slot_taken";
    };

/** Az `admin_list_providers` RPC egy sora — a jóváhagyó panel listájához. */
export type AdminProviderRow = {
  id: string;
  business_name: string;
  email: string;
  phone: string | null;
  category: string | null;
  /** A szolgáltató által kért, még nem létező kategória-megnevezés. */
  category_other: string | null;
  city: string | null;
  status: ProviderStatus;
  booking_enabled: boolean;
  created_at: string;
  approved_at: string | null;
};

/** Az `admin_set_provider_status` RPC visszatérési alakja. */
export type AdminSetProviderStatusResult =
  | { ok: true }
  | { ok: false; error: "not_admin" | "invalid_status" | "provider_not_found" };

/** Az `admin_get_monitoring_stats` RPC visszatérési alakja — az admin monitorozó oldalhoz. */
export type AdminMonitoringStats = {
  total_providers: number;
  pending_providers: number;
  active_providers: number;
  suspended_providers: number;
  providers_this_week: number;
  providers_this_month: number;
  total_users: number;
  total_services: number;
  total_staff: number;
  total_bookings: number;
  confirmed_bookings: number;
  month_bookings: number;
  today_bookings: number;
  week_bookings: number;
  unique_customers: number;
  media_files_count: number;
  media_bytes_estimated: number;
  total_db_rows: number;
};
