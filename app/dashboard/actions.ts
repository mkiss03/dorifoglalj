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
