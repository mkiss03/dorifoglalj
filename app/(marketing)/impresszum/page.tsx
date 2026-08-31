import { ImpresszumContent } from "@/components/legal/ImpresszumContent";
import { getSiteContent } from "@/lib/content/get-site-content";

export const metadata = { title: "Impresszum · IdőpontNeked.hu" };

export default async function ImpresszumPage() {
  const content = await getSiteContent();
  return <ImpresszumContent legal={content.legal} impresszum={content.impresszum} />;
}
