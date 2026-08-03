import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, createClient, isAdmin } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { SUPPORT_EMAIL } from "@/lib/contact";
import { signOutAction } from "@/app/auth/actions";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  if (!user) redirect("/bejelentkezes");

  // Az admin fióknak is van (nem használt) providers sora a regisztrációs
  // trigger miatt — ne lássa a "jóváhagyásra vár" dashboardot, irányítsuk a
  // saját, admin-jogosultsághoz tartozó felületére.
  if (await isAdmin()) redirect("/admin/szerkeszto");

  const supabase = await createClient();
  const { data: provider } = await supabase
    .from("providers")
    .select("status")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-paper">
      <header className="shadow-card bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="text-lg" />
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full bg-paper-alt px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-panel"
            >
              Kijelentkezés
            </button>
          </form>
        </Container>
      </header>

      {provider?.status === "pending" && (
        <div className="border-b border-amber-200 bg-amber-50">
          <Container className="py-3 text-center text-sm leading-relaxed text-amber-900">
            🕐 Fiókod jóváhagyásra vár. Miután Dóri egyeztet és aktiválja a fiókodat, elérhető leszel a
            keresésben és fogadni tudsz foglalásokat. Ez általában 1-2 munkanap. Kérdés esetén írj:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
            .
          </Container>
        </div>
      )}

      <Container className="flex flex-col gap-6 py-8 lg:flex-row lg:gap-10 lg:py-14">
        <DashboardNav />
        <main className="min-w-0 flex-1">{children}</main>
      </Container>
    </div>
  );
}
