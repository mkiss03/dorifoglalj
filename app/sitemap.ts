import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://idopontneked.hu";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kereses`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/regisztracio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bejelentkezes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/aszf`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/adatkezeles`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/impresszum`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  let providerRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicClient();
    const { data: providers } = await supabase
      .from("providers")
      .select("slug, updated_at")
      .eq("status", "active")
      .eq("booking_enabled", true)
      .not("slug", "is", null);

    if (providers) {
      providerRoutes = providers.map((p) => ({
        url: `${baseUrl}/foglalas/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "daily",
        priority: 0.8,
      }));
    }
  } catch {
    // Supabase nem elérhető sitemap generáláskor: csak a statikus útvonalak
  }

  return [...staticRoutes, ...providerRoutes];
}
