import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";

export default function AuthErrorPage() {
  return (
    <section className="flex min-h-screen items-center bg-paper py-14">
      <Container className="max-w-md">
        <Link href="/" className="mb-8 inline-flex">
          <Logo className="text-lg" />
        </Link>
        <div className="shadow-sheet rounded-3xl bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-ink">
            A link lejárt vagy már felhasználták
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Próbáld meg újra a regisztrációt, vagy ha már van fiókod, jelentkezz be.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/regisztracio"
              className="rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-ink/90"
            >
              Regisztráció
            </Link>
            <Link
              href="/bejelentkezes"
              className="rounded-full bg-paper-alt px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-panel"
            >
              Bejelentkezés
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
