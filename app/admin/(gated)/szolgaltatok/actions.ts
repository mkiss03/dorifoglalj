"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setProviderStatusAction(formData: FormData) {
  const providerId = String(formData.get("provider_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!providerId || !status) return;

  const supabase = await createClient();
  await supabase.rpc("admin_set_provider_status", { p_provider_id: providerId, p_status: status });

  revalidatePath("/admin/szolgaltatok");
}
