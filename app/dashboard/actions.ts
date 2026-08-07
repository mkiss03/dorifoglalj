"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { PROVIDER_TAGS, type CreateBookingResult, type ProviderTag } from "@/lib/supabase/types";
import { sendCancellationEmail } from "@/lib/email/sendCancellationEmail";

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
  const tags = formData.getAll("tags").filter((t): t is ProviderTag => PROVIDER_TAGS.includes(t as ProviderTag));

  if (!businessName) {
    return { status: "error", message: "A vállalkozás neve kötelező." };
  }
  if (category && !categorySlugs.has(category)) {
    return { status: "error", message: "Érvénytelen kategória." };
  }
  if (city && !cityNames.has(city)) {
    return { status: "error", message: "Érvénytelen település." };
  }
  if (tags.length === 0) {
    return { status: "error", message: "Válassz legalább egy alkalmat, amire vállalsz munkát." };
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
      tags,
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
  pathSuffix: string
): Promise<{ error?: string; url?: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Csak kép tölthető fel (PNG, JPG vagy WebP)." };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { error: "A kép mérete legfeljebb 5 MB lehet." };
  }

  const path = `${userId}/${pathSuffix}`;
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

  const staffId = String(formData.get("staff_id") ?? "");
  if (!staffId) return { status: "error", message: "Hiányzó munkatárs." };

  const rows: { provider_id: string; staff_id: string; weekday: number; start_time: string; end_time: string }[] = [];

  for (let weekday = 1; weekday <= 7; weekday++) {
    const enabled = formData.get(`day_${weekday}_enabled`) === "on";
    if (!enabled) continue;

    const start = String(formData.get(`day_${weekday}_start`) ?? "");
    const end = String(formData.get(`day_${weekday}_end`) ?? "");
    if (!start || !end || start >= end) {
      return { status: "error", message: "A záró időpontnak minden napon a nyitó után kell lennie." };
    }
    rows.push({ provider_id: user.id, staff_id: staffId, weekday, start_time: start, end_time: end });
  }

  const supabase = await createClient();

  // Teljes csere: a nyitvatartásnak nincs a UI-n stabil azonosítója
  // naponta — egyszerűbb és biztonságosabb törölni, majd újra beszúrni.
  // Kizárólag a kiválasztott munkatárs sorait érinti — a többi
  // munkatárs nyitvatartása nem törlődik.
  const { error: deleteError } = await supabase
    .from("provider_availability")
    .delete()
    .eq("provider_id", user.id)
    .eq("staff_id", staffId);
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

export type BlockState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Egy ISO timestamp budapesti helyi dátuma ("YYYY-MM-DD") és a napon belüli perce. */
function budapestDateTimeParts(iso: string): { date: string; minutes: number } {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  const [h, m] = time.split(":").map(Number);
  return { date, minutes: h * 60 + m };
}

