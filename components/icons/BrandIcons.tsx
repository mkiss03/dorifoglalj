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

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.34 12.78L3.5 20.5l4.35-1.14A8.5 8.5 0 1 0 12 3.5Z"
        fill="currentColor"
        opacity={0.14}
      />
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.34 12.78L3.5 20.5l4.35-1.14A8.5 8.5 0 1 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M9.1 8.6c.2-.45.4-.46.6-.47.16 0 .34 0 .49.01.16.01.37-.02.58.44.21.47.72 1.63.78 1.75.06.12.1.27.02.43-.08.16-.13.26-.25.4-.13.14-.27.31-.38.42-.13.12-.26.26-.11.5.14.24.63 1.04 1.36 1.68.94.83 1.72 1.09 1.97 1.21.25.12.4.1.55-.06.15-.16.63-.73.79-.99.16-.25.33-.21.55-.13.22.08 1.42.67 1.66.79.25.12.41.19.47.29.06.11.06.61-.14 1.2-.2.59-1.16 1.13-1.6 1.19-.41.06-.92.09-1.49-.09-.34-.11-.79-.26-1.36-.5-2.39-1.03-3.96-3.45-4.08-3.61-.12-.16-.98-1.3-.98-2.48 0-1.18.62-1.76.84-2Z"
        fill="currentColor"
      />
    </svg>
  );
}
