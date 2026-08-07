import type { Metadata } from 'next';
import Link from 'next/link';

// Página de metodología — la gobernanza editorial del Observatorio, legible,
// cuestionable y reproducible. Nace del feedback externo de ago-2026: separar
// evidencia (origen de la fuente) de revisión (quién comprobó), publicar los
// criterios de estatus y dar un canal de correcciones. Server component:
// los conteos salen en vivo de las colecciones (regla OIA-009).

export const metadata: Metadata = {
  title: 'Metodología — cómo construimos el Observatorio',
  description:
    'Proceso, trazabilidad y criterios del Observatorio IA México: cómo se detecta, contrasta, clasifica y publica cada registro; qué significa cada estatus; y cómo reportar un error.',
  alternates: { canonical: '/metodologia', languages: { es: '/metodologia', en: '/en/metodologia' } },
};

const BASE = 'https://www.observatorio-ia-mexico.com';
const ISSUES_URL = 'https://github.com/ritchiero/observatorio-ia-mexico/issues/new';

async function conteos(): Promise<{ anuncios: number; iniciativas: number; casos: number }> {
  try {
    const [a, i, c] = await Promise.all([
      fetch(`${BASE}/api/anuncios`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`${BASE}/api/iniciativas`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`${BASE}/api/casos-ia`, { next: { revalidate: 3600 } }).then((r) => r.json()),
    ]);
    return {
      anuncios: (a.data ?? a.anuncios ?? []).length,
      iniciativas: (i.data ?? i.iniciativas ?? []).length,
      casos: (c.casos ?? c.data ?? []).length,
    };
  } catch {
    return { anuncios: 0, iniciativas: 0, casos: 0 };
  }
}

const PASOS = [
  { n: '01', titulo: 'Detectar', quien: 'Agentes', que: 'Rastreo continuo de fuentes gubernamentales, legislativas y judiciales (gob.mx, DOF, gacetas parlamentarias, SJF).', salida: 'Un hallazgo candidato con fuente, fecha, actor y enlace original.' },
  { n: '02', titulo: 'Normalizar', quien: 'Sistema', que: 'Homologación de nombres, fechas, dependencias y detección de duplicados contra lo ya publicado.', salida: 'Un registro único con campos estructurados.' },
  { n: '03', titulo: 'Contrastar', quien: 'Agente / persona', que: 'Comparación contra el documento primario o fuentes públicas verificables. Sin evidencia suficiente, el hallazgo no se publica.', salida: 'Evidencia enlazada y citada textualmente.' },
  { n: '04', titulo: 'Clasificar', quien: 'Reglas', que: 'Aplicación de los criterios públicos de estatus, tema y alcance (ver sección 04). Las etiquetas de confianza no las asigna nadie a mano: se derivan de la fuente.', salida: 'Estatus y clasificación reproducibles.' },
  { n: '05', titulo: 'Publicar', quien: 'Observatorio', que: 'La ficha sale con sus fuentes, su nivel de revisión y su folio. Ningún registro público sin una fuente accesible.', salida: 'Ficha pública con folio y trazabilidad.' },
  { n: '06', titulo: 'Monitorear', quien: 'Historial', que: 'Revisión de cambios de estatus, vencimientos y correcciones. Cada actualización material genera un evento público en la bitácora.', salida: 'Historial visible por registro.' },
];

const EJE_A = [
  { label: 'Fuente oficial', desc: 'La evidencia proviene de gob.mx, DOF, gacetas parlamentarias, SCJN/SJF, congresos u otro organismo público. Se deriva automáticamente del dominio de la fuente — nadie la asigna a mano.', tag: 'ORIGEN', tono: 'emerald' },
  { label: 'Fuente documentada', desc: 'Medio o documento público verificable (p. ej. un diario de circulación nacional), pendiente de corroboración con fuente primaria oficial.', tag: 'ORIGEN', tono: 'blue' },
  { label: 'Sin fuente accesible', desc: 'No se publica. El Observatorio no mantiene registros públicos sin una fuente consultable.', tag: 'REGLA', tono: 'gray' },
];

const EJE_B = [
  { label: 'Contraste automatizado', desc: 'Un agente comparó los campos del registro contra sus fuentes. No implica auditoría humana, y la ficha nunca lo presenta como tal.', tag: 'IA', tono: 'blue' },
  { label: 'Auditado por una persona', desc: 'Una persona revisó el registro contra su evidencia. Para contar como auditado debe quedar constancia de revisor y fecha.', tag: 'HUMANO', tono: 'emerald' },
  { label: 'Auditoría pendiente', desc: 'El registro se publica como provisional con su fuente a la vista, marcado "pendiente de auditoría humana", y se prioriza según su sensibilidad.', tag: 'PENDIENTE', tono: 'amber' },
];

