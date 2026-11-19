// Agente de hemeroteca: escribe el artículo de cada iniciativa que aún no lo
// tiene. Hasta noviembre de 2026 los artículos se escribieron en un solo lote
// (julio) y nadie generaba los de las iniciativas nuevas.
//
// Fuente: el texto oficial de la iniciativa (guardado por el agente de
// legislación en `textoFuente`, o releído de la Gaceta). Si no hay texto
// suficiente, no se escribe: un artículo sin fuente sería inventado.

import Anthropic from '@anthropic-ai/sdk';
import { Timestamp } from 'firebase-admin/firestore';
import { extractText, getDocumentProxy } from 'unpdf';
import { getAdminDb } from './firebase-admin';
import { limpiarHtml } from './gacetas/diputados';
import {
  MAX_TEXTO_FUENTE,
  MIN_TEXTO_FUENTE,
  ensamblarArticulo,
  localizarTexto,
  slugUnico,
  validarBorrador,
  type BorradorArticulo,
  type DatosIniciativa,
} from './hemeroteca-articulo';

const MODELO = 'claude-opus-5-5';
const LIMIT = Number(process.env.HEMEROTECA_LIMIT || 4); // artículos por corrida, en paralelo
const MAX_INTENTOS = 3; // tras 3 fallos la iniciativa deja de reintentarse
const DEADLINE_MS = 260_000; // dentro de los 300 s de la función
const TIMEOUT_FETCH_MS = 60_000; // la Gaceta llega a tardar >70 s en servir una parte
const TIMEOUT_CLAUDE_MS = 150_000;
const MAX_PDF_BYTES = 40_000_000;
const UA = 'Mozilla/5.0 (compatible; ObservatorioIAMexico/1.0; +https://www.observatorio-ia-mexico.com)';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1 });

const SYSTEM = `Eres el redactor de la hemeroteca del Observatorio IA México, un observatorio ciudadano que da seguimiento a la regulación de la inteligencia artificial en México.

Escribes la ficha periodística de UNA iniciativa legislativa a partir de su texto oficial. Reglas:
- Usa sólo lo que dice el texto oficial y los datos de la ficha. No inventes cifras, fechas, turnos, artículos ni posturas. Si un dato no está, no lo menciones.
- Español neutro, sobrio, claro, para público general informado. Nada de adjetivos promocionales ni de opinión.
- Markdown simple: párrafos, **negritas**, *cursivas*, listas con "- " y subtítulos "## ". Sin tablas, sin imágenes, sin HTML.
- No escribas el título con "# " ni una sección de fuentes: eso lo agrega el sistema.

Estructura del campo "cuerpo":
1. Primer párrafo que empieza exactamente con "**Qué es.**" y explica en 1-3 oraciones qué propone.
2. Segundo párrafo con "**Quién.** … **Cuándo.** … **Estatus.** …" usando los datos de la ficha.
3. Una a tres secciones "## " que expliquen el contenido concreto: qué artículos reforma o adiciona, qué obligaciones, prohibiciones o principios impone, y a quién aplica.
4. Una sección "## Por qué importa" con el contexto que se desprende del propio texto (la exposición de motivos), sin especular.

"titulo": corto y descriptivo (máximo ~110 caracteres), que diga de qué trata; no copies el "Que reforma…" oficial.
"resumen": una o dos oraciones (máximo ~300 caracteres).
"esSobreIA": false si el texto en realidad no trata de inteligencia artificial (sólo la menciona de paso); en ese caso los demás campos pueden ir vacíos.`;

const SCHEMA = {
  type: 'object',
  properties: {
    esSobreIA: { type: 'boolean' },
    titulo: { type: 'string' },
    resumen: { type: 'string' },
    cuerpo: { type: 'string' },
  },
  required: ['esSobreIA', 'titulo', 'resumen', 'cuerpo'],
  additionalProperties: false,
};

function fechaIso(v: unknown): string | undefined {
  if (!v) return undefined;
  const d = (v as { toDate?: () => Date }).toDate ? (v as { toDate: () => Date }).toDate() : new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

async function textoDeGaceta(url: string): Promise<string | null> {
  const limpia = url.split('#')[0];
  const r = await fetch(limpia, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(TIMEOUT_FETCH_MS), cache: 'no-store' });
  if (!r.ok) throw new Error(`Gaceta respondió ${r.status}`);
  const anunciado = Number(r.headers.get('content-length') || 0);
  if (anunciado > MAX_PDF_BYTES) throw new Error(`documento de ${anunciado} bytes`);
  const bytes = new Uint8Array(await r.arrayBuffer());
  const ct = r.headers.get('content-type') || '';
  const esPdf = ct.includes('pdf') || (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46);
  if (esPdf) {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return String(text).replace(/\s+/g, ' ').trim();
  }
  const enc = /iso-8859-1|latin1|windows-1252/i.test(ct) || limpia.includes('gaceta.diputados.gob.mx') ? 'iso-8859-1' : 'utf-8';
  return limpiarHtml(new TextDecoder(enc).decode(bytes));
}

