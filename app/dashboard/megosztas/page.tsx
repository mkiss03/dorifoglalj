import { headers } from "next/headers";
import QRCode from "qrcode";
import { getUser, createClient } from "@/lib/supabase/server";
import type { Provider } from "@/lib/supabase/types";
import { BookingLinkCard } from "../BookingLinkCard";

export default async function DashboardSharingPage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data: provider } = await supabase.from("providers").select("*").eq("id", user!.id).single();
  const typedProvider = provider as Provider | null;

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const siteUrl = `${protocol}://${host}`;

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Megosztás</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
        Ez a saját, brandelt foglalási oldalad — nemcsak új érdeklődőknek szól: a{" "}
        <span className="font-semibold text-ink">meglévő, visszatérő vendégeid</span> is nyugodtan
        ezen keresztül foglalhatnak új időpontot, anélkül hogy fel kellene hívniuk vagy üzenniük
        neked munka közben. Küldd ki egyszer a linket vagy a QR-kódot, utána a naptáradban
        automatikusan megjelenik minden foglalásuk.
      </p>

      <div className="mt-6">
        {typedProvider ? (
          <BookingLinkCard
            provider={typedProvider}
            siteUrl={siteUrl}
            qrDataUrl={await QRCode.toDataURL(`${siteUrl}/foglalas/${typedProvider.slug}`, { margin: 1, width: 480 })}
          />
        ) : (
          <p className="text-sm text-ink-soft">A profilod betöltése után itt jelenik meg a foglalási linked.</p>
        )}
      </div>
    </section>
  );
}