const CRITERIOS = [
  { estatus: 'Prometido', emoji: '⚪', regla: 'Anunciado públicamente por una autoridad, sin evidencia de ejecución comprobable todavía.' },
  { estatus: 'En desarrollo', emoji: '🟡', regla: 'Existe avance concreto y verificable (contrato, obra, piloto, convocatoria), pero aún no está disponible para su población objetivo.' },
  { estatus: 'Operando', emoji: '🟢', regla: 'Hay evidencia pública de uso o disponibilidad real para la población objetivo. Operar no equivale a cumplir todo lo prometido: califica lo que ya funciona.' },
  { estatus: 'Concluido', emoji: '✅', regla: 'El compromiso tenía un alcance acotado (un evento, una entrega, una publicación) y ocurrió. Se cierra con su evidencia.' },
  { estatus: 'Incumplido', emoji: '🔴', regla: 'Venció una fecha expresa y verificable sin evidencia de cumplimiento. Sin plazo verificable no se declara incumplimiento: el registro permanece en su último estatus comprobable.' },
  { estatus: 'Abandonado', emoji: '⚫', regla: 'La autoridad canceló el compromiso o dejó de existir el programa que lo sostenía, con evidencia del abandono.' },
];

export default async function MetodologiaPage() {
  const n = await conteos();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero editorial */}
      <div className="bg-gray-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="font-sans-tech text-[11px] uppercase tracking-[0.22em] text-cyan-700 mb-4">Metodología · versión 2026.08</p>
          <h1 className="font-serif-display text-4xl md:text-6xl font-light text-gray-900 leading-[1.02] tracking-tight">
            Cómo construimos <em className="italic text-cyan-700">el Observatorio</em>.
          </h1>
          <p className="font-serif-display text-lg md:text-xl text-gray-600 mt-6 max-w-2xl leading-relaxed">
            Monitoreamos anuncios, legislación y casos judiciales de IA en el Estado mexicano. Los agentes automatizan la
            detección y el contraste inicial; cada ficha declara sus fuentes, su nivel de revisión y su historial.
            El método debe poder <strong className="text-gray-900 font-medium">leerse, cuestionarse y reproducirse</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-sans-tech text-sm text-gray-500">
            <span><strong className="text-gray-900">{n.anuncios}</strong> anuncios</span>
            <span><strong className="text-gray-900">{n.iniciativas}</strong> iniciativas</span>
            <span><strong className="text-gray-900">{n.casos}</strong> casos judiciales</span>
            <span className="text-gray-400">· conteos en vivo de las colecciones</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-24">

        {/* Compromiso editorial */}
        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-5">Compromiso editorial</h2>
          <ul className="grid md:grid-cols-2 gap-x-10 gap-y-4 font-sans-tech text-[15px] text-gray-700 leading-relaxed">
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>La automatización no se presenta como auditoría humana.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Publicamos el origen de cada afirmación y distinguimos entre fuente, revisión y estatus.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Ningún registro público sin una fuente accesible.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Las etiquetas de confianza se derivan de la fuente; no las asigna a mano quien captura.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Cada corrección editorial conserva su historial y genera un evento público.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Cuando el método cambia, se versiona aquí — no se parcha en silencio.</li>
          </ul>
        </section>

        {/* 01 Proceso */}
        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">01 · Proceso</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-8">Del hallazgo a la ficha pública.</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PASOS.map((p) => (
              <div key={p.n} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-mono text-cyan-600 text-sm">{p.n}</span>
                  <span className="font-sans-tech text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">{p.quien}</span>
                </div>
                <h4 className="font-sans-tech font-semibold text-gray-900 mb-2">{p.titulo}</h4>
                <p className="font-sans-tech text-sm text-gray-600 leading-relaxed mb-3">{p.que}</p>
                <p className="font-sans-tech text-xs text-gray-400 leading-relaxed"><span className="text-gray-500 font-medium">Salida:</span> {p.salida}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 02 Trazabilidad */}
        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">02 · Trazabilidad</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-3">Dos ejes para no confundir evidencia y revisión.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            «Fuente oficial» describe de dónde viene la evidencia — no quién la comprobó. Son ejes independientes y la
            ficha los muestra por separado. Hoy el Eje A se deriva automáticamente del dominio de cada fuente; los campos
            del Eje B se están desplegando ficha por ficha, y mientras tanto cada registro indica con honestidad si su
            auditoría humana sigue pendiente.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-sans-tech text-sm font-semibold text-gray-900 mb-4">Eje A · Origen de la fuente</h4>
              <div className="space-y-3">
                {EJE_A.map((e) => (
                  <div key={e.label} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans-tech font-medium text-gray-900 text-sm">{e.label}</span>
                      <span className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-full ${e.tono === 'emerald' ? 'bg-emerald-50 text-emerald-700' : e.tono === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{e.tag}</span>
                    </div>
                    <p className="font-sans-tech text-[13px] text-gray-600 leading-relaxed">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-sans-tech text-sm font-semibold text-gray-900 mb-4">Eje B · Nivel de revisión</h4>
              <div className="space-y-3">
                {EJE_B.map((e) => (
                  <div key={e.label} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans-tech font-medium text-gray-900 text-sm">{e.label}</span>
                      <span className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-full ${e.tono === 'emerald' ? 'bg-emerald-50 text-emerald-700' : e.tono === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{e.tag}</span>
                    </div>
                    <p className="font-sans-tech text-[13px] text-gray-600 leading-relaxed">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 03 Ejemplo de expediente (ficha real) */}
        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">03 · Ejemplo de expediente</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-3">La metodología se entiende en una ficha real.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            Cualquier persona debe poder reconstruir qué pasó desde el hallazgo hasta el estado actual. Este es un
            registro público real del Observatorio — incluida su auditoría humana pendiente, porque la transparencia
            aplica también a lo que falta.
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-5 md:px-7 py-4 border-b border-gray-200 flex flex-wrap items-center gap-2 justify-between">
              <span className="font-mono text-xs text-gray-500">LEG-2026-013 · registro público</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="font-sans-tech text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">Fuente oficial</span>
                <span className="font-sans-tech text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">Contraste automatizado</span>
                <span className="font-sans-tech text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">Auditoría humana pendiente</span>
              </div>
            </div>
            <div className="px-5 md:px-7 py-6">
              <h4 className="font-serif-display text-xl md:text-2xl text-gray-900 leading-snug mb-4">
                Regulación de IA para combatir violencia digital y deepfakes — reforma al Código Penal Federal y a la Ley
                de Acceso de las Mujeres a una Vida Libre de Violencia
              </h4>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 font-sans-tech text-sm mb-6">
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Fuente principal</dt><dd className="text-gray-900">Gaceta del Senado · LXVI Legislatura</dd></div>
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Proponente</dt><dd className="text-gray-900">Sen. Karen Castrejón Trujillo</dd></div>
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Estado legislativo</dt><dd className="text-gray-900">En comisiones</dd></div>
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Próxima acción</dt><dd className="text-gray-900">Confirmar dictaminación y conservar el documento primario</dd></div>
              </dl>
              <ol className="border-l-2 border-gray-200 pl-5 space-y-3 font-sans-tech text-sm text-gray-600 mb-6">
                <li><span className="font-mono text-xs text-gray-400 mr-2">04-feb-2026</span>Detectada en la Gaceta del Senado; se crea el registro con folio público.</li>
                <li><span className="font-mono text-xs text-gray-400 mr-2">04-feb-2026</span>Contraste inicial: proponente, fecha y objeto contra la fuente parlamentaria.</li>
                <li><span className="font-mono text-xs text-gray-400 mr-2">2026</span>Publicada como provisional, con su fuente a la vista y marcada para auditoría humana.</li>
              </ol>
              <Link href="/legislacion/lqMENbXyrHBr9JI88cxd" className="font-sans-tech text-sm text-cyan-700 hover:text-cyan-900 font-medium">
                Abrir la ficha completa →
              </Link>
            </div>
          </div>
        </section>

        {/* 04 Criterios */}
        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">04 · Criterios</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-3">Qué significa cada estatus.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            Estos son los seis estatus del catálogo de anuncios — el mismo criterio aunque cambie el tema o la
            institución. Todo total mostrado en el sitio es la suma de sus partes visibles; un estado fuera de catálogo
            se muestra como «sin clasificar», nunca se oculta. En legislación y casos judiciales el estatus replica el de
            la fuente parlamentaria o judicial (en comisiones, turnada, resuelto…), no una interpretación propia.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {CRITERIOS.map((c) => (
              <div key={c.estatus} className="border border-gray-200 rounded-xl p-5 flex gap-4">
                <span className="text-xl" aria-hidden>{c.emoji}</span>
                <div>
                  <h4 className="font-sans-tech font-semibold text-gray-900 mb-1">{c.estatus}</h4>
                  <p className="font-sans-tech text-sm text-gray-600 leading-relaxed">{c.regla}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-sans-tech text-sm text-gray-500 leading-relaxed mt-6 max-w-3xl">
            «Operando» tampoco equivale a «cumplimiento»: en los recaps el porcentaje se etiqueta «en operación», y el
            término «cumplimiento» se reserva para compromisos con alcance y plazo verificables.
          </p>
        </section>

        {/* Cierre: correcciones y datos */}
        <section className="border-t border-gray-200 pt-12">
          <h3 className="font-serif-display text-2xl md:text-3xl font-light text-gray-900 mb-3">La metodología también tiene historial.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            Esta página se versiona (v2026.08). Los cambios de estatus y las correcciones quedan en la bitácora pública;
            los datos pueden consultarse en tabla accesible; y cualquier error puede reportarse en el repositorio
            público del proyecto.
          </p>
          <div className="flex flex-wrap gap-3 font-sans-tech text-sm">
            <Link href="/actividad" className="px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors">Ver la bitácora</Link>
            <Link href="/grafo/tabla" className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors">Datos en tabla accesible</Link>
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors">Reportar un error ↗</a>
          </div>
        </section>
      </div>
    </div>
  );
}
