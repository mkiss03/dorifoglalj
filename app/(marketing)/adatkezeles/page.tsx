import { LegalDocument } from "@/components/legal/LegalDocument";
import {
  ADATKEZELES_BLOCKS,
  ADATKEZELES_EFFECTIVE_DATE,
  ADATKEZELES_VERSION,
} from "@/lib/legal/adatkezelesDocument";

export const metadata = { title: "Adatkezelési tájékoztató · IdőpontNeked.hu" };

export default function AdatkezelesPage() {
  return (
    <LegalDocument
      title="Adatkezelési tájékoztató"
      meta={[
        { label: "Adatkezelő", value: "Kondics-Vörös Dóra egyéni vállalkozó" },
        { label: "Hatályos", value: ADATKEZELES_EFFECTIVE_DATE },
        { label: "Verzió", value: ADATKEZELES_VERSION },
      ]}
      blocks={ADATKEZELES_BLOCKS}
    />
  );
}
