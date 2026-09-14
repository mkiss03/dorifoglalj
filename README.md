# IdőpontNeked.hu

Magyar időpontfoglaló piactér szépség-/wellness-szolgáltatóknak (fodrász, köröm, kozmetika, masszázs stb.). A vendégek szolgáltatót keresnek és regisztráció nélkül foglalnak; a szolgáltatók egy Apple-stílusú irányítópulton kezelik a profiljukat, szolgáltatásaikat, nyitvatartásukat és a foglalásaikat.

Ez a dokumentum a projekt jelenlegi technikai állapotának összefoglalója — mire épül, hogyan áll össze, és mi van benne a mostani (v0.4.0) állapot szerint.

## Tech stack

- **Next.js 16** (App Router, Turbopack, Server Components + Server Actions)
- **React 19** (`useActionState`, natív form actions)
- **TypeScript**, **Tailwind CSS v4**
- **Supabase**: Postgres adatbázis, Auth (e-mail/jelszó), Storage (profilképek)
- **lucide-react** ikonok, **qrcode** (szerver-oldali QR-generálás), **motion**/**lenis** (marketing oldali animációk/scroll)
- Deploy: **Vercel** (automatikus deploy minden `main`-push után), verziózás git tag-ekkel (`v0.1.0` … `v0.4.0`)

## Design rendszer

A vizuális nyelv neve **"Confident Minimal"**: közel-fekete/fehér alap + málna-korall (raspberry-coral) accent szín, `Archivo Black` display + `Ubuntu` body betűtípus. A pontos token-lista (színek, radius-skála, árnyék-osztályok) a [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)-ben van dokumentálva.

## Könyvtárszerkezet

```
app/
  (marketing)/         → nyitóoldal (Hero, Categories, HowItWorks, WhyUs, ForProviders, CtaBanner, Faq, Footer)
  bejelentkezes/        → szolgáltatói bejelentkezés
  regisztracio/         → szolgáltatói regisztráció
  auth/                 → Supabase auth confirm/error route-ok
  dashboard/            → szolgáltatói irányítópult (auth-védett, ld. lentebb)
  foglalas/[slug]/       → publikus, brandelt foglalási landing page + widget
  api/ics/[token]/       → egyirányú .ics naptár-feed (Google/Apple naptár-előfizetéshez)

components/              → marketing oldali szekció-komponensek
lib/
  supabase/              → server/browser Supabase kliensek + megosztott TS típusok
  categories.ts, cities.ts, faq.ts → statikus tartalom-adatok

supabase/
  schema.sql             → v0.1.0: providers, provider_services, regisztrációs trigger
  schema_v2.sql           → v0.2.0: foglalási rendszer (availability, bookings, RPC-k)
  schema_v3.sql           → v0.3.0: bővített profil, storage, szolgáltatás description/active
  schema_v4.sql           → v0.4.0: szünet (puffer) + időpont-zárolás
```

A `supabase/schema*.sql` fájlok **additívak és idempotensek** — mindegyiket egyszer, sorrendben kell lefuttatni a Supabase SQL Editorban egy éles projekten.

## Szolgáltatói irányítópult (`app/dashboard`)

Apple-stílusú, több menüpontos elrendezés (`DashboardNav.tsx`: bal oldali sáv desktopon, görgethető pill-sor mobilon), közös `layout.tsx` + megosztott `loading.tsx` a fülváltás érzékelt sebességéhez:

| Fül | Tartalom |
|---|---|
| **Áttekintés** (`/dashboard`) | Napi/heti statisztika-kártyák, teljes napi naptár (óra-rács, `MiniCalendar`), **"+ Új időpont"** — manuális/telefonos foglalás felvétele a szabad-sáv keresővel |
| **Profil** (`/profil`) | Cégadatok (kategória, város, cím, telefon, leírás), online jelenlét (weboldal, Facebook, Instagram), logó- és borítókép-feltöltés (Supabase Storage, `provider-media` bucket) |
| **Szolgáltatások** (`/szolgaltatasok`) | Név, leírás, ár, időtartam, **Aktív/Inaktív** kapcsoló szolgáltatásonként (inaktív = nem foglalható, de nem törölt) |
| **Nyitvatartás** (`/nyitvatartas`) | Heti nyitvatartási sávok naponta, "másolás minden napra" gyorsgomb, **szünet (puffer)** beállítása két foglalás között |
| **Megosztás** (`/megosztas`) | Publikus foglalási link + másolás, QR-kód (letölthető), Facebook-megosztás gomb, `.ics` naptár-feed link |

## Publikus foglalási oldal (`app/foglalas/[slug]`)

Nem csak egy foglalási form, hanem egy mini brandelt landing page: borítókép/logó (vagy elegáns alapértelmezett megjelenés fotó nélkül), elérhetőség-sor (telefon, weboldal, közösségi linkek), leírás, szolgáltatás-előnézeti kártyák, majd a foglalási widget. Regisztráció nélkül foglalható.

### Foglalási folyamat és versenyhelyzet-védelem

1. Vendég kiválaszt egy szolgáltatást és dátumot → `get_available_slots` RPC visszaadja a szabad, 30 perces rácsra igazított kezdő-időpontokat (nyitvatartás − meglévő foglalások/zárolások − szünet-puffer).
2. Sávra kattintva a rendszer **azonnal, valódi 5 perces zárolást (hold)** hoz létre a szerveren (`create_hold` RPC) — eddig a pontig csak vizuális kiválasztás volt, mostantól tényleges adatbázis-szintű foglalás, GiST kizárási megszorítással védve. Amíg a zárolás él, senki más (más vendég, másik böngészőfül) nem kaphatja meg ugyanazt vagy egy átfedő időpontot.
3. Az űrlapon látható visszaszámláló mutatja, mennyi idő van hátra. Beküldéskor a `create_booking` RPC a zárolást váltja be végleges foglalássá; ha időközben lejárt vagy elveszett, friss validáción megy át (sosem enged át ütközést).
4. Ha a vendég másik sávra vált vagy elhagyja az oldalt, a zárolás azonnal (vagy legkésőbb 5 percen belül automatikusan) felszabadul — a felszabadítás `keepalive` fetch-csel megy, hogy lapváltás/frissítés közben is célba érjen.

### Szünet (puffer) két foglalás között

Szolgáltatónként beállítható (0–180 perc), és minden meglévő foglalás **mindkét oldalán** szimmetrikusan érvényesül — tehát 15 perces puffer mellett egy 12:00–13:00-ás foglalás után a következő időpont csak 13:15-től ajánlható fel. Egységesen érvényesül a publikus foglalásnál és a dashboard manuális felvitelénél is.

## Naptár-szinkron

Egyirányú, feliratkozásos `.ics` feed (`app/api/ics/[token]/route.ts`) — a szolgáltató egyszer beteszi a linket a Google/Apple naptárába, az új foglalások automatikusan megjelennek benne (nem valós idejű, nincs kétirányú írás). A vendég a visszaigazoló képernyőn egy kliens-oldalon generált, egy-eseményes `.ics` letöltést is kap ("Hozzáadás a naptárhoz").

## Adatbázis és biztonsági modell

- **RLS mindenhol bekapcsolva.** A szolgáltató csak a saját sorait látja/módosítja (`auth.uid() = provider_id`/`id`).
- **Nincs service-role kulcs használatban.** A vendég-oldali (anon) hozzáférés kizárólag `SECURITY DEFINER` RPC-ken keresztül történik (`get_public_provider`, `get_available_slots`, `create_hold`, `release_hold`, `create_booking`), amik pontosan a szükséges, publikus mezőket adják ki és minden validációt szerver-oldalon, újra elvégeznek.
- **Dupla-foglalás elleni védelem két rétegben:** (1) alkalmazás-szintű validáció az RPC-kben (nyitvatartás, puffer, aktív szolgáltatás), (2) egy GiST **kizárási megszorítás** (`bookings_no_overlap`) az adatbázisban, ami versenyhelyzetben is garantálja, hogy két `confirmed`/`pending` foglalás sosem fedheti át egymást ugyanannál a szolgáltatónál.
- **Storage:** `provider-media` bucket (publikus olvasás, tulajdonos csak a saját `{auth.uid()}/…` mappájába írhat), logó/borítókép feltöltéshez.

## Verziótörténet

| Tag | Tartalom |
|---|---|
| `v0.1.0` | Marketing oldal + szolgáltatói regisztráció/bejelentkezés + alap profil/szolgáltatás-kezelés |
| `v0.2.0` | Foglalási rendszer: nyitvatartás, publikus foglalási oldal, `.ics` szinkron |
| `v0.3.0` | Irányítópult-átalakítás: Apple-stílusú menük, bővített profil (logó/borítókép, közösségi linkek), szolgáltatás description/active, foglalási link megosztás (QR, Facebook) |
| `v0.4.0` | Szünet (puffer) két időpont között + időpont-zárolás (hold) versenyhelyzet ellen |
| `v0.5.0` | Eseti (nem ismétlődő) nyitvatartás-kizárások (`provider_blocks`) + strukturált lemondás-kezelés Resend-alapú email-értesítéssel |
| `v0.6.0` | Interaktív megyés térkép a "Böngéssz település szerint" szekcióban; munkatársak (staff) egy profilon belül — saját nyitvatartás/naptár dolgozónként, staff-választó a foglalási flow-ban |
| `v0.7.0` | A megyés térkép felköltözött a Hero keresőjébe (kattintással kitölti a Település mezőt); a Hero keresője kibővült működő dátum-szűrővel és Alkalom-szűrővel |

## Amit tudatosan később hagytunk

- Valós idejű, **kétirányú** Google/Apple naptár-szinkron (Google Calendar API + OAuth-app,
  Google-ellenőrzéssel és token-tárolással — külön, nagyobb projekt; a jelenlegi
  egyirányú `.ics` feed kiváltása).
- Több munkatárs / több oszlopos naptár egy szolgáltatónál.
- Vendég-oldali visszaigazoló/emlékeztető e-mailek (csak a szolgáltató általi *lemondás* értesít emailben, ld. lent) — ehhez a Supabase beépített e-mailje nem elég, csak auth-ra való.
- Fizetés/előleg, vendég-oldali átfoglalás/lemondás.

## Auth e-mail sablonok (Supabase)

A regisztráció megerősítő, a "belépés linkkel" és a jelszó-visszaállító levelet
a Supabase küldi, nem az alkalmazás — ezek tartalma **nem** a kódból jön, hanem a
Supabase projekt beállításaiból. A brandelt, magyar sablonok (amikben ott van a
weboldal és a bejelentkezés linkje is) a [`supabase/email-templates/`](./supabase/email-templates/)
mappában vannak, a bemásolás menetével együtt. Amíg ezek nincsenek beillesztve a
Supabase Dashboardon, az alapértelmezett angol sablonok mennek ki.

## Üzemeltetői értesítő e-mailek (Resend)

- **Új szolgáltatói regisztráció** → `lib/email/sendProviderSignupNotificationEmail.ts`.
  Minden sikeres regisztráció után azonnal kimegy egy értesítő a jóváhagyó panel
  (`/admin/szolgaltatok?status=pending`) linkjével, hogy ne kelljen kézzel nézegetni
  a listát. Szándékosan "best effort": ha nincs `RESEND_API_KEY`, vagy a küldés
  elhasal, a regisztráció attól még sikeres.
- **"Egyéb" kategória kérése** → `lib/email/sendCategoryRequestEmail.ts`. Ha a
  szolgáltató a profilban az „Egyéb” kategóriát választja és beírja, milyen
  megnevezést kér, arról értesítő megy ki (a kérés emellett a `providers.category_other`
  oszlopban és az admin listában is látszik).

A címzettet az `ADMIN_NOTIFICATION_EMAIL` env-változó adja (vesszővel több cím is),
alapértelmezésben a `lib/contact.ts`-beli `SUPPORT_EMAIL`.

## Lemondás-értesítő email (Resend)

Ha a szolgáltató a `/dashboard` naptárban lemond egy foglalást, a rendszer — ha a vendégnek van rögzített email címe — automatikus értesítőt küld neki a Resend API-n keresztül (`lib/email/sendCancellationEmail.ts`). Ehhez a `RESEND_API_KEY` környezeti változó beállítása **és** egy verifikált küldő domain szükséges a Resend fiókban (ld. `.env.local.example`); enélkül a lemondás önmagában továbbra is működik, csak email nem megy ki — ekkor a felület jelzi, hogy érdemes telefonon is értesíteni a vendéget.

## Fejlesztői környezet

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

Szükséges `.env.local` (ld. `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Supabase oldalon a `supabase/schema*.sql` fájlokat kell egyszer, sorrendben (schema → v2 → v3 → v4) lefuttatni az SQL Editorban. Új service-role kulcs vagy egyéb env-változó nem szükséges — minden anon-oldali hozzáférés a fent leírt RPC-ken keresztül, biztonságosan történik.
