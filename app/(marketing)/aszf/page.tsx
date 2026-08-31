import { AszfContent } from "@/components/legal/AszfContent";
import { getSiteContent } from "@/lib/content/get-site-content";

export const metadata = { title: "Általános Szerződési Feltételek · IdőpontNeked.hu" };

export default async function AszfPage() {
  const content = await getSiteContent();
  return <AszfContent legal={content.legal} aszf={content.aszf} />;
}
