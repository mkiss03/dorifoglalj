import type { Metadata } from "next";
import { Archivo_Black, Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://idopontneked.hu";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IdőpontNeked.hu — Ahol a szabad időpontok várnak",
    template: "%s — IdőpontNeked.hu",
  },
  description:
    "Az IdőpontNeked.hu egy online időpontfoglaló platform, ahol könnyedén megtalálod a számodra megfelelő szolgáltatót (fodrász, köröm, kozmetika, masszázs stb.), megnézheted a szabad időpontokat, és néhány kattintással lefoglalhatod a Neked megfelelő időpontot.",
  keywords: [
    "időpontfoglalás",
    "időpontfoglaló",
    "fodrász időpont",
    "körmös időpont",
    "kozmetikus időpont",
    "szépségipar",
    "online foglalás",
    "idopontneked",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "IdőpontNeked.hu — Ahol a szabad időpontok várnak",
    description:
      "Online időpontfoglaló piactér szépségipari szolgáltatóknak és a szabad időpontot kereső vendégeknek.",
    url: siteUrl,
    siteName: "IdőpontNeked.hu",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: "/apple-icon.png",
        width: 512,
        height: 512,
        alt: "IdőpontNeked.hu logó",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "IdőpontNeked.hu — Ahol a szabad időpontok várnak",
    description: "Online időpontfoglaló piactér szépségipari szolgáltatóknak és vendégeknek.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IdőpontNeked.hu",
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  slogan: "Ahol a szabad időpontok várnak.",
  description:
    "Online időpontfoglaló platform szépségipari szolgáltatóknak és az őket kereső vendégeknek.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "dori@idopontneked.hu",
    contactType: "customer support",
    availableLanguage: "Hungarian",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IdőpontNeked.hu",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/kereses?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
