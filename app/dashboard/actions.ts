"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";

export type ProfileState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const categorySlugs = new Set(categories.map((c) => c.slug));
const cityNames = new Set(cities);

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Nincs bejelentkezve." };

  const businessName = String(formData.get("business_name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

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
      phone: phone || null,
      description: description || null,
    })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: "Hiba történt a mentés során." };
  }

  revalidatePath("/dashboard");
  return { status: "success", message: "Profil mentve." };
}

export async function addServiceAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  const priceHuf = Number(formData.get("price_huf"));
  const durationMinutes = Number(formData.get("duration_minutes"));

  if (!name || !Number.isFinite(priceHuf) || priceHuf < 0 || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("provider_services").insert({
    provider_id: user.id,
    name,
    price_huf: Math.round(priceHuf),
    duration_minutes: Math.round(durationMinutes),
  });

  revalidatePath("/dashboard");
}

export async function updateServiceAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const priceHuf = Number(formData.get("price_huf"));
  const durationMinutes = Number(formData.get("duration_minutes"));

  if (!id || !name || !Number.isFinite(priceHuf) || priceHuf < 0 || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("provider_services")
    .update({
      name,
      price_huf: Math.round(priceHuf),
      duration_minutes: Math.round(durationMinutes),
    })
    .eq("id", id)
    .eq("provider_id", user.id);

  revalidatePath("/dashboard");
}

export async function deleteServiceAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("provider_services").delete().eq("id", id).eq("provider_id", user.id);

  revalidatePath("/dashboard");
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

  revalidatePath("/dashboard");
  return { status: "success", message: "Nyitvatartás mentve." };
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

  revalidatePath("/dashboard");
  return { status: "success", message: "Mentve." };
}

export async function cancelBookingAction(formData: FormData) {
  const user = await getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id).eq("provider_id", user.id);

  revalidatePath("/dashboard");
}
