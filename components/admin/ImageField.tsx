"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadSiteImageAction } from "@/app/admin/(gated)/szerkeszto/actions";

export function ImageField({
  label,
  contentKey,
  value,
  onChange,
}: {
  label: string;
  contentKey: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("content_key", contentKey);
    const result = await uploadSiteImageAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) onChange(result.url);
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-paper-alt">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-soft/50">
              <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full bg-paper-alt px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} />}
            {pending ? "Feltöltés…" : value ? "Csere" : "Feltöltés"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-red-700"
            >
              <X className="h-3 w-3" strokeWidth={2} />
              Eltávolítás
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}
