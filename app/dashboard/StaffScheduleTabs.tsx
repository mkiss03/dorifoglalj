"use client";

import { useState } from "react";
import { AvailabilitySection } from "./AvailabilitySection";
import { BlocksSection } from "./BlocksSection";
import type { Availability, ProviderBlock, StaffMember } from "@/lib/supabase/types";

export function StaffScheduleTabs({
  staff,
  availability,
  blocks,
}: {
  staff: StaffMember[];
  availability: Availability[];
  blocks: ProviderBlock[];
}) {
  const [selectedId, setSelectedId] = useState(staff[0]?.id ?? "");

  const staffAvailability = availability.filter((a) => a.staff_id === selectedId);
  const staffBlocks = blocks.filter((b) => b.staff_id === selectedId);

  return (
    <div>
      {staff.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {staff.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors " +
                (selectedId === s.id ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel")
              }
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <AvailabilitySection key={`av-${selectedId}`} staffId={selectedId} availability={staffAvailability} />

      <BlocksSection
        key={`bl-${selectedId}`}
        staffId={selectedId}
        blocks={staffBlocks}
        allowAllStaff={staff.length > 1}
      />
    </div>
  );
}