export async function addBlockAction(_prevState: BlockState, formData: FormData): Promise<BlockState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const blockDate = String(formData.get("block_date") ?? "");
  const allDay = formData.get("all_day") === "on";
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const allStaff = formData.get("all_staff") === "on";
  const staffId = String(formData.get("staff_id") ?? "");

  if (!blockDate || !/^\d{4}-\d{2}-\d{2}$/.test(blockDate)) {
    return { status: "error", message: "Add meg a dátumot." };
  }
  if (!allDay && (!startTime || !endTime || startTime >= endTime)) {
    return { status: "error", message: "A záró időpontnak a kezdő után kell lennie." };
  }
  if (!allStaff && !staffId) {
    return { status: "error", message: "Hiányzó munkatárs." };
  }

  const supabase = await createClient();

  let staffIds: string[];
  if (allStaff) {
    const { data: staff } = await supabase
      .from("staff_members")
      .select("id")
      .eq("provider_id", user.id)
      .eq("active", true);
    staffIds = (staff ?? []).map((s) => s.id);
    if (staffIds.length === 0) {
      return { status: "error", message: "Nincs aktív munkatárs." };
    }
  } else {
    staffIds = [staffId];
  }

  const { error } = await supabase.from("provider_blocks").insert(
    staffIds.map((sid) => ({
      provider_id: user.id,
      staff_id: sid,
      block_date: blockDate,
      start_time: allDay ? null : startTime,
      end_time: allDay ? null : endTime,
      note: note || null,
    }))
  );

  if (error) {
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  // Tájékoztató figyelmeztetés, ha a kizárás átfed egy már visszaigazolt
  // foglalással (bármelyik érintett munkatársnál) — nem blokkoljuk, csak
  // jelezzük, hogy egyeztetni kell.
  const blockStartMin = allDay ? 0 : toMinutes(startTime);
  const blockEndMin = allDay ? 24 * 60 : toMinutes(endTime);
  const windowStart = new Date(`${blockDate}T00:00:00Z`);
  windowStart.setUTCDate(windowStart.getUTCDate() - 1);
  const windowEnd = new Date(`${blockDate}T00:00:00Z`);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 2);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("starts_at, ends_at")
    .in("staff_id", staffIds)
    .eq("status", "confirmed")
    .gte("starts_at", windowStart.toISOString())
    .lt("starts_at", windowEnd.toISOString());

  const hasOverlap = (bookings ?? []).some((b) => {
    const s = budapestDateTimeParts(b.starts_at);
    const e = budapestDateTimeParts(b.ends_at);
    if (s.date !== blockDate) return false;
    return s.minutes < blockEndMin && e.minutes > blockStartMin;
  });

  revalidatePath("/dashboard", "layout");
  return {
    status: "success",
    message: hasOverlap
      ? "Kizárás mentve. Figyelem: erre az időszakra már van visszaigazolt foglalás — érdemes egyeztetni a vendéggel."
      : "Kizárás mentve.",
  };
}

export async function deleteBlockAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("provider_blocks").delete().eq("id", id).eq("provider_id", user.id);

  revalidatePath("/dashboard", "layout");
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

export type CancelBookingState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

export async function cancelBookingAction(
  _prevState: CancelBookingState,
  formData: FormData
): Promise<CancelBookingState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return { status: "error", message: "Hiányzó foglalás." };

  const supabase = await createClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, customer_name, customer_email, service_name, starts_at, status")
    .eq("id", id)
    .eq("provider_id", user.id)
    .single();

  if (fetchError || !booking) {
    return { status: "error", message: "A foglalás nem található." };
  }
  if (booking.status === "cancelled") {
    return { status: "error", message: "Ez a foglalás már le van mondva." };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("provider_id", user.id);

  if (updateError) {
    return { status: "error", message: "Hiba történt a lemondás során." };
  }

  revalidatePath("/dashboard", "layout");

  if (!booking.customer_email) {
    return {
      status: "success",
      message: "Foglalás lemondva. A vendégnek nincs email címe rögzítve — érdemes telefonon is értesíteni.",
    };
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("business_name, phone")
    .eq("id", user.id)
    .single();

  const emailResult = await sendCancellationEmail({
    to: booking.customer_email,
    customerName: booking.customer_name,
    providerName: provider?.business_name ?? "a szolgáltató",
    providerPhone: provider?.phone ?? null,
    serviceName: booking.service_name,
    startsAt: booking.starts_at,
    reason: reason || null,
  });

  if (!emailResult.ok) {
    const detail =
      emailResult.error === "missing_api_key" ? "az email-küldés nincs beállítva" : "az email küldése nem sikerült";
    return {
      status: "success",
      message: `Foglalás lemondva. Az értesítő emailt nem sikerült elküldeni (${detail}) — érdemes telefonon is szólni a vendégnek.`,
    };
  }

  return { status: "success", message: "Foglalás lemondva, a vendég emailben értesítve." };
}

export type ManualBookingState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const MANUAL_BOOKING_ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "A név és telefonszám megadása kötelező.",
  provider_not_found: "Nincs bejelentkezve.",
  service_not_found: "Érvénytelen szolgáltatás.",
  staff_not_found: "Érvénytelen munkatárs.",
  staff_not_eligible: "Ez a munkatárs nem végzi ezt a szolgáltatást.",
  in_past: "Múltbeli időpontra nem lehet foglalni.",
  outside_hours: "Ez az időpont kívül esik a nyitvatartáson.",
  slot_blocked: "Ez az időpont ki van zárva (lásd a Nyitvatartás oldal kivételei között).",
  slot_taken: "Ezt az időpontot időközben lefoglalták.",
};

