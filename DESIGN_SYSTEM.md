# IdőpontNeked.hu — Design rendszer és oldalfelépítés

> v5 — **"Confident Minimal".** A v4 "Lebegő lapok" szerkezete (lágy lekerekítés-skála, `shadow-sheet`/`shadow-card` panelek, a Collage-motívum) **változatlanul megmarad** — ez nem szerkezeti, hanem szín- és tipográfia-váltás. A meleg gold/cream/beige paletta és a Fraunces/Plus Jakarta Sans betűpár helyett: közel-fekete + fehér/szürke semlegesek + **egyetlen** telített akcentus (raspberry-korall), Archivo Black + Ubuntu betűpár. A cél: eltávolodni a "meleg krém + arany" AI-sablon hatástól egy olyan irányba, amit a kategória valós, erős szereplői (Fresha: közel-fekete + fehér + egy telített akcentus) és a 2026-os designtrendek (Digital Lavender a beauty/wellness kategóriában, Pantone Cloud Dancer törtfehér, "letisztult alap + egy nyugtató/magabiztos akcentus") is alátámasztanak.

---

## 1. Kontextus és tervezési filozófia

**Mi ez:** IdőpontNeked.hu — online időpontfoglaló marketplace szépségipari szolgáltatóknak (fodrász, köröm, kozmetika, smink, szempilla, szemöldök, szőrtelenítés, masszázs, testkezelés, PMU) és az őket kereső vendégeknek.

**Kivel versenyzünk:** elsődlegesen a hazai Salonic.hu-val — őket **megjelenésben és technikai kivitelezésben** kell lekörözni. Nemzetközi mérce: Fresha, Booksy.

**v1 → v2 → v3 → v4 → v5 a rövid történet:**
- **v1**: meleg gold/bézs paletta, sablonos szerkezet (bento-rács, 3D tilt-kártyák).
- **v2**: "meleg editorial, éles geometria" — túltolva (mindenütt mono font, kimosott kontraszt, eltűnt fotók).
- **v3**: a v2 kereteit megtartva, sebészi javítás.
- **v4 "Lebegő lapok"**: teljes szerkezeti fordulat — lágy, nagy sugarú lekerekítés, meleg diffúz árnyékok, fehér lebegő panelek, a Collage-motívum. A szín/font viszont még mindig a v1 óta megörökölt gold/cream/beige + Fraunces/Plus Jakarta Sans volt.
- **v5 (jelen állapot)**: **kizárólag szín- és tipográfia-csere** a v4 szerkezetén belül. Kutatással alátámasztva (ld. lent) lecserélve a gold/cream/beige palettát egy közel-fekete + fehér/szürke + egyetlen raspberry-korall akcentusra, és a Fraunces/Plus Jakarta Sans betűpárt Archivo Black + Ubuntu-ra.

### Miért ez a váltás

A korábbi meleg gold/bézs paletta — bár a projekt sok kör alatt csiszolta — alapvetően egy "AI-generált prémium landing oldal" tipikus színvilága volt. Kutatással (nem emlékezetből) megerősítve:
- **A Fresha** — a projekt kimondott minőségi mércéje — valójában **közel-fekete + fehér + egyetlen élénk azúrkék akcentust** használ, nem meleg pasztellt.
- **Digital Lavender** a 2026-os designtrendek szerint a domináns szín a beauty/wellness kategóriában, de a projektben végül a **"Confident Minimal"** irány mellett döntöttünk — ez a legkevésbé "AI-sablon" hatású, mert kevés színt használ nagy magabiztossággal, sok fehér térrel.
- A Pantone 2026-os Év Színe a **Cloud Dancer** (törtfehér) — "quiet luxury", letisztultság.

### Alapelvek (v5)

