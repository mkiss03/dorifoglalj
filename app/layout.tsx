import type { Metadata } from "next";
import { Archivo_Black, Ubuntu } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

const body = Ubuntu({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "IdőpontNeked.hu — Ahol a szabad időpontok várnak",
  description:
    "Az IdőpontNeked.hu egy online időpontfoglaló platform, ahol könnyedén megtalálod a számodra megfelelő szolgáltatót, megnézheted a szabad időpontokat, és néhány kattintással lefoglalhatod a Neked megfelelő időpontot telefonálás és hosszas egyeztetés nélkül.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IdőpontNeked.hu",
  url: "https://idopontneked.hu",
  slogan: "Ahol a szabad időpontok várnak.",
  description:
    "Online időpontfoglaló platform szépségipari szolgáltatóknak és az őket kereső vendégeknek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
