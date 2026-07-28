import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { signOutAction } from "@/app/auth/actions";

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
      {children}
    </div>
  );
}
