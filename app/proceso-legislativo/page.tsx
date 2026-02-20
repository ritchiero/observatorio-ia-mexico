import Link from 'next/link';
import {
  ArrowLeft, Calendar, ExternalLink, Play, Tv, Radio, Clock, Users, AlertCircle,
  Scale, Shield, Building2, Database, Lightbulb, Globe, FileText, BookOpen,
  ChevronRight, MessageSquareWarning, History, Landmark, ScrollText, Eye
} from 'lucide-react';

export const metadata = {
  title: 'Proceso Legislativo — Ley General de IA | Observatorio IA México',
  description: 'Análisis completo de la Ley General de Inteligencia Artificial en México: contenido de la propuesta, línea de tiempo, preocupaciones, sesiones del Senado y recursos.',
};

export default function ProcesoLegislativoPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-8 font-sans-tech">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full mb-4">
            <Calendar size={14} className="text-emerald-600" />
            <span className="text-xs font-sans-tech text-emerald-700 font-medium">Proceso Legislativo en Vivo</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3">
            Ley General de <span className="italic text-emerald-600">Inteligencia Artificial</span>
          </h1>
          <p className="text-gray-600 font-sans-tech text-sm sm:text-base max-w-3xl">
            Análisis detallado de la propuesta, contenido de la ley, línea de tiempo legislativa, preocupaciones, y recursos para seguir el proceso en el Senado de la República. Semana del 23 al 28 de febrero de 2026.
          </p>
        </div>

        {/* Executive Summary Alert */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans-tech text-sm font-semibold text-emerald-800 mb-2">Resumen Ejecutivo</h3>
              <p className="text-emerald-900 font-sans-tech text-sm leading-relaxed">
                El Congreso de la Unión de México se encuentra en una fase decisiva para establecer el primer marco regulatorio integral en materia de Inteligencia Artificial. La sesión clave es la del <strong>miércoles 25 de febrero</strong>, donde se espera la votación de la Ley General de IA. Al día siguiente, el <strong>jueves 26 de febrero a las 10:00 a.m.</strong>, el Secretario Técnico de la Comisión de IA del Senado impartirá un webinar exclusivo para socios CANACINTRA explicando los alcances de la nueva ley.
              </p>
            </div>
          </div>
        </div>

        {/* ===== SECTION: ¿Qué dice la Ley? ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ScrollText size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">¿Qué dice la Ley?</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Contenido y estructura de la propuesta</p>
            </div>
          </div>

          <div className="prose-sm font-sans-tech text-gray-700 text-sm leading-relaxed space-y-4 mb-6">
            <p>
              El esfuerzo regulatorio se compone de <strong>dos piezas legislativas centrales</strong>:
            </p>
          </div>

          {/* Two legislative pieces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Landmark size={16} className="text-amber-600" />
                <h4 className="font-sans-tech text-sm font-semibold text-amber-900">1. Reforma Constitucional</h4>
              </div>
              <p className="text-sm text-amber-800 font-sans-tech leading-relaxed">
                Iniciativa del Sen. Saúl Monreal Ávila para modificar el <strong>Artículo 73</strong> de la Constitución, otorgando al Congreso la facultad explícita de expedir una Ley General en materia de IA. Es el pilar jurídico que sustenta toda la regulación federal.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-blue-600" />
                <h4 className="font-sans-tech text-sm font-semibold text-blue-900">2. Ley General de IA</h4>
              </div>
              <p className="text-sm text-blue-800 font-sans-tech leading-relaxed">
                Propuesta de la Comisión de IA del Senado, basada en la "Propuesta de Marco Normativo" de octubre 2025, resultado de un proceso de consulta con <strong>72 especialistas</strong> de la industria, la academia, el gobierno y la sociedad civil.
              </p>
            </div>
          </div>

          {/* Architecture: 3 levels */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Arquitectura Regulatoria de Tres Niveles</h3>
            <p className="text-sm text-gray-600 font-sans-tech mb-4">
              La propuesta adopta un <strong>enfoque basado en riesgos</strong>, similar al AI Act de la Unión Europea, y establece una arquitectura de tres niveles:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-sans-tech text-xs font-bold">1</div>
                <div>
                  <p className="text-sm font-sans-tech font-medium text-gray-900">Reformas Constitucionales</p>
                  <p className="text-xs text-gray-600 font-sans-tech mt-1">Modificación de los Artículo 73 para facultar al Congreso para legislar en la materia.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-sans-tech text-xs font-bold">2</div>
                <div>
                  <p className="text-sm font-sans-tech font-medium text-gray-900">Ley General de IA</p>
                  <p className="text-xs text-gray-600 font-sans-tech mt-1">Establece principios rectores, mecanismos de gobernanza, estándares técnicos y esquemas de evaluación de riesgos. Propone la creación de un Consejo Mexicano de Ética para la IA y la Robótica y una Agencia Mexicana para el Desarrollo de la IA.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-sans-tech text-xs font-bold">3</div>
                <div>
                  <p className="text-sm font-sans-tech font-medium text-gray-900">Armonización Sectorial</p>
                  <p className="text-xs text-gray-600 font-sans-tech mt-1">Adecuación de al menos 17 leyes secundarias en áreas como salud, educación, derechos de autor, protección al consumidor y medio ambiente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Principios Rectores */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Principios Rectores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: 'Shield', label: 'Enfoque centrado en la persona y protección de derechos humanos' },
                { icon: 'Users', label: 'Inclusión y no discriminación' },
                { icon: 'Eye', label: 'Transparencia y explicabilidad de los algoritmos' },
                { icon: 'Scale', label: 'Seguridad, fiabilidad y robustez de los sistemas' },
                { icon: 'Database', label: 'Privacidad y gobernanza de datos' },
                { icon: 'Lightbulb', label: 'Rendición de cuentas y supervisión humana' },
                { icon: 'Globe', label: 'Sostenibilidad y fomento a la innovación' },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                  <ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-sans-tech text-gray-700">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key proposal cards */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Mecanismos Clave de la Propuesta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Scale size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Enfoque Basado en Riesgos</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Clasificación de sistemas de IA en cuatro niveles de riesgo: inaceptable, alto, limitado y bajo. Inspirado en el AI Act de la UE, con adaptaciones al contexto mexicano.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Autoridades Nacionales de IA</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Creación de un Consejo Mexicano de Ética para la IA y la Robótica, y una Agencia Mexicana para el Desarrollo de la Inteligencia Artificial.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Registro Nacional de Sistemas</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Registro obligatorio de sistemas de IA catalogados como de alto riesgo, con requisitos de documentación técnica, evaluaciones de impacto y auditorías periódicas.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Sandboxes Regulatorios</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Espacios de prueba controlados para que PyMEs y startups puedan desarrollar y probar innovaciones en IA sin cargas regulatorias completas.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Armonización de 17+ Leyes</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Adecuación transversal de al menos 17 leyes sectoriales en salud, educación, derechos de autor, protección al consumidor, medio ambiente, y alineación con el T-MEC.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Protecciones Especiales</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Protección específica para datos médicos, derechos de los actores de doblaje sobre su voz, propiedad intelectual de creadores, y derechos laborales ante la automatización.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION: ¿De dónde salió la iniciativa? ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <History size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">¿De dónde salió la iniciativa?</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Origen y proceso de consulta</p>
            </div>
          </div>

          <div className="space-y-4 font-sans-tech text-sm text-gray-700 leading-relaxed">
            <p>
              El marco regulatorio propuesto no es un esfuerzo aislado, sino la culminación de un proceso que comenzó formalmente en 2023 y se intensificó a lo largo de 2024 y 2025. Su origen es multifactorial:
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Necesidad de Certeza Jurídica</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                El rápido avance de la IA en México, tanto en el sector público como en el privado, generó un vacío normativo que creaba incertidumbre para la inversión y riesgos para los derechos de los ciudadanos.
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Iniciativas Precursoras</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Desde 2023, se presentaron en el Congreso al menos seis iniciativas de ley relacionadas con la IA, incluyendo propuestas de el Dip. Ricardo Monreal y el Sen. Clemente Castañeda, que sentaron las bases para la discusión actual.
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Proceso de Parlamento Abierto</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                La Comisión de IA del Senado, presidida por el Senador Rolando Rodrigo Zapata Bello, realizó 6 conversatorios temáticos con 72 expertos de todos los sectores, cuyas 34 recomendaciones finales constituyen el núcleo de la propuesta.
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Influencia Internacional</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Inspirada en la Ley de IA de la UE, adoptando un enfoque basado en clasificación de riesgos. Sin embargo, expertos han insistido en adaptar (y no simplemente replicar) modelos extranjeros, considerando las particularidades de México como país adoptante de tecnología.
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION: ¿Cómo puedo leer la iniciativa? ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">¿Cómo puedo leer la iniciativa?</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Documentos oficiales y fuentes</p>
            </div>
          </div>

          <div className="space-y-4 font-sans-tech text-sm text-gray-700 leading-relaxed mb-4">
            <p>
              El proceso legislativo involucra dos documentos distintos: la Iniciativa de Reforma al Artículo 73 Constitucional, presentada por el Sen. Saúl Monreal Ávila (que habilita al Congreso a legislar en materia de IA), y el texto de la Ley General de IA elaborado por la Comisión de IA del Senado, presidida por el Sen. Rolando Zapata Bello.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5014841_20260217_1770228073.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group"
            >
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors">
                <FileText size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">
                  Iniciativa de Reforma al Artículo 73 Constitucional
                </p>
                <p className="text-xs text-teal-700 font-sans-tech mt-1">
                  Documento oficial — Sen. Saúl Monreal Ávila — PDF (SIL Gobernación)
                </p>
              </div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>

            <div
              className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-5"
            >
              <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans-tech font-semibold text-amber-900">
                  Ley General de Inteligencia Artificial — Dictamen
                </p>
                <p className="text-xs text-amber-700 font-sans-tech mt-1">
                  Pendiente de publicación oficial — El texto final que se votará el 25 de febrero aún no ha sido publicado en los portales del Senado.
                </p>
              </div>
            </div>

            <a
              href="https://sil.gobernacion.gob.mx/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600 transition-colors">
                <Globe size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans-tech font-medium text-gray-700 group-hover:text-gray-900">
                  Sistema de Información Legislativa (SIL) — Gobernación
                </p>
                <p className="text-xs text-gray-400 font-sans-tech mt-0.5">sil.gobernacion.gob.mx</p>
              </div>
              <ExternalLink size={14} className="text-gray-300 flex-shrink-0 group-hover:text-gray-500" />
            </a>
          </div>

          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">
            Nota: El dictamen de la Ley General de IA que se votará el 25 de febrero aún no ha sido publicado oficialmente. Su contenido se basa en la "Propuesta de Marco Normativo" de octubre de 2025, ampliamente difundida en medios y foros especializados. Actualizaremos esta sección cuando el documento esté disponible.
          </p>
        </section>

        {/* ===== SECTION: Línea de Tiempo ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-orange-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Línea de Tiempo Legislativa</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Hitos principales del proceso</p>
            </div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-orange-200" />

            <div className="space-y-4">
              {[
                { fecha: '30 mar. 2023', texto: 'Se presenta la primera iniciativa de "Ley para la regulación ética de la IA y la robótica".' },
                { fecha: '20 sep. 2023', texto: 'Se presenta la propuesta de reforma al Artículo 73 constitucional para incluir IA, ciberseguridad y neuroderechos.' },
                { fecha: 'Oct 2024 – Abr 2025', texto: 'La Comisión de IA del Senado realiza 6 conversatorios con 72 expertos de la industria, academia, gobierno y sociedad civil.' },
                { fecha: '3 oct. 2025', texto: 'La Comisión de IA publica la "Propuesta de Marco Normativo para la Inteligencia Artificial en México".' },
                { fecha: '16 oct. 2025', texto: 'La Comisión de IA aprueba su plan de trabajo anual, priorizando la creación de la Ley General de IA.' },
                { fecha: '3 feb. 2026', texto: 'El Sen. Saúl Monreal Ávila presenta la iniciativa formal para reformar el Artículo 73 de la Constitución.' },
                { fecha: '25 feb. 2026', texto: 'Fecha prevista para la votación en el Pleno del Senado de la Ley General de Inteligencia Artificial.', highlight: true },
                { fecha: '26 feb. 2026', texto: 'Foro "Del Senado a la Industria" para explicar los alcances de la nueva ley al sector empresarial.', highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${item.highlight ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-orange-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${item.highlight ? 'bg-white' : 'bg-orange-500'}`} />
                  </div>
                  <div className={`flex-1 pb-2 ${item.highlight ? 'bg-orange-50 border border-orange-200 rounded-xl p-3 -mt-1' : ''}`}>
                    <p className={`text-xs font-sans-tech font-semibold ${item.highlight ? 'text-orange-700' : 'text-gray-500'}`}>{item.fecha}</p>
                    <p className={`text-sm font-sans-tech mt-0.5 ${item.highlight ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION: Principales Preocupaciones ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <MessageSquareWarning size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Principales Preocupaciones y Críticas</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Voces de la sociedad civil, academia y expertos</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-sans-tech leading-relaxed mb-4">
            A pesar del consenso general sobre la necesidad de regular la IA, han surgido diversas preocupaciones por parte de la sociedad civil, la academia y expertos en derechos digitales:
          </p>

          <div className="space-y-3">
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Riesgos para la Libertad de Expresión y Privacidad</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Organizaciones como Artículo 19 advierten que conceptos ambiguos como "alterar la confianza pública" o "paz social" podrían criminalizar actividades legítimas en línea, como la crítica política, la sátira o la creación artística.
              </p>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Vigilancia y Seguridad Nacional</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                La participación de fuerzas armadas (SEDENA, SEMAR, Guardia Nacional) en los conversatorios ha generado preocupación sobre el posible uso de la IA para vigilancia masiva y reconocimiento facial sin contrapesos adecuados.
              </p>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Capacidad Institucional</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Expertos señalan que la ambición de la ley podría superar la capacidad del Estado para implementarla. La falta de personal técnico en los organismos reguladores podría llevar a una "gobernanza sin aplicabilidad práctica".
              </p>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Propiedad Intelectual y Derechos de Autor</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Existe fuerte tensión en torno al uso de obras creativas protegidas por derechos de autor para entrenar modelos de IA generativa. Artistas exigen mecanismos claros de compensación y protección de obras humanas frente a las generadas por IA.
              </p>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Derechos Laborales</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Sindicatos y trabajadores han expresado preocupación por el desplazamiento de puestos de trabajo, la precarización y la necesidad de una transición justa con protección de derechos laborales.
              </p>
            </div>
          </div>
        </section>

        {/* ===== SECTION: Sesiones Plenarias ===== */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Play size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Sesiones Plenarias del Senado</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Con transmisión en vivo</p>
            </div>
          </div>

          <p className="text-gray-600 font-sans-tech text-sm mb-4">
            Ambas sesiones serán transmitidas en vivo por el Canal del Congreso México en YouTube y por televisión abierta (canales 45.1, 45.2 y 45.3). La Ley General de IA está prevista para votarse en la sesión del 25 de febrero.
          </p>

          <div className="space-y-3">
            {/* Sesion 25 feb */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-sans-tech font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    CLAVE
                  </span>
                  <span className="text-sm font-sans-tech font-medium text-gray-900">Miércoles 25 de febrero</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-sans-tech">Sesión Ordinaria del Pleno del Senado — <strong>Votación prevista de la Ley General de IA</strong></p>
                </div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-red-700 transition-colors whitespace-nowrap">
                  <Play size={12} />
                  Canal del Congreso
                </a>
              </div>
            </div>

            {/* Sesion 26 feb */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-sans-tech font-semibold">
                    <Clock size={12} />
                    SESIÓN
                  </span>
                  <span className="text-sm font-sans-tech font-medium text-gray-900">Jueves 26 de febrero</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-sans-tech">Sesión Ordinaria del Pleno del Senado</p>
                </div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                  <Play size={12} />
                  Canal del Congreso
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">
            Nota: El Canal del Congreso no publica los links de transmisión con anticipación; los videos quedan disponibles en su canal de YouTube inmediatamente después de concluir cada sesión.
          </p>
        </section>

        {/* Webinar */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Webinar Especial — Post-Legislativo</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Exclusivo para socios CANACINTRA</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-sans-tech font-semibold">
                    <Calendar size={12} />
                    Jueves 26 de febrero, 10:00 a.m.
                  </span>
                </div>
                <h3 className="font-sans-tech text-sm font-semibold text-blue-900 mb-2">
                  Del Senado a la Industria: Panorama Legislativo IA 2026
                </h3>
                <p className="text-sm text-blue-800 font-sans-tech leading-relaxed mb-3">
                  Implementa Inteligencia Artificial sin poner en riesgo a tu empresa. Impartido por <strong>Mtro. Alonso Bernardo Tamez Vélez</strong>, Secretario Técnico de la Comisión de IA del Senado. Organizado por el Comité de IA de CANACINTRA Coahuila Sureste.
                </p>
                <a href="https://gqr.sh/7mDQ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-sans-tech font-medium hover:bg-blue-700 transition-colors">
                  <ExternalLink size={14} />
                  Registrarse
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Videos Disponibles */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tv size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Videos Disponibles</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Canal Oficial del Senado de México y Canal del Congreso</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { fecha: '18 feb. 2026', titulo: 'Sesión Ordinaria del Senado 18/02/2026 (sesión más reciente)', url: 'https://www.youtube.com/watch?v=4CblZopqEg4' },
              { fecha: '17 feb. 2026', titulo: 'Sesión Ordinaria del Senado 17/02/2026', url: 'https://www.youtube.com/watch?v=yGHlnWu5Zjw' },
              { fecha: '11 feb. 2025', titulo: 'Inauguración del Ciclo de Talleres de IA del Senado (presidido por Sen. Rolando Zapata Bello)', url: 'https://www.youtube.com/watch?v=K-lNHJkDYQk' },
              { fecha: '16 oct. 2025', titulo: 'Reunión Ordinaria de la Comisión de Análisis, Seguimiento y Evaluación sobre la IA en México', url: 'https://www.youtube.com/watch?v=H9qL7df8_as' },
            ].map((video, i) => (
              <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors">
                  <Play size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">{video.titulo}</p>
                  <p className="text-xs text-gray-500 font-sans-tech mt-0.5">{video.fecha}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" />
              </a>
            ))}
          </div>

          {/* Intervenciones de Senadores */}
          <h3 className="font-sans-tech text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">Intervenciones de Senadores</h3>
          <div className="space-y-2">
            {[
              { titulo: '"Esta iniciativa busca establecer las facultades para legislar en materia de IA": Sen. Ruiz (GPMorena)', url: 'https://www.youtube.com/watch?v=F-oPzipptD4' },
              { titulo: '"El fraude con IA aumentó 2000%": Sen. Martín (GPPAN)', url: 'https://www.youtube.com/watch?v=1yTOMvW3W3c' },
              { titulo: '"Regular la IA implica impulsar beneficios y combatir prejuicios": Sen. Sanmiguel (GPPAN)', url: 'https://www.youtube.com/watch?v=ryBajW8C0Lw' },
              { titulo: '"Regular IA para que coexista con humanidad": Sen. Martha Márquez (PT)', url: 'https://www.youtube.com/watch?v=ysF__tvVrOw' },
              { titulo: 'Conversatorio "IA: retos, riesgos y oportunidades" — Sen. Alejandra Lagunes', url: 'https://www.youtube.com/watch?v=vUvvOHRXnYc' },
              { titulo: 'Foro internacional "El futuro de la IA: plataformas y redes sociales"', url: 'https://www.youtube.com/watch?v=4p5iBGfgocg' },
              { titulo: '"Impacto de la IA en la ética, los derechos humanos y la política pública"', url: 'https://www.youtube.com/watch?v=a5eAK6A4am0' },
            ].map((video, i) => (
              <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group">
                <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                  <Play size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">{video.titulo}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" />
              </a>
            ))}
          </div>
        </section>

        {/* Dónde seguir en vivo */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Radio size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Dónde Seguir las Sesiones en Vivo</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso México</p>
                <p className="text-xs text-gray-500 font-sans-tech">YouTube</p>
              </div>
            </a>

            <a href="https://www.youtube.com/c/senadomexico" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Senado de México (oficial)</p>
                <p className="text-xs text-gray-500 font-sans-tech">YouTube</p>
              </div>
            </a>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tv size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p>
                <p className="text-xs text-gray-500 font-sans-tech">TV Abierta — Canales 45.1, 45.2 y 45.3</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tv size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p>
                <p className="text-xs text-gray-500 font-sans-tech">Dish / Sky — Canal 145</p>
              </div>
            </div>
          </div>
        </section>

        {/* References */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-gray-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Referencias y Fuentes</h2>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { titulo: 'Iniciativa de Reforma al Art. 73 Constitucional — SIL Gobernación (PDF)', url: 'http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5014841_20260217_1770228073.pdf' },
              { titulo: 'Senado de México publica iniciativa de ley para regular IA — Mobile Time', url: 'https://mobiletime.la/noticias/03/10/2025/senado-regular-ia/' },
              { titulo: 'Comisión del Senado impulsa ley general para regular la IA — Noticiero Gubernamental', url: 'https://www.noticierogubernamental.com/comision-del-senado-impulsa-ley-general-para-regular-y-fomentar-el-uso-de-la-inteligencia-artificial/' },
              { titulo: 'Legislar IA sin definirla: Artículo 19 critica reforma aprobada en SLP — La Orquesta', url: 'https://laorquesta.mx/legislar-ia-sin-definirla-articulo-19-critica-reforma-aprobada-en-slp/' },
              { titulo: '¿Regulación de la Inteligencia Artificial en México? — El Economista', url: 'https://www.eleconomista.com.mx/opinion/regulacion-inteligencia-artificial-mexico-20250929-779193.html' },
              { titulo: 'México: Las diversas iniciativas de regulación de la IA — CeCo', url: 'https://centrocompetencia.com/mexico-las-diversas-iniciativas-de-regulacion-de-la-ia/' },
            ].map((ref, i) => (
              <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group">
                <span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">{i + 1}.</span>
                <p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">{ref.titulo}</p>
                <ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" />
              </a>
            ))}
          </div>
        </section>

        {/* Link al anuncio original */}
        <div className="border-t border-gray-200 pt-8">
          <Link href="/anuncio/5ZS5BxrNE7nTBBNVdaEG" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-sans-tech font-medium transition-colors">
            <ExternalLink size={14} />
            Ver ficha completa: Ley General de Inteligencia Artificial en el Senado
          </Link>
        </div>

      </main>
    </div>
  );
}
