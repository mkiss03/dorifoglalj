import { createClient } from "@/lib/supabase/server";
import type { AdminMonitoringStats } from "@/lib/supabase/types";
import { Activity, AlertTriangle, CheckCircle2, Database, HardDrive, ShieldCheck, Users, Zap } from "lucide-react";

// Supabase & Vercel Free Tier referencia határok
const SUPABASE_FREE_DB_ROWS_LIMIT = 500_000; // kb. 500 MB DB méretnek felel meg
const SUPABASE_FREE_STORAGE_BYTES_LIMIT = 1073741824; // 1 GB in bytes
const SUPABASE_FREE_MAU_LIMIT = 50_000; // 50,000 MAU

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function CapacityBar({ percent, label, detail }: { percent: number; label: string; detail: string }) {
  const boundedPercent = Math.min(100, Math.max(0, percent));
  const barColor =
    boundedPercent >= 90 ? "bg-red-600" : boundedPercent >= 70 ? "bg-amber-500" : "bg-emerald-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-semibold tabular-nums text-ink-soft">{detail} ({boundedPercent.toFixed(1)}%)</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-paper-alt">
        <div className={`h-full transition-all duration-500 ${barColor}`} style={{ width: `${boundedPercent}%` }} />
      </div>
    </div>
  );
}

