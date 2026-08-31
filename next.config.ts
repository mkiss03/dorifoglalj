import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Az admin oldal-szerkesztőben feltöltött képek a Supabase Storage-ból
    // (site-media bucket) jönnek — ezt a hostot kell engedélyezni a
    // next/image-nek, különben nem tölti be a CMS-vezérelt képeket.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: {
      // A Server Action-ök alapértelmezett 1 MB body-limitje kevesebb, mint
      // az alkalmazás saját, a felhasználónak is hirdetett 5 MB-os kép-
      // feltöltési korlátja (logó/borítókép, admin oldal-képek) — enélkül
      // minden 1 MB-nál nagyobb kép feltöltése némán, keretrendszer-szinten
      // elbukott, mielőtt a saját hibaüzenetes validáció egyáltalán lefutott
      // volna.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
