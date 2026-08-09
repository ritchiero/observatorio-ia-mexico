// Monitoreo legislativo — el carril hacia la Ley General de IA.
// Selecciona de la colección `iniciativas` (autoridad de conteo, OIA-009) los
// proyectos que buscan el marco general: reformas al artículo 73 (facultar al
// Congreso), leyes generales/nacionales de IA y agencias reguladoras.
// El estatus refleja el de la fuente parlamentaria; cada ficha trae su fuente.

export interface IniciativaMonitoreo {
  id: string;
  titulo: string;
  fecha?: string;
  camara?: string;
  proponente?: string;
  partido?: string;
  estatus?: string;
}

const BASE = 'https://www.observatorio-ia-mexico.com';

// "Ley General/Nacional/Federal … de IA" explícita (no reformas a OTRAS
// leyes generales como Educación o LGRA, que solo comparten la palabra)
const RE_LEY_GENERAL = /ley\s+(general|nacional|federal)\s+[^.;]{0,70}?(inteligencia\s+artificial|\bIA\b)/i;
const RE_73 = /art[íi]culo\s*73\b/i;
const RE_FACULTAR = /facultar\s+al\s+congreso/i;
const RE_AGENCIA = /agencia\s+(nacional|reguladora|regulatoria)\s+[^.]{0,60}?(inteligencia\s+artificial|\bIA\b)|autoridad\s+especializada\s+en\s+(materia\s+de\s+)?(inteligencia|IA)/i;

export function esRumboLeyGeneral(i: { titulo?: unknown; descripcion?: unknown; tematicas?: unknown }): boolean {
  const titulo = String(i.titulo ?? '');
  const texto = `${titulo} ${String(i.descripcion ?? '')}`;
  const temas = Array.isArray(i.tematicas) ? (i.tematicas as unknown[]).map(String).join(' ') : '';
  // La rama de "ley nueva" se evalúa SOLO en el título y excluye reformas a
  // leyes existentes (LFT, LFDA, L.G. de Educación… solo comparten palabras).
  const leyNuevaDeIA = RE_LEY_GENERAL.test(titulo) && !/(reforma|adiciona|modifica|deroga)/i.test(titulo);
  return (
    RE_73.test(texto) ||
    RE_FACULTAR.test(texto) ||
    leyNuevaDeIA ||
    RE_AGENCIA.test(texto) ||
    /facultades_congreso|regulacion_integral/.test(temas)
  );
}

export async function iniciativasRumboLeyGeneral(): Promise<IniciativaMonitoreo[]> {
  try {
    const r = await fetch(`${BASE}/api/iniciativas`, { next: { revalidate: 1800 } });
    if (!r.ok) return [];
    const d = await r.json();
    const items = (d.data ?? d.iniciativas ?? []) as Array<Record<string, unknown>>;
    return items
      .filter(esRumboLeyGeneral)
      .map((i) => ({
        id: String(i.id),
        titulo: String(i.titulo ?? ''),
        fecha: typeof i.fecha === 'string' ? i.fecha : undefined,
        camara: typeof i.camara === 'string' ? i.camara : undefined,
        proponente: typeof i.proponente === 'string' ? i.proponente : undefined,
        partido: typeof i.partido === 'string' ? i.partido : undefined,
        estatus: String(i.estatus ?? i.status ?? ''),
      }))
      .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
  } catch {
    return [];
  }
}

// Camara legible y consistente (los datos traen variantes crudas)
export function camaraLegible(c?: string): string {
  const v = (c ?? '').toLowerCase();
  if (/diputad/.test(v)) return 'Diputados';
  if (/senad/.test(v)) return 'Senado';
  if (/congreso/.test(v)) return 'Congreso local';
  return c ?? '—';
}

// Tono del badge por familia de estatus (mismo criterio del catálogo público)
export function tonoEstatus(estatus?: string): 'verde' | 'ambar' | 'rojo' | 'gris' {
  const e = (estatus ?? '').toLowerCase();
  if (/aprobada|publicada/.test(e)) return 'verde';
  if (/desechad|archivad|rechazad/.test(e)) return 'rojo';
  if (/comision|discusion|turnada|presentad|proceso|elaboracion|recibida/.test(e)) return 'ambar';
  return 'gris';
}
