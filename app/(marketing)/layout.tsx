import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { getSiteContent } from "@/lib/content/get-site-content";
import { resolveCategories } from "@/lib/content/resolveCategories";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();
  const categories = resolveCategories(content);

  return (
    <>
      <SmoothScroll />
      <Header content={content.header} categories={categories} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer content={content.footer} categories={categories} />
      <MobileStickyCta content={content.mobilestickycta} />
    </>
  );
}
