"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTrustedSiteUrl } from "@/lib/site-url";
import { sendProviderApprovedEmail } from "@/lib/email/sendProviderApprovedEmail";
import type { AdminProviderRow, AdminSetProviderStatusResult } from "@/lib/supabase/types";

export async function setProviderStatusAction(formData: FormData) {
  const providerId = String(formData.get("provider_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!providerId || !status) return;

  const supabase = await createClient();

  // A régi státusz és az e-mail cím a változtatás ELŐTT kell — csak a
  // tényleges "jóváhagyásra vár → aktív" váltásról megy értesítő.
  const { data: rows } = await supabase.rpc("admin_list_providers");
  const before = ((rows ?? []) as AdminProviderRow[]).find((p) => p.id === providerId);

  const { data } = await supabase.rpc("admin_set_provider_status", { p_provider_id: providerId, p_status: status });
  const result = data as AdminSetProviderStatusResult | null;

  if (result?.ok && status === "active" && before?.status === "pending" && before.email) {
    try {
      await sendProviderApprovedEmail({
        to: before.email,
        businessName: before.business_name,
        slug: before.slug,
        siteUrl: await getTrustedSiteUrl(),
      });
    } catch {
      // szándékosan elnyelve — a jóváhagyás e-mail nélkül is megtörtént
    }
  }

  revalidatePath("/admin/szolgaltatok");
}
