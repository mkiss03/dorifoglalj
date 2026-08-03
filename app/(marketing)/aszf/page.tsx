import { Container } from "@/components/ui/Container";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata = { title: "Általános Szerződési Feltételek — IttFoglalj.hu" };

export default function AszfPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Jogi információk</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Általános Szerződési Feltételek
        </h1>

        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Ez az oldal még véglegesítés alatt áll — a szögletes zárójelben szereplő adatok a szolgáltató
          cégbejegyzési adataival lesznek kitöltve. A leírtak a rendszer jelenlegi, tényleges működését tükrözik.
          Kérdésed van addig is? Írj:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-xl text-ink">A szolgáltatás</h2>
            <p className="mt-2">
              Az IttFoglalj.hu ([Cégnév], [Székhely]) egy időpontfoglaló piactér, amely összeköti a szépségipari
              (fodrász, köröm, kozmetika, masszázs stb.) szolgáltatókat és az időpontot kereső vendégeket. A
              platform maga nem nyújtja a lefoglalt szolgáltatásokat — az adott foglalás teljesítéséért a
              kiválasztott szolgáltató felel.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Vendégeknek</h2>
            <p className="mt-2">
              Időpontot regisztráció nélkül, ingyenesen foglalhatsz. A foglalás a szolgáltató által megadott
              szabad időpontok közül, a foglalás pillanatában azonnal megerősítésre kerül — külön e-mailes
              visszaigazolást a rendszer jelenleg nem küld, a képernyőn megjelenő visszaigazolás számít
              véglegesnek. A foglalás módosítását vagy lemondását egyelőre közvetlenül a szolgáltatóval kell
              egyeztetni.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Szolgáltatóknak</h2>
            <p className="mt-2">
              A regisztráció és a platform használata jelenleg díjmentes. Az új szolgáltatói fiókok manuális
              jóváhagyáson esnek át — a regisztrációt követően a platform üzemeltetője egyezteti a részleteket,
              ezután aktiválja a fiókot. A jóváhagyásig a szolgáltató profilja nem jelenik meg a keresésben, és
              nem fogadhat foglalást.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Felelősség</h2>
            <p className="mt-2">
              A platform közvetítői szerepet tölt be — a foglalt szolgáltatás minőségéért, a szolgáltató és a
              vendég közötti egyeztetésért, valamint az esetleges elmaradt vagy módosított időpontokért a
              szolgáltató felel. A platform törekszik a pontos, naprakész adatok megjelenítésére, de nem
              garantálja a szolgáltatók által megadott adatok teljességét vagy pontosságát.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Módosítás</h2>
            <p className="mt-2">
              A jelen feltételeket a platform üzemeltetője időről időre módosíthatja — a mindenkor hatályos
              változat ezen az oldalon érhető el. Kérdés vagy észrevétel esetén írj a{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
                {SUPPORT_EMAIL}
              </a>{" "}
              címre.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
