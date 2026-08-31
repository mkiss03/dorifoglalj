"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getUser, createClient } from "@/lib/supabase/server";
import { flattenContent } from "@/lib/content/resolve";
import type { SiteContent } from "@/lib/content/types";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;

  return { user, supabase };
}

const MEDIA_BUCKET = "site-media";
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

export async function uploadSiteImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const ctx = await requireAdmin();
  if (!ctx) return { error: "Nincs jogosultságod ehhez." };

  const file = formData.get("file");
  const contentKey = String(formData.get("content_key") ?? "asset");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Válassz egy képet." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Csak kép tölthető fel (PNG, JPG vagy WebP)." };
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return { error: "A kép mérete legfeljebb 5 MB lehet." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${contentKey.replace(/\./g, "-")}-${Date.now()}.${ext}`;

  const { error: uploadError } = await ctx.supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Hiba történt a feltöltés során." };
  }

  const { data } = ctx.supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export type SaveContentState = { status: "idle" | "success" | "error"; message?: string };

export async function saveSiteContentAction(payload: SiteContent): Promise<SaveContentState> {
  const ctx = await requireAdmin();
  if (!ctx) return { status: "error", message: "Nincs jogosultságod ehhez." };

  const rows = flattenContent(payload).map((r) => ({
    key: r.key,
    value: r.value,
    updated_by: ctx.user.id,
  }));

  const { error } = await ctx.supabase.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) {
    return { status: "error", message: `Hiba történt a mentés során (${error.message}).` };
  }

  revalidateTag("site-content", "max");
  revalidatePath("/", "layout");

  return { status: "success", message: "Elmentve, a változtatások élesben is látszanak." };
}
