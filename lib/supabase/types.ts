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

/** Szolgáltató jóváhagyási állapota — a regisztráció után 'pending', amíg
 * Dóri manuálisan aktiválja a Supabase dashboardon. */
export type ProviderStatus = "pending" | "active" | "suspended";

export type Provider = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  buffer_minutes: number;
  tags: ProviderTag[];
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

/** Weekday: 1 = hétfő … 7 = vasárnap (ISO), a `time` oszlopok "HH:MM:SS" formátumban jönnek vissza. */
export type Availability = {
  id: string;
  provider_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  created_at: string;
};

export type Booking = {
  id: string;
  provider_id: string;
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

/** A `get_public_provider` RPC visszatérési alakja — csak publikus mezők. */
export type PublicProvider = {
  id: string;
  slug: string;
  business_name: string;
  city: string | null;
  address: string | null;
  category: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  tags: ProviderTag[];
  services: {
    id: string;
    name: string;
    description: string | null;
    price_huf: number;
    duration_minutes: number;
  }[];
};

/** A `create_booking` / `create_manual_booking` RPC-k visszatérési alakja. */
export type CreateBookingResult =
  | { ok: true; booking_id: string; service_name: string; starts_at: string; ends_at: string }
  | {
      ok: false;
      error: "missing_fields" | "provider_not_found" | "service_not_found" | "in_past" | "outside_hours" | "slot_taken";
    };

/** A `create_hold` RPC visszatérési alakja — rövid életű zárolás egy sávra. */
export type CreateHoldResult =
  | { ok: true; hold_token: string; expires_at: string; ends_at: string }
  | {
      ok: false;
      error: "provider_not_found" | "service_not_found" | "in_past" | "outside_hours" | "slot_taken";
    };

/** Az `admin_list_providers` RPC egy sora — a jóváhagyó panel listájához. */
export type AdminProviderRow = {
  id: string;
  business_name: string;
  email: string;
  phone: string | null;
  category: string | null;
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
