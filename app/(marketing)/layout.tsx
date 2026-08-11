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
      {/* A pb-16 a Footer UTÁN kell, nem a main-en — a lebegő mobil CTA
          (MobileStickyCta) fixen a képernyő aljához tapad, e nélkül a
          térköz nélkül a footer utolsó sora véglegesen eltakarva marad
          mobilon, akkor is, ha az oldal aljára görget a látogató. */}
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        <main className="flex-1">{children}</main>
        <Footer content={content.footer} categories={categories} />
      </div>
      <MobileStickyCta content={content.mobilestickycta} />
    </>
  );
}
