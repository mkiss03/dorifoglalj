"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import type { CreateBookingResult } from "@/lib/supabase/types";

export type ProfileState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const categorySlugs = new Set(categories.map((c) => c.slug));
const cityNames = new Set(cities);

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const businessName = String(formData.get("business_name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "");
  const facebookUrl = String(formData.get("facebook_url") ?? "");
  const instagramUrl = String(formData.get("instagram_url") ?? "");

  if (!businessName) {
    return { status: "error", message: "A vállalkozás neve kötelező." };
  }
  if (category && !categorySlugs.has(category)) {
    return { status: "error", message: "Érvénytelen kategória." };
  }
  if (city && !cityNames.has(city)) {
    return { status: "error", message: "Érvénytelen település." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("providers")
    .update({
      business_name: businessName,
      category: category || null,
      city: city || null,
      address: address || null,
      phone: phone || null,
      description: description || null,
      website: normalizeUrl(website),
      facebook_url: normalizeUrl(facebookUrl),
      instagram_url: normalizeUrl(instagramUrl),
    })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Profil mentve." };
}

export type MediaState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const MEDIA_BUCKET = "provider-media";
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

async function uploadProviderMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  kind: "logo" | "cover"
): Promise<{ error?: string; url?: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Csak kép tölthető fel (PNG, JPG vagy WebP)." };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { error: "A kép mérete legfeljebb 5 MB lehet." };
  }

  const path = `${userId}/${kind}`;
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "Hiba történt a feltöltés során." };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  // Cache-busting: upsert miatt ugyanaz az URL, különben a böngésző a régi képet mutatná.
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

export async function updateLogoAction(_prevState: MediaState, formData: FormData): Promise<MediaState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Válassz egy képet." };
  }

  const supabase = await createClient();
  const { error, url } = await uploadProviderMedia(supabase, user.id, file, "logo");
  if (error || !url) return { status: "error", message: error ?? "Hiba történt a feltöltés során." };

  const { error: dbError } = await supabase.from("providers").update({ logo_url: url }).eq("id", user.id);
  if (dbError) return { status: "error", message: "Hiba történt a mentés során." };

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Logó frissítve." };
}

export async function updateCoverAction(_prevState: MediaState, formData: FormData): Promise<MediaState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Válassz egy képet." };
  }

  const supabase = await createClient();
  const { error, url } = await uploadProviderMedia(supabase, user.id, file, "cover");
  if (error || !url) return { status: "error", message: error ?? "Hiba történt a feltöltés során." };

  const { error: dbError } = await supabase.from("providers").update({ cover_url: url }).eq("id", user.id);
  if (dbError) return { status: "error", message: "Hiba történt a mentés során." };

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Borítókép frissítve." };
}

