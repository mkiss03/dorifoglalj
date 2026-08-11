import { AdatkezelesContent } from "@/components/legal/AdatkezelesContent";
import { getSiteContent } from "@/lib/content/get-site-content";

export const metadata = { title: "Adatkezelési tájékoztató — IttFoglalj.hu" };

export default async function AdatkezelesPage() {
  const content = await getSiteContent();
  return <AdatkezelesContent legal={content.legal} adatkezeles={content.adatkezeles} />;
}
