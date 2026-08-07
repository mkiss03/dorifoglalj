"use client";

import { useActionState, useRef } from "react";
import { Camera } from "lucide-react";
import { deleteStaffAction, updateStaffAction, updateStaffPhotoAction, type StaffState } from "./actions";
import type { MediaState } from "./actions";
import type { ProviderService, StaffMemberWithServices } from "@/lib/supabase/types";

const initialStaffState: StaffState = { status: "idle" };
const initialMediaState: MediaState = { status: "idle" };

const inputClass =
  "w-full rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

function PhotoUploader({ staffId, photoUrl, name }: { staffId: string; photoUrl: string | null; name: string }) {
  const [state, formAction] = useActionState(updateStaffPhotoAction, initialMediaState);
  const formRef = useRef<HTMLFormElement>(null);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <form ref={formRef} action={formAction} className="relative h-14 w-14 shrink-0">
      <input type="hidden" name="staff_id" value={staffId} />
      <div className="h-14 w-14 overflow-hidden rounded-full bg-accent-light">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-lg text-accent-dark">
            {initial}
          </div>
        )}
      </div>
      <label className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-ink text-paper shadow-card transition-colors hover:bg-ink/90">
        <Camera className="h-3 w-3" strokeWidth={2.5} />
        <input
          type="file"
          name="photo"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={() => formRef.current?.requestSubmit()}
        />
      </label>
      {state.status === "error" && <p className="absolute top-full mt-1 w-32 text-[10px] text-red-700">{state.message}</p>}
    </form>
  );
}

export function StaffCard({ staff, services }: { staff: StaffMemberWithServices; services: ProviderService[] }) {
  const [state, formAction, pending] = useActionState(updateStaffAction, initialStaffState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteStaffAction, initialStaffState);

  return (
    <div className="shadow-card rounded-2xl bg-paper-alt/60 p-3">
      <div className="flex items-start gap-3">
        <PhotoUploader staffId={staff.id} photoUrl={staff.photo_url} name={staff.name} />

        <form action={formAction} className="min-w-0 flex-1 space-y-2">
          <input type="hidden" name="id" value={staff.id} />
          <div className="flex flex-wrap gap-2">
            <input name="name" defaultValue={staff.name} className={`${inputClass} min-w-[8rem] flex-1`} placeholder="Név" />
            <input
              name="specialty"
              defaultValue={staff.specialty ?? ""}
              className={`${inputClass} min-w-[8rem] flex-1`}
              placeholder="Specialitás (pl. Körmös)"
            />
          </div>

          {services.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                  <input
                    type="checkbox"
                    name="service_ids"
                    value={s.id}
                    defaultChecked={staff.service_ids.includes(s.id)}
                    className="h-3.5 w-3.5 accent-accent-dark"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft">
              <input type="checkbox" name="active" defaultChecked={staff.active} className="h-3.5 w-3.5 accent-accent-dark" />
              Aktív
            </label>
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
            >
              {pending ? "Mentés…" : "Mentés"}
            </button>
            <button
              type="submit"
              formAction={deleteFormAction}
              disabled={deletePending}
              className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
            >
              Törlés
            </button>
          </div>

          {state.status !== "idle" && (
            <p className={"text-xs " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>{state.message}</p>
          )}
          {deleteState.status === "error" && <p className="text-xs text-red-700">{deleteState.message}</p>}
        </form>
      </div>
    </div>
  );
}
