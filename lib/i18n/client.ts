'use client';

// Overlay de traducciones EN para client components: pide el JSON a
// /api/i18n/[coleccion] y lo mezcla por id sobre los datos ES en vivo.
// Si un id no tiene traducción, el doc queda en español — nunca se rompe.

export type OverlayEn = Record<string, Record<string, unknown>>;

export async function fetchOverlayEn(coleccion: string): Promise<OverlayEn> {
  try {
    const r = await fetch(`/api/i18n/${coleccion}`);
    if (!r.ok) return {};
    return (await r.json()) as OverlayEn;
  } catch {
    return {};
  }
}

/** Mezcla superficial: campos traducidos pisan a los ES; el resto queda igual. */
export function aplicarOverlay<T extends { id: string }>(items: T[], overlay: OverlayEn): T[] {
  return items.map((item) => {
    const t = overlay[item.id];
    return t ? { ...item, ...t } : item;
  });
}

/** Overlay de un solo doc. */
export function aplicarOverlayDoc<T extends { id?: string }>(doc: T, overlay: OverlayEn, id?: string): T {
  const key = id ?? doc.id;
  if (!key) return doc;
  const t = overlay[key];
  return t ? { ...doc, ...t } : doc;
}
