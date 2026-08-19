import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { MagicLinkForm } from "./MagicLinkForm";

export default async function BelepesLinkkelPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");

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
            Bejelentkezés email linkkel
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Add meg a fiókodhoz tartozó e-mail címet, és küldünk egy linket, amivel jelszó
            nélkül beléphetsz.
          </p>
          <MagicLinkForm />
          <p className="mt-6 text-center text-sm text-ink-soft">
            Inkább jelszóval jelentkeznél be?{" "}
            <Link href="/bejelentkezes" className="font-semibold text-accent-dark hover:text-accent">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