export type ServiceState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function addServiceAction(
  _prevState: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceHuf = Number(formData.get("price_huf"));
  const durationMinutes = Number(formData.get("duration_minutes"));

  if (!name || !Number.isFinite(priceHuf) || priceHuf < 0 || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { status: "error", message: "Add meg helyesen a nevet, az árat és az időtartamot." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("provider_services").insert({
    provider_id: user.id,
    name,
    description: description || null,
    price_huf: Math.round(priceHuf),
    duration_minutes: Math.round(durationMinutes),
  });

  if (error) {
    return { status: "error", message: `Hiba történt a mentés során (${error.message}).` };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Szolgáltatás hozzáadva." };
}

export async function updateServiceAction(
  _prevState: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const active = formData.get("active") === "on";
  const priceHuf = Number(formData.get("price_huf"));
  const durationMinutes = Number(formData.get("duration_minutes"));

  if (!id || !name || !Number.isFinite(priceHuf) || priceHuf < 0 || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { status: "error", message: "Add meg helyesen a nevet, az árat és az időtartamot." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("provider_services")
    .update({
      name,
      description: description || null,
      active,
      price_huf: Math.round(priceHuf),
      duration_minutes: Math.round(durationMinutes),
    })
    .eq("id", id)
    .eq("provider_id", user.id);

  if (error) {
    return { status: "error", message: `Hiba történt a mentés során (${error.message}).` };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Mentve." };
}

export async function deleteServiceAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("provider_services").delete().eq("id", id).eq("provider_id", user.id);

  revalidatePath("/dashboard", "layout");
}

export type AvailabilityState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function updateAvailabilityAction(
  _prevState: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const rows: { provider_id: string; weekday: number; start_time: string; end_time: string }[] = [];

  for (let weekday = 1; weekday <= 7; weekday++) {
    const enabled = formData.get(`day_${weekday}_enabled`) === "on";
    if (!enabled) continue;

    const start = String(formData.get(`day_${weekday}_start`) ?? "");
    const end = String(formData.get(`day_${weekday}_end`) ?? "");
    if (!start || !end || start >= end) {
      return { status: "error", message: "A záró időpontnak minden napon a nyitó után kell lennie." };
    }
    rows.push({ provider_id: user.id, weekday, start_time: start, end_time: end });
  }

  const supabase = await createClient();

  // Teljes csere: a nyitvatartásnak nincs a UI-n stabil azonosítója
  // naponta — egyszerűbb és biztonságosabb törölni, majd újra beszúrni.
  const { error: deleteError } = await supabase
    .from("provider_availability")
    .delete()
    .eq("provider_id", user.id);
  if (deleteError) {
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("provider_availability").insert(rows);
    if (insertError) {
      return { status: "error", message: "Hiba történt a mentés során." };
    }
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Nyitvatartás mentve." };
}

export type BufferState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function updateBufferAction(
  _prevState: BufferState,
  formData: FormData
): Promise<BufferState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const bufferMinutes = Number(formData.get("buffer_minutes"));
  if (!Number.isFinite(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 180) {
    return { status: "error", message: "Érvénytelen szünet-hossz." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("providers")
    .update({ buffer_minutes: Math.round(bufferMinutes) })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: `Hiba történt a mentés során (${error.message}).` };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Szünet mentve." };
}

export type BookingLinkState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function updateBookingLinkAction(
  _prevState: BookingLinkState,
  formData: FormData
): Promise<BookingLinkState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const bookingEnabled = formData.get("booking_enabled") === "on";

  if (!SLUG_RE.test(slug)) {
    return {
      status: "error",
      message: "A link csak kisbetűt, számot és kötőjelet tartalmazhat (pl. anna-nails-studio).",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("providers")
    .update({ slug, booking_enabled: bookingEnabled })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: "Ez a link már foglalt — válassz másikat." };
    }
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Mentve." };
}

export async function cancelBookingAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id).eq("provider_id", user.id);

  revalidatePath("/dashboard", "layout");
}

export type ManualBookingState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const MANUAL_BOOKING_ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "A név és telefonszám megadása kötelező.",
  provider_not_found: "Nincs bejelentkezve.",
  service_not_found: "Érvénytelen szolgáltatás.",
  in_past: "Múltbeli időpontra nem lehet foglalni.",
  outside_hours: "Ez az időpont kívül esik a nyitvatartáson.",
  slot_taken: "Ezt az időpontot időközben lefoglalták.",
};

export async function createManualBookingAction(
  _prevState: ManualBookingState,
  formData: FormData
): Promise<ManualBookingState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const serviceId = String(formData.get("service_id") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim();

  if (!serviceId || !startsAt) {
    return { status: "error", message: "Válassz szolgáltatást és időpontot." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_manual_booking", {
    p_service_id: serviceId,
    p_starts_at: startsAt,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_email: customerEmail || null,
  });

  if (error) {
    return { status: "error", message: "Hiba történt a foglalás felvétele során." };
  }

  const result = data as CreateBookingResult;
  if (!result.ok) {
    return { status: "error", message: MANUAL_BOOKING_ERROR_MESSAGES[result.error] ?? "Hiba történt." };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Foglalás felvéve." };
}
