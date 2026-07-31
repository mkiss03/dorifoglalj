"use client";

import { useState, useTransition } from "react";
import { SchemaForm, SectionJumpNav } from "@/components/admin/SchemaForm";
import { MarketingPreview } from "@/components/admin/MarketingPreview";
import { saveSiteContentAction, type SaveContentState } from "./actions";
import type { SectionId, SiteContent } from "@/lib/content/types";

const initialSaveState: SaveContentState = { status: "idle" };

export function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<SaveContentState>(initialSaveState);

  function handleFieldChange(section: SectionId, field: string, value: unknown) {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, unknown>), [field]: value },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveSiteContentAction(draft);
      setState(result);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Oldal-szerkesztő</h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            Szerkeszd a nyitóoldal szövegeit és képeit — jobbra élőben látod a változást, Mentéskor azonnal élesbe kerül.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="shrink-0 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </div>
      {state.status !== "idle" && (
        <p className={`mt-2 text-sm ${state.status === "error" ? "text-red-700" : "text-accent-dark"}`}>{state.message}</p>
      )}

      <div className="mt-4">
        <SectionJumpNav />
      </div>

      <div className="mt-2 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div>
          <SchemaForm draft={draft} onFieldChange={handleFieldChange} />
        </div>
        <div className="shadow-sheet rounded-3xl bg-paper-alt p-3 lg:sticky lg:top-8">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Élő előnézet</p>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl bg-white">
            <MarketingPreview content={draft} />
          </div>
        </div>
      </div>
    </div>
  );
}