1. **Egyetlen telített akcentus, tudatosan elosztva — nem mindenhol.** A raspberry-korall (`--accent-dark`) **nem** váltja fel az összes régi gold-használatot egy az egyben. Két külön szerep van: (a) **strukturális/elsődleges akció** — gombok, CTA-k — ezek **közel-feketék** (`bg-ink`), nem koráll színűek; (b) **ritka, jelentéssel bíró kiemelés** — eyebrow-k, egy kiemelt szó a címben, kiválasztott/aktív állapotok (naptár kiválasztott napja, aktív dátum-chip, nyitott GYIK-elem, "Szabad" időpont-jelzés) — ezek koráll színűek. A **sűrűn ismétlődő dekoratív elemek** (kategória-ikonkörök, csillag-értékelés, munkatárs-monogramok) **semlegesek** (szürke `--panel`/`--ink`), hogy a korall ne "használódjon el".
2. **A gomb-szín alapból fekete, nem az akcentus.** Ez a v5 legnagyobb, legtudatosabb döntése — a Fresha-mintát követi: a fő cselekvésre ösztönző elemek (Keresés, Regisztráció, Csatlakozom szolgáltatóként, form-submit gombok) mind `bg-ink hover:bg-ink/90`. Kivétel: a `CtaBanner` (az oldal egyetlen sötét, `bg-ink` háttere), ahol a gomb feketén nem látszódna — ott a gomb maga koráll (`bg-accent-dark`), az oldal egyetlen igazán hangsúlyos színes CTA-pillanataként.
3. **A csillag-értékelés és hasonló "adat", nem dekoráció — ezért monokróm.** A régi gold csillagok helyett `fill-ink text-ink` — egy szemantikus adatjelző (értékelés) nem igényel saját színt egy amúgy visszafogott palettában.
4. **A szerkezet (v4) változatlan.** `rounded-3xl`/`2xl`/`xl`/`full` skála, `shadow-sheet`/`shadow-card` árnyékok, a Collage-motívum (szín-blokk + óriás betű + fotó + kézzel rajzolt ecsetvonás) — mind megmaradt, csak az alattuk lévő színek/fontok cseréltek.
5. **Archivo Black — egyetlen súly, dőlt nélkül.** A Google Fonts "Archivo Black" csak egyetlen (eleve fekete) statikus vágást kínál, dőlt verzió nélkül — ezért minden `font-display` elemről **eltávolítva** az esetleges `font-semibold`/`font-bold`/`italic` osztály (szintetikus félkövérítést/döntést okozna). A cím kiemelt szava mostantól **csak színnel** (nem dőltséggel) különül el.
6. **Ubuntu — 300–700 súlyok.** A törzsszöveg betűje; barátságos, de "szoftveres" humanista sans, jól illik a Confident Minimal irányhoz.

### Amit a v4-ből kifejezetten megtartottunk (nem szín/font, hanem szerkezet)

- A 4-szintű lágy lekerekítés-skála, a `shadow-sheet`/`shadow-card` árnyékrendszer, a Collage-komponens, a fehér lebegő lap + színes háttér ritmus.
- A CtaBanner mint az oldal egyetlen sötét (`bg-ink`) pillanata.

### Amit a v5 kifejezetten megváltoztatott

- **A teljes szín-token-készlet** (ld. 2.1) — a régi `--cream`/`--cream-alt`/`--beige`/`--beige-line`/`--gold`/`--gold-light`/`--gold-dark` token-nevek **törölve és lecserélve** `--paper`/`--paper-alt`/`--panel`/`--line`/`--accent`/`--accent-light`/`--accent-dark`-ra. **Ez azt jelenti, hogy a régi `bg-cream`, `text-gold-dark` stb. Tailwind osztályok többé nem léteznek** — bármely jövőbeli kód, ami ezeket használná, némán (build-hiba nélkül) nem kapna stílust, mert a Tailwind v4 nem generál szabályt ismeretlen tokenre. Új kódban mindig az új token-neveket használd.
- **A betűpár** — Fraunces+Plus Jakarta Sans → Archivo Black+Ubuntu.
- **A fotó-grade szűrő** — a meleg szépia (`sepia(16%) saturate(115%)...`) helyett egy semlegesebb, magabiztosabb kontraszt-emelő szűrő (`contrast(1.08) saturate(0.9) brightness(0.99)`), hogy illeszkedjen a hűvösebb közel-fekete tintához.
- **Az árnyék-szín** — a meleg barna-fekete `rgba(42,35,28,...)` helyett hűvös közel-fekete `rgba(22,24,28,...)`.

---

## 2. Design tokenek

### 2.1 Színek — v5, teljesen újratervezve