async function obtenerFuente(d: Record<string, unknown>): Promise<{ texto: string; origen: string } | { error: string }> {
  const guardado = typeof d.textoFuente === 'string' ? d.textoFuente : '';
  if (guardado.length >= MIN_TEXTO_FUENTE) return { texto: guardado.slice(0, MAX_TEXTO_FUENTE), origen: 'textoFuente' };

  const url = typeof d.urlGaceta === 'string' ? d.urlGaceta : '';
  if (!url) return { error: 'sin_texto: no hay textoFuente ni urlGaceta' };
  const pagina = await textoDeGaceta(url);
  if (!pagina) return { error: 'sin_texto: la Gaceta no devolvió contenido' };
  const tramo = localizarTexto(pagina, String(d.titulo ?? ''), String(d.descripcion ?? ''));
  if (!tramo) return { error: 'sin_texto: no se encontró la iniciativa en la página de la Gaceta' };
  if (tramo.length < MIN_TEXTO_FUENTE) return { error: `sin_texto: sólo ${tramo.length} caracteres en la Gaceta` };
  return { texto: tramo, origen: 'gaceta' };
}

async function redactar(ini: DatosIniciativa, texto: string, signal: AbortSignal) {
  const ficha = [
    `Título oficial: ${ini.titulo}`,
    ini.camara && `Cámara: ${ini.camara}`,
    ini.proponente && `Proponente: ${ini.proponente}${ini.partido ? ` (${ini.partido})` : ''}`,
    ini.fecha && `Fecha de presentación: ${ini.fecha}`,
    ini.estatus && `Estatus en el Observatorio: ${ini.estatus}`,
  ].filter(Boolean).join('\n');

  const respuesta = await anthropic.beta.messages.create(
    {
      model: MODELO,
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `<ficha>\n${ficha}\n</ficha>\n\n<texto_oficial>\n${texto}\n</texto_oficial>\n\nEscribe la ficha de la hemeroteca para esta iniciativa.`,
        },
      ],
    },
    { signal, timeout: TIMEOUT_CLAUDE_MS },
  );

  if (respuesta.stop_reason === 'refusal') throw new Error('el modelo rechazó la solicitud');
  if (respuesta.stop_reason === 'max_tokens') throw new Error('respuesta cortada por max_tokens');
  const bloque = respuesta.content.find((b) => b.type === 'text');
  if (!bloque || bloque.type !== 'text') throw new Error('respuesta sin texto');
  return {
    borrador: JSON.parse(bloque.text) as BorradorArticulo,
    uso: { input: respuesta.usage.input_tokens, output: respuesta.usage.output_tokens, modelo: respuesta.model },
  };
}

