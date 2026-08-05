import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, isAdmin } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { SignInForm } from "@/app/bejelentkezes/SignInForm";
import { adminSignInAction } from "./actions";

export default async function AdminBejelentkezesPage() {
  const user = await getUser();
  if (user) redirect((await isAdmin()) ? "/admin/szerkeszto" : "/dashboard");

  return (
    <section className="flex min-h-screen items-center bg-paper py-14">
      <Container className="max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <Logo className="text-lg" />
          <span className="rounded-full bg-paper-alt px-2.5 py-1 text-xs font-semibold text-ink-soft">Admin</span>
        </Link>
        <div className="shadow-sheet rounded-3xl bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Admin</p>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-ink sm:text-3xl">Belépés</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Ugyanazzal a fiókkal jelentkezz be, amit az admin jogosultsághoz beállítottunk.
          </p>
          <SignInForm action={adminSignInAction} />
        </div>
      </Container>
    </section>
  );
}