| Token | Hex | Szemantika |
|---|---|---|
| `--paper` | `#FFFFFF` | Alap háttér / kártya-felület |
| `--paper-alt` | `#F4F4F5` | Másodlagos, alternáló szekcióháttér (hűvös, halvány szürke — nem meleg bézs) |
| `--panel` | `#E4E4E7` | Dekoratív semleges blokk (Collage szín-blokk, HowItWorks echo-blokk, ismétlődő ikon-körök/badge-ek) |
| `--line` | `#E0E0E3` | Halvány belső elválasztó (csak kártyán belül) |
| `--ink` | `#16181C` | Elsődleges szöveg, **elsődleges gomb-háttér**, és az egyetlen sötét szekció (`CtaBanner`) háttere |
| `--ink-soft` | `#5B5F66` | Másodlagos szöveg |
| `--accent` | `#E63E6D` | Hover-állapot, világosabb akcentus sötét háttéren (pl. CtaBanner eyebrow) |
| `--accent-light` | `#FBD5DF` | Halvány akcentus-tint (pl. dashboard input-mezők fókusz-gyűrűje) |
| `--accent-dark` | `#B2224C` | Az elsődleges akcentus-szín szövegre/kiemelésre — eyebrow-k, kiválasztott/aktív állapotok, a CtaBanner CTA-gombja |

**Gomb-szín szabály (a v5 kulcs-döntése, ld. 1. fejezet 2. pont):** elsődleges cselekvés-gombok `bg-ink hover:bg-ink/90 text-paper` — **nem** `bg-accent-dark`. Az akcentus gombként **kizárólag** a `CtaBanner`-ben jelenik meg (`bg-accent-dark hover:bg-accent`), mert ott a háttér maga `bg-ink`, és egy fekete gomb eltűnne.

**Háttér-váltakozás (v5, változatlan ritmus a v4-hez képest, csak a hex-ek cserélve):** `paper` (Header, Hero) → `paper` (Categories) → `paper-alt` (FeaturedProviders) → `paper` (HowItWorks) → `paper-alt` (Comparison) → `paper` (WhyUs) → `paper-alt` (BrowseByCity) → `paper-alt` (ForProviders) → **`ink`** (CtaBanner) → `paper-alt` (Faq) → `paper` (Footer).

### 2.2 Tipográfia — Archivo Black + Ubuntu

| Szerep | Font | Használat |
|---|---|---|
| Display / címsorok | **Archivo Black** (egyetlen, eleve fekete vágás, dőlt nélkül) | Minden H1/H2, a Collage óriás-betűje. **Sosem** kombinálva `font-bold`/`font-semibold`/`italic` osztállyal — szintetikus stílust okozna egy statikus, egy-súlyú fonton |
| Törzsszöveg / UI | **Ubuntu** (300–700) | Minden más — eyebrow, gomb-szöveg, statisztika-érték, csillag-értékelés melletti szöveg |

**Eyebrow, v5 forma (változatlan minta, csak szín):** `text-xs font-bold uppercase tracking-[0.12em] text-accent-dark` — sötét szekción (`CtaBanner`) `text-accent` a jobb kontrasztért.

**Hero-cím, v5 méret (kisebb, mint v4 volt — az Archivo Black karakterei szélesebbek/nehezebbek, mint a Fraunces-é voltak, így a régi clamp mobilon 6 sorra tört és a fold alá tolta a keresőt):**

```css
font-size: 1.75rem;                                   /* mobil, < sm */
font-size: clamp(2.25rem, 4vw, 3.75rem);               /* sm: és felette */
line-height: 1.08;
```

A kereső-form alja mobilon (390×844) mérve: **~787px** — biztonságosan a fold felett.

### 2.3–2.4 Lekerekítés és árnyék — változatlan v4 óta

Lásd a korábbi verziók dokumentációját — a `rounded-3xl`/`2xl`/`xl`/`full` skála és a `shadow-sheet`/`shadow-card` réteg-rendszer nem változott. Az árnyék RGB-je hűvösebb tintára igazítva (ld. 1. fejezet).

### 2.5 Fotó-kezelés — v5-ben hidegebb grade

```css
.photo-grade    { filter: contrast(1.08) saturate(0.9) brightness(0.99); }  /* meleg szépia helyett */
.photo-collage  { filter: grayscale(1) contrast(1.15); }                    /* enyhén erősebb kontraszt */
```

### 2.6 Collage motívum — változatlan komponens, új színek

`components/ui/Collage.tsx` szerkezete nem változott (szín-blokk + óriás betű + fotó + ecsetvonás), csak a színei: a szín-blokk `bg-panel` (volt `bg-beige`), az óriás betű `text-paper-alt` (volt `text-cream-alt`), az ecsetvonás `text-accent-dark` (volt `text-gold`).

### 2.7 Logó

