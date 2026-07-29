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
  status: "draft" | "pending_review" | "published";
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
