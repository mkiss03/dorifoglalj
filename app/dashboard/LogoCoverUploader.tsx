"use client";

import { startTransition, useActionState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { updateCoverAction, updateLogoAction, type MediaState } from "./actions";
import { downscaleImage } from "@/lib/image/downscaleImage";
import type { Provider } from "@/lib/supabase/types";

const initialState: MediaState = { status: "idle" };

function useImageUpload(
  action: (prev: MediaState, formData: FormData) => Promise<MediaState>,
  fieldName: string,
  maxDimension: number
) {
  const [state, formAction, pending] = useActionState(action, initialState);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const prepared = await downscaleImage(file, maxDimension);
    const formData = new FormData();
    formData.set(fieldName, prepared);
    startTransition(() => formAction(formData));
    // Ugyanaz a fájl újra kiválasztható legyen (pl. sikertelen próba után).
    input.value = "";
  }

  return { state, pending, handleChange };
}

function CoverUploader({ coverUrl }: { coverUrl: string | null }) {
  const { state, pending, handleChange } = useImageUpload(updateCoverAction, "cover", 2000);

  return (
    <div className="relative h-36 w-full overflow-hidden sm:h-44">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className={`h-full w-full object-cover ${pending ? "opacity-60" : ""}`} />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-accent-light to-panel" />
      )}
      <label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-card backdrop-blur transition-colors hover:bg-white">
        <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
        {pending ? "Feltöltés…" : "Borítókép csere"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={pending}
          onChange={handleChange}
        />
      </label>
      {state.status === "error" && !pending && (
        <p className="absolute inset-x-3 bottom-14 rounded-xl bg-white/95 px-3 py-1.5 text-xs text-red-700 shadow-card">
          {state.message}
        </p>
      )}
    </div>
  );
}

function LogoUploader({ logoUrl, businessName }: { logoUrl: string | null; businessName: string }) {
  const { state, pending, handleChange } = useImageUpload(updateLogoAction, "logo", 800);
  const initial = businessName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative h-20 w-20 shrink-0">
      <div
        className={`h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-accent-light shadow-card ${pending ? "opacity-60" : ""}`}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-accent-dark">
            {initial}
          </div>
        )}
      </div>
      <label
        aria-label="Profilkép (logó) csere"
        className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-ink text-paper shadow-card transition-colors hover:bg-ink/90"
      >
        <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={pending}
          onChange={handleChange}
        />
      </label>
      {pending && (
        <p className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 text-center text-xs font-semibold text-ink-soft">
          Feltöltés…
        </p>
      )}
      {state.status === "error" && !pending && (
        <p className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 rounded-xl bg-white px-2.5 py-1.5 text-center text-xs text-red-700 shadow-card">
          {state.message}
        </p>
      )}
    </div>
  );
}

export function LogoCoverUploader({ provider }: { provider: Provider | null }) {
  return (
    <div className="relative">
      <CoverUploader coverUrl={provider?.cover_url ?? null} />
      <div className="absolute -bottom-10 left-6">
        <LogoUploader logoUrl={provider?.logo_url ?? null} businessName={provider?.business_name ?? ""} />
      </div>
    </div>
  );
}