export async function createManualBookingAction(
  _prevState: ManualBookingState,
  formData: FormData
): Promise<ManualBookingState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const serviceId = String(formData.get("service_id") ?? "");
  const staffId = String(formData.get("staff_id") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim();

  if (!serviceId || !staffId || !startsAt) {
    return { status: "error", message: "Válassz munkatársat, szolgáltatást és időpontot." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_manual_booking", {
    p_service_id: serviceId,
    p_staff_id: staffId,
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

export type StaffState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

export async function addStaffAction(_prevState: StaffState, formData: FormData): Promise<StaffState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const serviceIds = formData.getAll("service_ids").map(String).filter(Boolean);

  if (!name) {
    return { status: "error", message: "A név megadása kötelező." };
  }

  const supabase = await createClient();
  const { data: staff, error } = await supabase
    .from("staff_members")
    .insert({ provider_id: user.id, name, specialty: specialty || null })
    .select("id")
    .single();

  if (error || !staff) {
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  if (serviceIds.length > 0) {
    const { error: linkError } = await supabase
      .from("staff_services")
      .insert(serviceIds.map((serviceId) => ({ staff_id: staff.id, service_id: serviceId, provider_id: user.id })));
    if (linkError) {
      return { status: "error", message: "A munkatárs mentve, de a szolgáltatások hozzárendelése nem sikerült." };
    }
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Munkatárs hozzáadva." };
}

export async function updateStaffAction(_prevState: StaffState, formData: FormData): Promise<StaffState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const active = formData.get("active") === "on";
  const serviceIds = formData.getAll("service_ids").map(String).filter(Boolean);

  if (!id || !name) {
    return { status: "error", message: "A név megadása kötelező." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_members")
    .update({ name, specialty: specialty || null, active })
    .eq("id", id)
    .eq("provider_id", user.id);

  if (error) {
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  // Teljes csere a hozzárendelt szolgáltatásoknál — egyszerűbb, mint diffelni.
  const { error: deleteError } = await supabase
    .from("staff_services")
    .delete()
    .eq("staff_id", id)
    .eq("provider_id", user.id);
  if (deleteError) {
    return { status: "error", message: "Hiba történt a szolgáltatások mentése során." };
  }

  if (serviceIds.length > 0) {
    const { error: insertError } = await supabase
      .from("staff_services")
      .insert(serviceIds.map((serviceId) => ({ staff_id: id, service_id: serviceId, provider_id: user.id })));
    if (insertError) {
      return { status: "error", message: "Hiba történt a szolgáltatások mentése során." };
    }
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Mentve." };
}

export async function deleteStaffAction(_prevState: StaffState, formData: FormData): Promise<StaffState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Hiányzó munkatárs." };

  const supabase = await createClient();

  const { count: totalStaff } = await supabase
    .from("staff_members")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", user.id);

  if ((totalStaff ?? 0) <= 1) {
    return { status: "error", message: "Legalább egy munkatársnak lennie kell — inaktiváld törlés helyett." };
  }

  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", id)
    .eq("provider_id", user.id);

  if ((bookingCount ?? 0) > 0) {
    return {
      status: "error",
      message: "Ennek a munkatársnak már volt foglalása — törlés helyett inaktiváld.",
    };
  }

  const { error } = await supabase.from("staff_members").delete().eq("id", id).eq("provider_id", user.id);
  if (error) {
    return { status: "error", message: "Hiba történt a törlés során." };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Munkatárs törölve." };
}

export async function updateStaffPhotoAction(_prevState: MediaState, formData: FormData): Promise<MediaState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const staffId = String(formData.get("staff_id") ?? "");
  const file = formData.get("photo");
  if (!staffId) return { status: "error", message: "Hiányzó munkatárs." };
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Válassz egy képet." };
  }

  const supabase = await createClient();
  const { error, url } = await uploadProviderMedia(supabase, user.id, file, `staff/${staffId}`);
  if (error || !url) return { status: "error", message: error ?? "Hiba történt a feltöltés során." };

  const { error: dbError } = await supabase
    .from("staff_members")
    .update({ photo_url: url })
    .eq("id", staffId)
    .eq("provider_id", user.id);
  if (dbError) return { status: "error", message: "Hiba történt a mentés során." };

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Fotó frissítve." };
}
