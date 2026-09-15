import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { AdminMonitoringStats } from "@/lib/supabase/types";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Database,
  ExternalLink,
  Eye,
  HardDrive,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";

// Supabase Free Tier referencia határok. Ha a Supabase módosítja a
// csomagjait, ezeket az értékeket kell frissíteni.
const SUPABASE_FREE_DB_ROWS_LIMIT = 500_000; // tájékoztató becslés a ~500 MB DB-mérethez
const SUPABASE_FREE_STORAGE_BYTES_LIMIT = 1_073_741_824; // 1 GB
const SUPABASE_FREE_MAU_LIMIT = 50_000; // havi aktív felhasználó

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

type Severity = "ok" | "warning" | "critical";

function severityFromPercent(percent: number): Severity {
  if (percent >= 90) return "critical";
  if (percent >= 70) return "warning";
  return "ok";
}

const SEVERITY_BAR_CLASS: Record<Severity, string> = {
  ok: "bg-emerald-600",
  warning: "bg-amber-500",
  critical: "bg-red-600",
};

function CapacityBar({ percent, label, detail }: { percent: number; label: string; detail: string }) {
  const boundedPercent = Math.min(100, Math.max(0, percent));
  const severity = severityFromPercent(boundedPercent);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-semibold tabular-nums text-ink-soft">
          {detail} ({boundedPercent.toFixed(1)}%)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-paper-alt">
        <div
          className={`h-full transition-all duration-500 ${SEVERITY_BAR_CLASS[severity]}`}
          style={{ width: `${boundedPercent}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <div className="flex items-center gap-3 text-ink-soft">
        <Icon className="h-5 w-5 text-accent-dark" strokeWidth={2} />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      {detail && <p className="mt-2 text-xs text-ink-soft">{detail}</p>}
    </div>
  );
}

export default async function AdminMonitoringPage() {
  const supabase = await createClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_get_monitoring_stats");

  // Nincs csendes fallback: ha az RPC (schema_v15.sql) nincs lefuttatva
  // vagy hibázik, ezt nyíltan jelezzük ahelyett, hogy hamis nullákat mutatnánk.
  if (rpcError || !rpcData) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Kapacitás & Monitor</h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            Élő statisztikák a Supabase adatbázisról, tárhelyről és a forgalomról.
          </p>
        </div>
        <div className="shadow-sheet flex items-start gap-4 rounded-3xl bg-white p-6 sm:p-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <TriangleAlert className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="font-display text-lg text-ink">A monitorozó adatok jelenleg nem elérhetők</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Az <code className="rounded bg-paper-alt px-1.5 py-0.5 text-[13px]">admin_get_monitoring_stats</code>{" "}
              adatbázis-függvény nem található vagy hibázott. Futtasd le a{" "}
              <code className="rounded bg-paper-alt px-1.5 py-0.5 text-[13px]">supabase/schema_v15.sql</code> fájlt a
              Supabase SQL Editorban, majd frissítsd az oldalt (ha közvetlenül a futtatás után látod ezt az üzenetet,
              várj 10–20 másodpercet, amíg a Supabase API-réteg felismeri az új függvényt).
            </p>
            {rpcError && (
              <p className="mt-3 rounded-2xl bg-paper-alt p-3 font-mono text-xs text-ink-soft">{rpcError.message}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const stats = rpcData as AdminMonitoringStats;

  const dbUsagePercent = (stats.total_db_rows / SUPABASE_FREE_DB_ROWS_LIMIT) * 100;
  const storageUsagePercent = (stats.media_bytes_estimated / SUPABASE_FREE_STORAGE_BYTES_LIMIT) * 100;
  const mauUsagePercent = (stats.total_users / SUPABASE_FREE_MAU_LIMIT) * 100;
  const maxUsagePercent = Math.max(dbUsagePercent, storageUsagePercent, mauUsagePercent);
  const overallSeverity = severityFromPercent(maxUsagePercent);

  const SEVERITY_ICON = {
    ok: CheckCircle2,
    warning: AlertTriangle,
    critical: TriangleAlert,
  } as const;
  const SEVERITY_ICON_CLASS: Record<Severity, string> = {
    ok: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    critical: "bg-red-100 text-red-700",
  };
  const SEVERITY_LABEL: Record<Severity, string> = {
    ok: "A kapacitás megfelelő",
    warning: "Közeledünk az ingyenes csomag korlátaihoz",
    critical: "Az ingyenes csomag korlátai közelében vagyunk, bővítés szükséges",
  };
  const OverallIcon = SEVERITY_ICON[overallSeverity];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Kapacitás & Monitor</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Élő statisztikák a Supabase adatbázisról, tárhelyről és a forgalomról, az ingyenes (Free Tier) korlátok
          tükrében.
        </p>
      </div>

      <div className="shadow-sheet rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${SEVERITY_ICON_CLASS[overallSeverity]}`}>
            <OverallIcon className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="font-display text-xl text-ink">{SEVERITY_LABEL[overallSeverity]}</h2>
            <p className="text-sm text-ink-soft">
              Legmagasabb kihasználtság: <strong>{maxUsagePercent.toFixed(1)}%</strong>
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <CapacityBar
            label="Adatbázis sormennyiség"
            detail={`${stats.total_db_rows.toLocaleString("hu-HU")} sor`}
            percent={dbUsagePercent}
          />
          <CapacityBar
            label="Média tárhely"
            detail={`${formatBytes(stats.media_bytes_estimated)} / 1 GB`}
            percent={storageUsagePercent}
          />
          <CapacityBar
            label="Felhasználói fiókok (MAU)"
            detail={`${stats.total_users.toLocaleString("hu-HU")} / 50 000`}
            percent={mauUsagePercent}
          />
        </div>

        {overallSeverity !== "ok" && (
          <p className="mt-6 rounded-2xl bg-paper-alt p-4 text-sm leading-relaxed text-ink-soft">
            Ha ez a kihasználtsági szint tartósan fennáll, érdemes megfontolni a Supabase Pro csomagra váltást, illetve
            elkezdeni tervezni az ingyenes időszak lezárását. Lásd lentebb az irányelveket.
          </p>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl text-ink">Platform-statisztikák</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Szolgáltatók"
            value={stats.total_providers}
            detail={`${stats.active_providers} aktív · ${stats.pending_providers} jóváhagyásra vár · ${stats.suspended_providers} felfüggesztve`}
          />
          <StatCard
            icon={Calendar}
            label="Foglalások"
            value={stats.total_bookings}
            detail={`${stats.month_bookings} ebben a hónapban · ${stats.week_bookings} az elmúlt 7 napban`}
          />
          <StatCard
            icon={Database}
            label="Szolgáltatások & munkatársak"
            value={stats.total_services}
            detail={`${stats.total_staff} aktív munkatárs`}
          />
          <StatCard
            icon={HardDrive}
            label="Feltöltött média"
            value={`${stats.media_files_count} fájl`}
            detail={formatBytes(stats.media_bytes_estimated)}
          />
        </div>
      </div>

      <div className="shadow-sheet rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-accent-dark" strokeWidth={2.25} />
          <h2 className="font-display text-xl text-ink">Oldal-látogatottság</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Eye} label="Oldalmegtekintés ma" value={stats.today_page_views.toLocaleString("hu-HU")} />
          <StatCard
            icon={Eye}
            label="Oldalmegtekintés (7 nap)"
            value={stats.week_page_views.toLocaleString("hu-HU")}
          />
          <StatCard icon={Eye} label="Összes oldalmegtekintés" value={stats.total_page_views.toLocaleString("hu-HU")} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          Ez a saját, durva számláló minden nyilvános oldalbetöltést számol (nem egyedi látogatót — sem cookie,
          sem azonosító nem tárolódik hozzá), így ugyanaz a vendég több oldalmegtekintést is adhat egy látogatás
          alatt.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          A részletesebb forgalmi adatokat (egyedi látogatók, forgalmi források, eszköztípusok) a Vercel Web
          Analytics méri. Ez a szolgáltatás <strong>cookie-mentes és nem használ egyedi azonosítót</strong> a
          látogatók követésére, így a jelenlegi magyar adatvédelmi (GDPR / Infotv.) értelmezés szerint nem igényel
          sütiengedélyező (cookie consent) felugró ablakot. A részletes, napi bontású grafikonok a Vercel saját
          irányítópultján érhetők el.
        </p>
        <Link
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90"
        >
          Megnyitás a Vercel irányítópulton
          <ExternalLink className="h-4 w-4" strokeWidth={2.25} />
        </Link>
      </div>

      <div className="shadow-sheet space-y-6 rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-accent-dark" strokeWidth={2.25} />
          <h2 className="font-display text-xl text-ink">Ingyenes → fizetős átállás irányelvei</h2>
        </div>

        <div className="grid gap-6 text-sm leading-relaxed text-ink-soft md:grid-cols-2">
          <div className="space-y-2 rounded-2xl bg-paper-alt p-5">
            <h3 className="font-display text-base text-ink">Mikor váltsunk fizetős csomagra?</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>A fenti kapacitás-sávok bármelyike eléri a 90%-ot (kritikus jelzés).</li>
              <li>Az aktív szolgáltatók száma eléri a 15–20 főt, vagy a havi foglalások száma a 200-at.</li>
            </ul>
          </div>
          <div className="space-y-2 rounded-2xl bg-paper-alt p-5">
            <h3 className="font-display text-base text-ink">Mi legyen a korai regisztrálókkal?</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Alapító szolgáltató kedvezmény:</strong> az induló időszakban regisztrált szolgáltatóknak
                fix ideig (pl. 12 hónap) vagy véglegesen megtartott ingyenes hozzáférés.
              </li>
              <li>
                <strong>Freemium modell:</strong> az alapfunkciók ingyenesek maradnak mindenkinek, a bővített
                funkciók (pl. több munkatárs, kiemelt megjelenés) válnak fizetőssé.
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-ink-soft">
          Jogi szempontból az ÁSZF-ben rögzíteni kell, hogy az induló időszak díjmentes, és a díjszabás
          bevezetéséről a meglévő szolgáltatókat előzetesen (jellemzően legalább 30 nappal korábban) e-mailben
          értesíteni kell, lehetőséget biztosítva a leiratkozásra vagy az ingyenes alapcsomagra való átállásra.
        </p>
      </div>
    </section>
  );
}
