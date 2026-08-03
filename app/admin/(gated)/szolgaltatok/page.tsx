import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import type { AdminProviderRow, ProviderStatus } from "@/lib/supabase/types";
import { setProviderStatusAction } from "./actions";

const STATUS_LABELS: Record<ProviderStatus, string> = {
  pending: "Jóváhagyásra vár",
  active: "Aktív",
  suspended: "Felfüggesztve",
};

const STATUS_BADGE_CLASS: Record<ProviderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  active: "bg-accent-light text-accent-dark",
  suspended: "bg-paper-alt text-ink-soft",
};

const dateFormatter = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric" });

function formatDate(iso: string | null) {
  return iso ? dateFormatter.format(new Date(iso)) : "—";
}

type StatusFilter = ProviderStatus | "all";

function StatCard({
  label,
  value,
  href,
  active,
}: {
  label: string;
  value: number;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shadow-sheet rounded-3xl p-4 transition-colors ${active ? "bg-ink text-paper" : "bg-white text-ink hover:bg-panel"}`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${active ? "text-paper/70" : "text-ink-soft"}`}>{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </Link>
  );
}

export default async function AdminSzolgaltatokPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter: StatusFilter =
    sp.status === "pending" || sp.status === "active" || sp.status === "suspended" ? sp.status : "all";

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_list_providers");
  const providers = (data ?? []) as AdminProviderRow[];

  const counts = {
    all: providers.length,
    pending: providers.filter((p) => p.status === "pending").length,
    active: providers.filter((p) => p.status === "active").length,
    suspended: providers.filter((p) => p.status === "suspended").length,
  };

  const visible = filter === "all" ? providers : providers.filter((p) => p.status === filter);

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Szolgáltatók</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Jóváhagyás, felfüggesztés — a Supabase SQL Editor helyett innen kezelheted a szolgáltatói fiókokat.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Összes" value={counts.all} href="/admin/szolgaltatok" active={filter === "all"} />
        <StatCard
          label="Jóváhagyásra vár"
          value={counts.pending}
          href="/admin/szolgaltatok?status=pending"
          active={filter === "pending"}
        />
        <StatCard label="Aktív" value={counts.active} href="/admin/szolgaltatok?status=active" active={filter === "active"} />
        <StatCard
          label="Felfüggesztve"
          value={counts.suspended}
          href="/admin/szolgaltatok?status=suspended"
          active={filter === "suspended"}
        />
      </div>

      <div className="mt-6 space-y-3">
        {visible.length === 0 && (
          <p className="shadow-card rounded-2xl bg-white p-8 text-center text-[15px] text-ink-soft">
            Nincs ide tartozó szolgáltató.
          </p>
        )}

        {visible.map((p) => {
          const categoryName = categories.find((c) => c.slug === p.category)?.name ?? p.category;
          return (
            <div key={p.id} className="shadow-card flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg text-ink">{p.business_name}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 hover:text-ink">
                    <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                    {p.email}
                  </a>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 hover:text-ink">
                      <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                      {p.phone}
                    </a>
                  )}
                  {(categoryName || p.city) && <span>{[categoryName, p.city].filter(Boolean).join(" · ")}</span>}
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Regisztrált: {formatDate(p.created_at)}
                  {p.status === "active" && p.approved_at && <> · Jóváhagyva: {formatDate(p.approved_at)}</>}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {p.status !== "active" && (
                  <form action={setProviderStatusAction}>
                    <input type="hidden" name="provider_id" value={p.id} />
                    <input type="hidden" name="status" value="active" />
                    <button
                      type="submit"
                      className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/90"
                    >
                      {p.status === "pending" ? "Jóváhagyás" : "Aktiválás"}
                    </button>
                  </form>
                )}
                {p.status !== "suspended" && (
                  <form action={setProviderStatusAction}>
                    <input type="hidden" name="provider_id" value={p.id} />
                    <input type="hidden" name="status" value="suspended" />
                    <button
                      type="submit"
                      className="rounded-full bg-paper-alt px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-panel"
                    >
                      Felfüggesztés
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
