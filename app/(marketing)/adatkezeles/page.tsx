import { Container } from "@/components/ui/Container";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata = { title: "Adatkezelési tájékoztató — IttFoglalj.hu" };

export default function AdatkezelesPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Jogi információk</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">Adatkezelési tájékoztató</h1>

        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Ez az oldal még véglegesítés alatt áll — a szögletes zárójelben szereplő adatok a szolgáltató
          cégbejegyzési adataival lesznek kitöltve. A leírt adatkezelési gyakorlat magát a rendszer működését
          pontosan tükrözi. Kérdésed van addig is? Írj:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-xl text-ink">Az adatkezelő</h2>
            <p className="mt-2">
              [Cégnév] ([Székhely], adószám: [Adószám], e-mail:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
                {SUPPORT_EMAIL}
              </a>
              ) — az IttFoglalj.hu üzemeltetője.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Milyen adatokat kezelünk</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">Foglaláskor (vendégként):</strong> név, telefonszám, és — ha megadod —
                e-mail cím, a foglalás időpontja és a választott szolgáltatás. Regisztráció nem szükséges.
              </li>
              <li>
                <strong className="text-ink">Szolgáltatói regisztrációkor:</strong> e-mail cím és jelszó (a
                jelszót titkosítva, a Supabase Auth kezeli), vállalkozás neve, kategória, település, cím,
                telefonszám, bemutatkozó szöveg, weboldal/közösségi média linkek, feltöltött logó és borítókép.
              </li>
              <li>
                <strong className="text-ink">Munkamenet-sütik:</strong> kizárólag a bejelentkezés fenntartásához
                szükséges, funkcionálisan kötelező sütik — marketing- vagy követő sütiket nem használunk.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Az adatkezelés célja és jogalapja</h2>
            <p className="mt-2">
              A foglalással kapcsolatos adatokat a szolgáltatás nyújtásához (a foglalás létrehozásához és a
              szolgáltató tájékoztatásához) kezeljük, jogalapja a szerződés teljesítése (GDPR 6. cikk (1) b)).
              A szolgáltatói fiók adatait a regisztrációval létrejövő szerződés teljesítéséhez kezeljük.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Kik férnek hozzá az adatokhoz</h2>
            <p className="mt-2">
              A foglalás adatait kizárólag az érintett szolgáltató és a platform üzemeltetője látja. Adatfeldolgozóként
              a Supabase, Inc. (adatbázis- és hitelesítés-szolgáltatás) és a Vercel Inc. (alkalmazás-üzemeltetés)
              működik közre — harmadik félnek marketingcélra nem adjuk át az adataidat.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Megőrzési idő</h2>
            <p className="mt-2">
              A foglalási adatokat a foglalás lezárultát követően [X] ideig őrizzük meg, ezt követően töröljük.
              A szolgáltatói fiók adatait a fiók törléséig, illetve — ha ezt kéred — a törlési kérelem
              teljesítéséig kezeljük.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Jogaid</h2>
            <p className="mt-2">
              Bármikor kérhetsz tájékoztatást a rólad kezelt adatokról, kérheted azok helyesbítését, törlését,
              kezelésük korlátozását, valamint tiltakozhatsz a kezelésük ellen — ehhez írj a{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
                {SUPPORT_EMAIL}
              </a>{" "}
              címre. Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH, naih.hu) fordulhatsz.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
