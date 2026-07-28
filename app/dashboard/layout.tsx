import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { signOutAction } from "@/app/auth/actions";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  if (!user) redirect("/bejelentkezes");

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

      <Container className="flex flex-col gap-6 py-8 lg:flex-row lg:gap-10 lg:py-14">
        <DashboardNav />
        <main className="min-w-0 flex-1">{children}</main>
      </Container>
    </div>
  );
}