export default async function AdminMonitoringPage() {
  const supabase = await createClient();
  
  // Próbáljuk meg lekérni a séma szerinti statisztikát, hiba esetén végezzünk közvetlen lekérdezést
  let stats: AdminMonitoringStats;
  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_get_monitoring_stats");

  if (!rpcError && rpcData) {
    stats = rpcData as AdminMonitoringStats;
  } else {
    // Fallback közvetlen lekérdezésekre ha a schema_v15.sql még nem futott le
    const [
      { count: totalProviders },
      { count: pendingProviders },
      { count: activeProviders },
      { count: suspendedProviders },
      { count: totalBookings },
      { count: confirmedBookings },
      { count: totalServices },
      { count: totalStaff },
    ] = await Promise.all([
      supabase.from("providers").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "suspended"),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.from("provider_services").select("*", { count: "exact", head: true }),
      supabase.from("staff_members").select("*", { count: "exact", head: true }),
    ]);

    stats = {
      total_providers: totalProviders ?? 0,
      pending_providers: pendingProviders ?? 0,
      active_providers: activeProviders ?? 0,
      suspended_providers: suspendedProviders ?? 0,
      total_users: totalProviders ?? 0,
      total_services: totalServices ?? 0,
      total_staff: totalStaff ?? 0,
      total_bookings: totalBookings ?? 0,
      confirmed_bookings: confirmedBookings ?? 0,
      month_bookings: totalBookings ?? 0,
      today_bookings: 0,
      unique_customers: 0,
      media_files_count: 0,
      media_bytes_estimated: 0,
      total_db_rows: (totalProviders ?? 0) + (totalServices ?? 0) + (totalStaff ?? 0) + (totalBookings ?? 0),
    };
  }

  // Számított kapacitási százalékok
  const dbUsagePercent = (stats.total_db_rows / SUPABASE_FREE_DB_ROWS_LIMIT) * 100;
  const storageUsagePercent = (stats.media_bytes_estimated / SUPABASE_FREE_STORAGE_BYTES_LIMIT) * 100;
  const mauUsagePercent = (stats.total_users / SUPABASE_FREE_MAU_LIMIT) * 100;

  // Legmagasabb kihasználtsági mutató
  const maxUsagePercent = Math.max(dbUsagePercent, storageUsagePercent, mauUsagePercent);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Kapacitás & Éles Monitor</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Valós idejű statisztikák a Supabase adatbázisról, tárhelyről és az ügyfélállományról az ingyenes korlátok tükrében.
        </p>
      </div>

      {/* Rendszerállapot összefoglaló kártya */}
      <div className="shadow-sheet rounded-3xl bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                maxUsagePercent >= 90
                  ? "bg-red-100 text-red-700"
                  : maxUsagePercent >= 70
                  ? "bg-amber-100 text-amber-900"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {maxUsagePercent >= 90 ? (
                <AlertTriangle className="h-6 w-6" />
              ) : maxUsagePercent >= 70 ? (
                <Activity className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </span>
            <div>
              <h2 className="font-display text-xl text-ink">
                {maxUsagePercent >= 90
                  ? "🔴 Kritikus kapacitás — Bővítés szükséges!"
                  : maxUsagePercent >= 70
                  ? "🟡 Magas kihasználtság — Felkészülés a bővítésre"
                  : "🟢 Rendszerállapot tökéletes (Free Tier)"}
              </h2>
              <p className="text-sm text-ink-soft">
                Legmagasabb erőforrás-kihasználtság: <strong>{maxUsagePercent.toFixed(1)}%</strong>
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-paper-alt px-4 py-3 text-xs text-ink-soft">
            <span>Supabase & Vercel Free Tier keret</span>
          </div>
        </div>

        {/* Kapacitási sávok */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <CapacityBar
            label="Adatbázis sormennyiség"
            detail={`${stats.total_db_rows.toLocaleString("hu-HU")} sor`}
            percent={dbUsagePercent}
          />
          <CapacityBar
            label="Média képtárhely"
            detail={`${formatBytes(stats.media_bytes_estimated)} / 1 GB`}
            percent={storageUsagePercent}
          />
          <CapacityBar
            label="Felhasználói fiókok (MAU)"
            detail={`${stats.total_users} / 50 000`}
            percent={mauUsagePercent}
          />
        </div>
      </div>

      {/* Részletes statisztika kártyák */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="shadow-sheet rounded-3xl bg-white p-6">
          <div className="flex items-center gap-3 text-ink-soft">
            <Users className="h-5 w-5 text-accent-dark" />
            <span className="text-xs font-semibold uppercase tracking-wide">Szolgáltatók</span>
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{stats.total_providers}</p>
          <div className="mt-2 flex gap-2 text-xs font-medium">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-800">{stats.active_providers} aktív</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-900">{stats.pending_providers} függőben</span>
          </div>
        </div>

        <div className="shadow-sheet rounded-3xl bg-white p-6">
          <div className="flex items-center gap-3 text-ink-soft">
            <Zap className="h-5 w-5 text-accent-dark" />
            <span className="text-xs font-semibold uppercase tracking-wide">Foglalások</span>
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{stats.total_bookings}</p>
          <div className="mt-2 flex gap-2 text-xs font-medium">
            <span className="text-ink-soft">{stats.month_bookings} ebben a hónapban</span>
          </div>
        </div>

        <div className="shadow-sheet rounded-3xl bg-white p-6">
          <div className="flex items-center gap-3 text-ink-soft">
            <Database className="h-5 w-5 text-accent-dark" />
            <span className="text-xs font-semibold uppercase tracking-wide">Szolgáltatások & Staff</span>
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{stats.total_services}</p>
          <p className="mt-2 text-xs text-ink-soft">{stats.total_staff} aktív munkatárs</p>
        </div>

        <div className="shadow-sheet rounded-3xl bg-white p-6">
          <div className="flex items-center gap-3 text-ink-soft">
            <HardDrive className="h-5 w-5 text-accent-dark" />
            <span className="text-xs font-semibold uppercase tracking-wide">Feltöltött Média</span>
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{stats.media_files_count} fájl</p>
          <p className="mt-2 text-xs text-ink-soft">{formatBytes(stats.media_bytes_estimated)} összméret</p>
        </div>
      </div>

      {/* Üzleti & Jogi Stratégia Útmutató az Ingyenes -> Fizetős Átálláshoz */}
      <div className="shadow-sheet rounded-3xl bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-accent-dark" />
          <h2 className="font-display text-xl text-ink">
            Ingyenes → Fizetős Átállási Stratégia és Szabályzat (Founding Partner Policy)
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 text-sm leading-relaxed text-ink-soft">
          <div className="space-y-3 rounded-2xl bg-paper-alt p-5">
            <h3 className="font-display text-base text-ink">1. Mikor érdemes fizetősre váltani?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Technikai limitnél:</strong> Ha a Supabase DB eléri a ~350 MB-ot (70%) vagy a képek az 700 MB-ot, be kell kapcsolni a Supabase Pro csomagot ($25/hó).
              </li>
              <li>
                <strong>Üzleti limitnél:</strong> Amikor az aktív szolgáltatók száma eléri a <strong>15–20 főt</strong>, vagy a havi foglalások száma meghaladja a 200-at. Ekkor a platform igazolta a piaci igényt.
              </li>
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl bg-paper-alt p-5">
            <h3 className="font-display text-base text-ink">2. Mi legyen az ingyenesen regisztráltakkal? (Policy)</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>&quot;Founding Partner&quot; (Alapító Szolgáltató) státusz (Ajánlott):</strong> Az első limitált (pl. 20) regisztrálónak örökös vagy 12 hónapos ingyenes hozzáférést biztosíthatsz. Ez óriási motiváció a gyors regisztrációra.
              </li>
              <li>
                <strong>Ingyenes Alapcsomag (Freemium):</strong> Az ingyenes szolgáltatók megtarthatják az alap funkciókat (1 munkatárs, max 5 szolgáltatás), míg a prémium funkciók (több munkatárs, kiemelt térkép megjelenés) fizetőssé válnak.
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed space-y-2">
          <p className="font-semibold text-amber-950">📜 Jogi & ÁSZF alapelv a fizetős átálláshoz:</p>
          <p>
            Az ÁSZF-ben és a regisztrációs felületen világosan fel van tüntetve, hogy az induló időszak díjmentes. Ha később fizetős előfizetést (pl. havonta 3 990 Ft / hó) vezetsz be az meglévő szolgáltatókra is, az ÁSZF szerint <strong>legalább 30 nappal előre e-mailben értesítened kell őket</strong>, biztosítva a lehetőséget az ingyenes felmondásra vagy az ingyenes alapcsomagra való visszasorolásra.
          </p>
        </div>
      </div>
    </section>
  );
}