Változatlan szerkezet, az "Itt" előtag színe `text-accent-dark` (volt `text-gold-dark`); a `font-semibold` osztály eltávolítva (Archivo Black eleve fekete).

---

## 3. Komponens-anatómia és oldalszerkezet

A teljes komponens-lista, a Collage/MiniCalendar/RSC-határkezelés részletei **változatlanok a v4 dokumentációhoz képest** — csak a bennük használt Tailwind szín-osztályok cserélődtek az új token-nevekre. Lásd a 4. fejezet mappingjét a pontos elv szerinti besoroláshoz.

**Új útvonalak (a backend-szelettel egy időben épültek, szintén Confident Minimal színekkel):** `/regisztracio`, `/bejelentkezes`, `/dashboard`, `/auth/confirm`, `/auth/error` — mind a `bg-paper`/`bg-ink`/`text-accent-dark` tokenkészletet használják, konzisztensen a marketing oldallal.

---

## 4. Szín-szerep mapping (referencia jövőbeli komponensekhez)

| Régi (v4, törölve) | Új (v5) | Mikor |
|---|---|---|
| `bg-cream` | `bg-paper` | Elsődleges szekcióháttér |
| `bg-cream-alt` | `bg-paper-alt` | Másodlagos/alternáló szekcióháttér |
| `bg-beige` | `bg-panel` | Dekoratív semleges blokk |
| `border-beige-line` | `border-line` | Halvány belső elválasztó |
| `text-gold-dark` (eyebrow, kiválasztott állapot) | `text-accent-dark` | Ritka, jelentéssel bíró kiemelés |
| `bg-gold-dark` (gomb) | `bg-ink` | **Elsődleges CTA-gomb — feketére vált, nem korállra** |
| `bg-gold-dark` (aktív/kiválasztott jelző, pl. naptár-nap, dátum-chip) | `bg-accent-dark` | Meghagyva akcentusnak — valódi állapotjelzés |
| `bg-gold-light/30` (ismétlődő ikon-kör) | `bg-panel` | Semlegesítve — ne "használódjon el" az akcentus |
| `fill-gold-dark` (csillag-értékelés) | `fill-ink` | Adatjelző, nem dekoráció → monokróm |

---

## 5. Elfogadási teszt (kötelező minden jövőbeli módosítás után)

1. **Van-e a `--gold`/`--cream`/`--beige` család bármelyik osztálya bárhol a kódban?** Nem szabadna — ezek némán nem kapnak stílust (Tailwind v4 nem hibázik ismeretlen tokenre), ezért ezt **csak `grep`-pel lehet ellenőrizni**, nem build-del.
2. **Hány `bg-accent-dark` gomb van a marketing oldalon (CtaBanner-en kívül)?** Nulla — minden más elsődleges CTA `bg-ink`.
3. **390px-en a kereső a fold felett van?** Igen — ~787px egy 844px-es viewportban.
4. **Van-e `font-bold`/`font-semibold`/`italic` egy `font-display` elemen?** Nem szabadna — Archivo Black egyetlen, eleve fekete, nem dőlt vágás.
5. **Fresha.com mellett — ugyanabba a minőségi ligába tartozik?** Igen: közel-fekete/fehér magabiztosság, egyetlen jól irányzott akcentusszín, nem szétszórt pasztell.

---

## 6. Rövid összefoglaló Fable 5-nek

**A v4 "Lebegő lapok" szerkezete (lágy lekerekítés, meleg diffúz árnyékok, a Collage-motívum) változatlan — ez egy tiszta szín- és tipográfia-csere volt, nem szerkezeti. A régi gold/cream/beige paletta helyett: közel-fekete (`#16181C`) + fehér/szürke semlegesek + egyetlen raspberry-korall akcentus (`#B2224C`), a Fresha valós márka-mintázatát követve (nem pasztell, hanem fekete-fehér magabiztosság + egy telített szín). A legfontosabb döntés: az elsődleges CTA-gombok feketék lettek, nem az akcentus színűek — a korall kizárólag ritka, jelentéssel bíró pillanatokra van fenntartva (eyebrow-k, kiválasztott/aktív állapotok, és a CtaBanner egyetlen színes gombja a sötét háttéren). A betűpár Archivo Black (egyetlen, eleve fekete vágás) + Ubuntu-ra váltott — a Fraunces szerif/Plus Jakarta Sans helyett egy sokkal nyersebb, magabiztosabb, "szoftveresebb" hangot ütve meg.**
