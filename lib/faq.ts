export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Kell regisztrálnom?",
    answer:
      "Vendégként nem szükséges regisztrálnod ahhoz, hogy időpontot foglalj. A foglalás során elegendő megadnod az e-mail címedet, amelyre elküldjük a visszaigazolást, valamint a telefonszámodat, hogy a szolgáltató fel tudja veled venni a kapcsolatot, ha szükség lenne rá.\n\nSzolgáltatóként igen, az IdőpontNeked.hu-n való megjelenéshez regisztráció szükséges. A regisztráció után létrehozhatod saját szolgáltatói profilodat, feltöltheted szolgáltatásaidat, referencia munkáidat, áraidat, valamint beállíthatod a foglalható időpontjaidat.",
  },
  {
    question: "Hogyan tudok időpontot foglalni?",
    answer:
      "Az időpontfoglalás egyszerű és gyors:\n\n1. Válaszd ki a települést, ahol szolgáltatót keresel.\n2. Válaszd ki a számodra megfelelő szolgáltatást vagy kezelést.\n3. Az oldal megmutatja a releváns szolgáltatókat, akiknél megtekintheted a bemutatkozásukat, referencia munkáikat, áraikat és további szolgáltatásaikat.\n4. Válaszd ki a számodra szimpatikus szolgáltatót, majd foglalj időpontot egy szabad időpontra.\n\nA foglalásról e-mailben azonnal visszaigazolást kapsz.",
  },
  {
    question: "Ingyenes a vendégeknek?",
    answer:
      "Igen, a vendégek számára az IdőpontNeked.hu használata teljesen ingyenes. Nincs regisztrációs díj és nincs foglalási költség sem — ez soha nem is fog változni.",
  },
  {
    question: "Hogyan tudok szolgáltatóként csatlakozni?",
    answer:
      "A csatlakozás egyszerű és néhány lépésben elvégezhető: regisztrálj az IdőpontNeked.hu oldalon, hozd létre saját szolgáltatói profilodat, töltsd fel a szolgáltatásaidat, áraidat és referencia munkáidat, majd állítsd be a foglalható időpontjaidat.\n\nA folyamat elindításához kattints a „Szolgáltatóként csatlakozom” gombra, és kövesd az útmutatót.",
  },
  {
    question: "Lemondható vagy módosítható a foglalás?",
    answer:
      "Igen. A foglalás visszaigazoló e-mailjében találsz egy „Foglalás lemondása” és egy „Időpont módosítása” gombot is — ezekre kattintva a vendég önállóan, a szolgáltató megkeresése nélkül tudja rendezni a foglalását.\n\nLemondás vagy módosítás esetén mind a vendég, mind a szolgáltató automatikus értesítést kap. A foglalt időpont előtt emlékeztető e-mailt (később SMS-t is) küldünk, hogy senki ne felejtse el az időpontját.",
  },
];