export async function ejecutarAgenteHemeroteca(trigger: 'cron' | 'manual' = 'manual') {
  const startTime = Date.now();
  const db = getAdminDb();
  const errores: string[] = [];
  const publicados: Array<{ id: string; slug: string; titulo: string }> = [];
  const omitidos: Array<{ id: string; motivo: string }> = [];
  let tokensEntrada = 0;
  let tokensSalida = 0;

  try {
    const snap = await db.collection('iniciativas').get();
    const slugs = new Set<string>();
    const pendientes: Array<{ id: string; data: Record<string, unknown> }> = [];
    for (const doc of snap.docs) {
      const d = doc.data();
      if (d.articuloSlug) slugs.add(String(d.articuloSlug));
      if (d.articuloMD) continue;
      if (Number(d.articuloIntentos ?? 0) >= MAX_INTENTOS) continue;
      if (d.oculto === true) continue;
      pendientes.push({ id: doc.id, data: d });
    }
    // Más recientes primero: lo nuevo aparece pronto y el rezago se va cubriendo detrás.
    pendientes.sort((a, b) => (fechaIso(b.data.fecha) ?? '').localeCompare(fechaIso(a.data.fecha) ?? ''));
    const lote = pendientes.slice(0, LIMIT);

    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), DEADLINE_MS);

    const resultados = await Promise.allSettled(
      lote.map(async ({ id, data }) => {
        const ini: DatosIniciativa = {
          id,
          titulo: String(data.titulo ?? ''),
          fecha: fechaIso(data.fecha),
          camara: data.camara ? String(data.camara) : undefined,
          proponente: data.proponente ? String(data.proponente) : undefined,
          partido: data.partido ? String(data.partido) : undefined,
          estatus: data.estatus ? String(data.estatus) : data.status ? String(data.status) : undefined,
          tipo: data.tipo ? String(data.tipo) : undefined,
          urlGaceta: data.urlGaceta ? String(data.urlGaceta) : undefined,
          urlPDFBackup: data.urlPDFBackup ? String(data.urlPDFBackup) : undefined,
        };
        const ref = db.collection('iniciativas').doc(id);
        const registrarFallo = async (motivo: string, definitivo = false) => {
          omitidos.push({ id, motivo });
          await ref.update({
            articuloIntentos: definitivo ? MAX_INTENTOS : Number(data.articuloIntentos ?? 0) + 1,
            articuloUltimoError: motivo.slice(0, 300),
          });
        };

        const fuente = await obtenerFuente(data);
        if ('error' in fuente) return registrarFallo(fuente.error);

        const { borrador, uso } = await redactar(ini, fuente.texto, controller.signal);
        tokensEntrada += uso.input;
        tokensSalida += uso.output;

        const v = validarBorrador(borrador);
        if (!v.ok) return registrarFallo(`borrador rechazado: ${v.motivo}`, v.motivo === 'no_es_ia');

        const slug = slugUnico(v.borrador.titulo, slugs);
        slugs.add(slug);
        await ref.update({
          articuloMD: ensamblarArticulo(ini, v.borrador, slug),
          articuloSlug: slug,
          articuloResumen: v.borrador.resumen,
          articuloActualizado: Timestamp.now(),
          articuloGeneracion: { metodo: 'agente-hemeroteca', modelo: uso.modelo, fuente: fuente.origen },
          articuloUltimoError: null,
        });
        publicados.push({ id, slug, titulo: v.borrador.titulo });
      }),
    );
    clearTimeout(deadline);

    resultados.forEach((r, i) => {
      if (r.status === 'rejected') {
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        errores.push(`"${String(lote[i].data.titulo ?? '').slice(0, 60)}": ${msg}`);
        // Un error técnico (red, API) también cuenta como intento para no ciclar.
        db.collection('iniciativas').doc(lote[i].id)
          .update({ articuloIntentos: Number(lote[i].data.articuloIntentos ?? 0) + 1, articuloUltimoError: msg.slice(0, 300) })
          .catch(() => {});
      }
    });

    const duracionMs = Date.now() - startTime;
    const restantes = pendientes.length - publicados.length;
    const success = lote.length === 0 || publicados.length > 0 || errores.length === 0;
    const partial = success && errores.length > 0;

    await db.collection('agenteLogs').add({
      tipo: 'hemeroteca',
      fecha: Timestamp.now(),
      duracionMs,
      publicados,
      omitidos,
      errores,
      pendientes: restantes,
      tokens: { entrada: tokensEntrada, salida: tokensSalida },
      trigger,
    });

    for (const p of publicados) {
      await db.collection('actividad').add({
        fecha: Timestamp.now(),
        tipo: 'nuevo_articulo',
        iniciativaId: p.id,
        descripcion: `Nuevo artículo en la hemeroteca: ${p.titulo}`,
      });
    }
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: !success ? 'agente_fallo' : partial ? 'agente_parcial' : 'agente_ejecutado',
      descripcion: !success
        ? `El agente de hemeroteca no pudo escribir ninguno de los ${lote.length} artículos del lote. El detalle quedó en el registro interno.`
        : `Agente de hemeroteca ejecutado. ${publicados.length} artículo(s) nuevo(s); ${restantes} iniciativa(s) siguen sin artículo.`,
    });

    return { success, partial, publicados, omitidos, errores, pendientes: restantes, duracionMs };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error('[HEMEROTECA] Error general:', error);
    try {
      await db.collection('actividad').add({
        fecha: Timestamp.now(),
        tipo: 'agente_fallo',
        descripcion: `El agente de hemeroteca falló: ${detalle.slice(0, 200)}`,
      });
    } catch { /* queda en la respuesta */ }
    return { success: false, partial: false, publicados, omitidos, errores: [...errores, detalle], pendientes: null, duracionMs: Date.now() - startTime };
  }
}
