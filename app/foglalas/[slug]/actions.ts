"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreateBookingResult } from "@/lib/supabase/types";

export type BookingFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  result?: Extract<CreateBookingResult, { ok: true }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Add meg a neved és a telefonszámod.",
  provider_not_found: "Ez a foglalási oldal jelenleg nem elérhető.",
  service_not_found: "Ez a szolgáltatás nem található.",
  staff_not_found: "Ez a munkatárs nem érhető el.",
  staff_not_eligible: "Ez a munkatárs nem végzi ezt a szolgáltatást.",
  in_past: "Ez az időpont már elmúlt — válassz másikat.",
  outside_hours: "Ez az időpont már nem elérhető — válassz másikat.",
  slot_blocked: "Ez az időpont már nem elérhető — válassz másikat.",
  slot_taken: "Sajnos ezt az időpontot közben lefoglalták — válassz másikat.",
};

export async function createBookingAction(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const slug = String(formData.get("slug") ?? "");
  const serviceId = String(formData.get("service_id") ?? "");
  const staffId = String(formData.get("staff_id") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const holdToken = String(formData.get("hold_token") ?? "").trim();
  const name = String(formData.get("customer_name") ?? "").trim();
  const phone = String(formData.get("customer_phone") ?? "").trim();
  const email = String(formData.get("customer_email") ?? "").trim();

  if (!slug || !serviceId || !staffId || !startsAt) {
    return { status: "error", message: "Hiányzó adatok — próbáld újra az elejétől." };
  }
  if (!name || !phone) {
    return { status: "error", message: "A név és a telefonszám megadása kötelező." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_slug: slug,
    p_service_id: serviceId,
    p_staff_id: staffId,
    p_starts_at: startsAt,
    p_customer_name: name,
    p_customer_phone: phone,
    p_customer_email: email || null,
    p_hold_token: holdToken || null,
  });

  if (error) {
    return { status: "error", message: "Hiba történt a foglalás során. Próbáld újra." };
  }

  const result = data as CreateBookingResult;
  if (!result.ok) {
    return { status: "error", message: ERROR_MESSAGES[result.error] ?? "Nem sikerült a foglalás." };
  }

  return { status: "success", result };
}
