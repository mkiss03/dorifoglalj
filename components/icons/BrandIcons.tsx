export function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M15.5 8.5h-2.2c-.72 0-1.3.58-1.3 1.3V12h3.3l-.45 3h-2.85v8h-3v-8H7v-3h2.05V9.4C9.05 6.7 10.7 5 13.5 5h2v3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden
    >
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.65" fill="currentColor" stroke="none" />
    </svg>
  );
}
