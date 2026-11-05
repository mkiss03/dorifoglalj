import { LegalDocument } from "@/components/legal/LegalDocument";
import { ASZF_BLOCKS, ASZF_EFFECTIVE_DATE } from "@/lib/legal/aszfDocument";

export const metadata = { title: "Általános Szerződési Feltételek · IdőpontNeked.hu" };

export default function AszfPage() {
  return (
    <LegalDocument
      title="Általános Szerződési Feltételek"
      meta={[{ label: "Hatályos", value: ASZF_EFFECTIVE_DATE }]}
      blocks={ASZF_BLOCKS}
    />
  );
}
