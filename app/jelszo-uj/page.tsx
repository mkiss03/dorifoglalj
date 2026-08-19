import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { SetPasswordForm } from "./SetPasswordForm";

export default async function JelszoUjPage() {
  // Ide csak a jelszó-visszaállító e-mail linkjén (vagy magic linken)
  // keresztül, a /auth/confirm route sikeres verifyOtp-ja után lehet
  // eljutni érvényes session-nel — enélkül nincs mit menteni.
  const user = await getUser();
  if (!user) redirect("/elfelejtett-jelszo");

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
            Új jelszó beállítása
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Add meg az új jelszavad kétszer, majd mentsd el.
          </p>
          <SetPasswordForm />
        </div>
      </Container>
    </section>
  );
}
