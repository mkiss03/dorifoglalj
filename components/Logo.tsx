import { clsx } from "clsx";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("font-display tracking-tight text-ink", className)}>
      <span className="text-accent-dark">Időpont</span>Neked
      <span className="text-ink-soft font-normal">.hu</span>
    </span>
  );
}
