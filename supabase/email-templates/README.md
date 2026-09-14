# Supabase auth e-mail sablonok

Ezek a fájlok a Supabase által küldött **hitelesítési** e-mailek (regisztráció
megerősítése, belépés linkkel, jelszó-visszaállítás) tartalmát adják. A Supabase
ezeket nem a kódbázisból olvassa — **kézzel kell bemásolni** őket a projekt
beállításai közé. Amíg ez nem történik meg, a Supabase alapértelmezett, angol,
csupasz sablonjai mennek ki (ezekben nincs benne a weboldal linkje, ezért jött a
marketinges visszajelzés).

## Beillesztés — egyszeri, ~3 perc

1. Supabase Dashboard → a projekt → **Authentication → Emails** (régebbi
   felületen: Authentication → Email Templates).
2. Válaszd ki a sablont, kapcsold be a **Custom email** / forráskód nézetet.
3. Másold be a megfelelő fájl tartalmát (a fájl elején lévő HTML-kommentet nem
   kötelező bemásolni), és állítsd be a kommentben megadott tárgyat (Subject).
4. **Save**.

| Supabase sablon | Fájl | Tárgy |
|---|---|---|
| Confirm signup | `confirm-signup.html` | Erősítsd meg a regisztrációd – IdőpontNeked.hu |
| Magic Link | `magic-link.html` | Belépési linked – IdőpontNeked.hu |
| Reset Password | `reset-password.html` | Jelszó visszaállítása – IdőpontNeked.hu |

## Amit érdemes tudni

- A gombok a `{{ .ConfirmationURL }}` Supabase-változót használják, ami a
  projekt **Site URL** és **Redirect URLs** beállításai szerint épül fel
  (Authentication → URL Configuration). A Site URL legyen `https://idopontneked.hu`.
- A levelek alján mindig ott van a `https://idopontneked.hu` link és a
  bejelentkezési oldal linkje, hogy a címzett akkor is visszataláljon, ha
  később keresi elő a levelet.
- Ezek **nem** a Resend-en mennek ki, hanem a Supabase saját e-mail
  szolgáltatásán. A Resend csak az alkalmazás saját leveleit küldi
  (foglalás-lemondás, kapcsolatfelvétel, admin értesítők — `lib/email/`).
- Teszteléshez: regisztrálj egy még nem használt e-mail címmel, és nézd meg a
  beérkező levelet (a spam mappát is).
