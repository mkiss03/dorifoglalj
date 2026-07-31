/** Egységes elnevezési konvenció a mező-azonosítókhoz — ugyanezt hívja a
 * form (DOM id-hoz) és az élő előnézet kattintás-feloldója (kereséshez),
 * hogy a kettő garantáltan összhangban maradjon. */

export function itemAnchor(entryKey: string, itemId: string, fieldKey: string): string {
  return `${entryKey}-${itemId}-${fieldKey}`;
}

export function subItemAnchor(
  entryKey: string,
  itemId: string,
  fieldKey: string,
  subItemId: string,
  subFieldKey: string
): string {
  return `${itemAnchor(entryKey, itemId, fieldKey)}-${subItemId}-${subFieldKey}`;
}

/** A tényleges DOM `id` attribútum egy anchor-hoz — mindig ezzel a
 * prefix-szel, hogy ne ütközzön más oldalbeli id-kkal. */
export function domId(anchor: string): string {
  return `field-${anchor}`;
}
