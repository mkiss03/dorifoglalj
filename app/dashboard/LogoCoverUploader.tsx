"use client";

import { useActionState, useRef } from "react";
import { Camera } from "lucide-react";
import { updateCoverAction, updateLogoAction, type MediaState } from "./actions";
import type { Provider } from "@/lib/supabase/types";

const initialState: MediaState = { status: "idle" };

function CoverUploader({ coverUrl }: { coverUrl: string | null }) {
  const [state, formAction] = useActionState(updateCoverAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="relative h-36 w-full overflow-hidden sm:h-44">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-accent-light to-panel" />
      )}
      <label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-card backdrop-blur transition-colors hover:bg-white">
        <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
        Borítókép csere
        <input
          type="file"
          name="cover"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={() => formRef.current?.requestSubmit()}
        />
      </label>
      {state.status === "error" && (
        <p className="absolute inset-x-3 bottom-14 rounded-xl bg-white/95 px-3 py-1.5 text-xs text-red-700 shadow-card">
          {state.message}
        </p>
      )}
    </form>
  );
}

function LogoUploader({ logoUrl, businessName }: { logoUrl: string | null; businessName: string }) {
  const [state, formAction] = useActionState(updateLogoAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const initial = businessName.trim().charAt(0).toUpperCase() || "?";

  return (
    <form ref={formRef} action={formAction} className="relative h-20 w-20 shrink-0">
      <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-accent-light shadow-card">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-accent-dark">
            {initial}
          </div>
        )}
      </div>
      <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-ink text-paper shadow-card transition-colors hover:bg-ink/90">
        <Camera className="h-3.5 w-3.5" strokeWidth={2.25} />
        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={() => formRef.current?.requestSubmit()}
        />
      </label>
      {state.status === "error" && (
        <p className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 rounded-xl bg-white px-2.5 py-1.5 text-center text-xs text-red-700 shadow-card">
          {state.message}
        </p>
      )}
    </form>
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
