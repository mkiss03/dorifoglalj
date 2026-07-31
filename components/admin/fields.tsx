"use client";

import { Reorder } from "motion/react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { ImageField } from "./ImageField";
import type { ItemFieldDef, ScalarKind } from "@/lib/content/types";

export const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none focus:ring-2 focus:ring-accent-light";
export const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

export type RepeaterItem = { id: string; [key: string]: unknown };

export function ScalarControl({
  kind,
  label,
  value,
  onChange,
  contentKey,
}: {
  kind: ScalarKind;
  label: string;
  value: string;
  onChange: (v: string) => void;
  contentKey: string;
}) {
  if (kind === "image") {
    return <ImageField label={label} contentKey={contentKey} value={value || null} onChange={(url) => onChange(url ?? "")} />;
  }
  if (kind === "textarea" || kind === "richtext") {
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <textarea
          rows={kind === "richtext" ? 5 : 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {kind === "richtext" && <p className="mt-1 text-[11px] text-ink-soft">Üres sor = új bekezdés.</p>}
      </div>
    );
  }
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}

export function StringListField({
  label,
  itemLabel,
  items,
  onChange,
}: {
  label: string;
  itemLabel: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function update(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className={`${inputClass} flex-1 !py-2 text-sm`}
            />
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-panel disabled:opacity-25"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-panel disabled:opacity-25"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-panel hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 flex items-center gap-1.5 rounded-full bg-paper-alt px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-panel"
      >
        <Plus className="h-3.5 w-3.5" /> {itemLabel}
      </button>
    </div>
  );
}

function FieldControlDispatch({
  field,
  value,
  onChange,
  contentKey,
}: {
  field: ItemFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  contentKey: string;
}) {
  if (field.kind === "stringlist") {
    return (
      <StringListField
        label={field.label}
        itemLabel={field.itemLabel}
        items={(value as string[]) ?? []}
        onChange={onChange}
      />
    );
  }
  if (field.kind === "sublist") {
    return (
      <div>
        <p className={labelClass}>{field.label}</p>
        <RepeaterField
          mode="free"
          itemLabel={field.itemLabel}
          fields={field.fields}
          items={(value as RepeaterItem[]) ?? []}
          onChange={onChange}
          contentKeyPrefix={contentKey}
        />
      </div>
    );
  }
  return (
    <ScalarControl kind={field.kind} label={field.label} value={(value as string) ?? ""} onChange={onChange} contentKey={contentKey} />
  );
}

function blankItem(fields: ItemFieldDef[]): RepeaterItem {
  const item: RepeaterItem = { id: crypto.randomUUID() };
  for (const f of fields) {
    if (f.kind === "stringlist" || f.kind === "sublist") item[f.key] = [];
    else if (f.kind === "image") item[f.key] = null;
    else item[f.key] = "";
  }
  return item;
}

/** Generikus, listás mező-szerkesztő — `fixed` módban csak helyben
 * szerkesztés + átrendezés, `free` módban hozzáadás/törlés is. Rekurzívan
 * önmagát hívja a beágyazott "sublist" mezőknél (pl. footer.columns[].links). */
export function RepeaterField({
  mode,
  itemLabel,
  fields,
  items,
  onChange,
  contentKeyPrefix,
}: {
  mode: "fixed" | "free";
  itemLabel: string;
  fields: ItemFieldDef[];
  items: RepeaterItem[];
  onChange: (items: RepeaterItem[]) => void;
  contentKeyPrefix: string;
}) {
  function patchItem(id: string, patch: Record<string, unknown>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function removeItem(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div>
      <Reorder.Group
        axis="y"
        values={items.map((it) => it.id)}
        onReorder={(ids) => onChange(ids.map((id) => items.find((it) => it.id === id)!))}
        className="space-y-3"
      >
        {items.map((item) => (
          <Reorder.Item key={item.id} value={item.id} className="shadow-card rounded-2xl bg-white p-4">
            <div className="flex items-start gap-2">
              <span className="mt-2.5 shrink-0 cursor-grab text-ink-soft/40 active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                {fields.map((f) => (
                  <FieldControlDispatch
                    key={f.key}
                    field={f}
                    value={item[f.key]}
                    onChange={(v) => patchItem(item.id, { [f.key]: v })}
                    contentKey={`${contentKeyPrefix}-${item.id}-${f.key}`}
                  />
                ))}
              </div>
              {mode === "free" && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="mt-2 shrink-0 text-ink-soft/50 transition-colors hover:text-red-700"
                  aria-label={`${itemLabel} törlése`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {mode === "free" && (
        <button
          type="button"
          onClick={() => onChange([...items, blankItem(fields)])}
          className="mt-3 flex items-center gap-1.5 rounded-full bg-paper-alt px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-panel"
        >
          <Plus className="h-3.5 w-3.5" /> {itemLabel} hozzáadása
        </button>
      )}
    </div>
  );
}
