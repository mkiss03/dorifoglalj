import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgePercent } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/content/get-site-content";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { SignUpForm } from "./SignUpForm";

export default async function RegisztracioPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  const content = await getSiteContent();
  const foundingNote = content.forproviders.founding_note;

  return (
    <section className="flex min-h-screen items-center bg-paper py-14">
      <Container className="max-w-md">
        <Link href="/" className="mb-8 inline-flex">
          <Logo className="text-lg" />
        </Link>
        <div className="shadow-sheet rounded-3xl bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">
            Szolgáltatóknak
          </p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-ink sm:text-3xl">
            Regisztrálj szolgáltatóként
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Hozd létre a fiókod, utána a profilodat és a szolgáltatásaidat az
            irányítópulton állíthatod be.
          </p>

          {foundingNote && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-accent-dark/20 bg-accent-light/40 p-4">
              <BadgePercent className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" strokeWidth={2} />
              <p className="text-[13px] leading-relaxed text-ink">{foundingNote}</p>
            </div>
          )}

          <SignUpForm />
          <p className="mt-6 text-center text-sm text-ink-soft">
            Már van fiókod?{" "}
            <Link href="/bejelentkezes" className="font-semibold text-accent-dark hover:text-accent">
              Jelentkezz be
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
