import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Az admin oldal-szerkesztőben feltöltött képek a Supabase Storage-ból
    // (site-media bucket) jönnek — ezt a hostot kell engedélyezni a
    // next/image-nek, különben nem tölti be a CMS-vezérelt képeket.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
