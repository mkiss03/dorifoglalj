import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { signOutAction } from "@/app/auth/actions";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  if (!user) redirect("/bejelentkezes");

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  return (
    <div className="min-h-screen bg-paper">
      <header className="shadow-card bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/admin/szerkeszto" className="flex items-center gap-2">
            <Logo className="text-lg" />
            <span className="rounded-full bg-paper-alt px-2.5 py-1 text-xs font-semibold text-ink-soft">Admin</span>
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
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </Container>
    </div>
  );
}
