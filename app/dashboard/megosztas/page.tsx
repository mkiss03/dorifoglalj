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
      <p className="mt-2 text-[15px] text-ink-soft">
        Oszd meg ezt a linket az ügyfeleiddel — regisztráció nélkül tudnak nálad időpontot foglalni.
      </p>

      <div className="mt-6">
        {typedProvider ? (
          <BookingLinkCard
            provider={typedProvider}
            siteUrl={siteUrl}
            qrDataUrl={await QRCode.toDataURL(`${siteUrl}/foglalas/${typedProvider.slug}`, { margin: 1, width: 240 })}
          />
        ) : (
          <p className="text-sm text-ink-soft">A profilod betöltése után itt jelenik meg a foglalási linked.</p>
        )}
      </div>
    </section>
  );
}
