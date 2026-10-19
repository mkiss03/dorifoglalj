export function formatStartsAt(iso: string): string {
  const formatted = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Budapest", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

export function formatHuf(price: number): string {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}
