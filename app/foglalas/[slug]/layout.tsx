import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";

export default function BookingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-paper-alt">
      <header className="bg-paper">
        <Container className="flex h-16 items-center">
          <Link href="/" className="flex items-center">
            <Logo className="text-lg" />
          </Link>
        </Container>
      </header>
      {children}
    </div>
  );
}
