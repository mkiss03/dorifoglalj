"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { sendContactMessageAction, type ContactState } from "@/app/(marketing)/actions";

const initialState: ContactState = { status: "idle" };

const inputClass =
  "mt-1.5 w-full rounded-2xl bg-paper-alt px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";
const labelClass = "text-xs font-semibold text-ink-soft";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(sendContactMessageAction, initialState);

  // Escape zárja a modalt — ugyanaz a minta, mint a HungaryMap rögzített
  // tooltipjénél.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div className="shadow-sheet w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Írj nekünk</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bezárás"
            className="text-ink-soft/60 transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {state.status === "success" ? (
          <p className="mt-4 text-sm text-accent-dark">{state.message}</p>
        ) : (
          <form action={formAction} className="mt-4 space-y-3">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px]"
            />
            <div>
              <label className={labelClass}>Neved</label>
              <input type="text" name="name" required maxLength={100} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email címed</label>
              <input type="email" name="email" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Üzeneted</label>
              <textarea name="message" required rows={4} maxLength={2000} className={inputClass} />
            </div>

            {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
            >
              {pending ? "Küldés…" : "Üzenet küldése"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
