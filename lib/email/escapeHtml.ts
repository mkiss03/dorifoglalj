/** HTML-escape egy felhasználó által beírt szöveghez, mielőtt egy e-mail
 * HTML törzsébe kerül — a `text` (plain-text) változatba NEM kell, ott
 * nincs markup-interpretáció. Nélküle egy szolgáltatás-/vállalkozásnév
 * vagy indoklás mezőbe írt "<a href=...>" beékelődne a küldött HTML-be. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
