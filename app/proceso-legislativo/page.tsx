import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Play, Tv, Radio, Clock, Users, AlertCircle, Scale, Shield, Building2, Database, Lightbulb, Globe, FileText, BookOpen, ChevronRight, MessageSquareWarning, History, Landmark, ScrollText, Eye, Gavel, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Proceso Legislativo — Ley General de IA | Observatorio IA México',
  description: 'Análisis completo de la Ley General de Inteligencia Artificial en México: contenido de la propuesta, línea de tiempo, preocupaciones, sesiones del Senado y recursos.',
};

export default function ProcesoLegislativoPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">

        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-8 font-sans-tech">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Landmark size={16} className="text-amber-600" /><h4 className="font-sans-tech text-sm font-semibold text-amber-900">1. Reforma Constitucional al Art. 73</h4></div>
              <p className="text-sm text-amber-800 font-sans-tech leading-relaxed">Iniciativa del Sen. Saúl Monreal Ávila para adicionar una fracción XXXII al <strong>Artículo 73</strong>, otorgando al Congreso la facultad de expedir una Ley General en materia de IA.</p>
              <p className="text-xs text-amber-700 font-sans-tech mt-2 italic">Nota: La iniciativa formal del 3 de febrero de 2026 <strong>solo reforma el Art. 73</strong>. La reforma al Art. 3 fue contemplada en la Propuesta de Marco Normativo de oct. 2025, pero no se presentó como iniciativa formal ante el Senado.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><FileText size={16} className="text-blue-600" /><h4 className="font-sans-tech text-sm font-semibold text-blue-900">2. Ley General de IA (LGIA v1)</h4></div>
              <p className="text-sm text-blue-800 font-sans-tech leading-relaxed">Propuesta de la Comisión de IA del Senado. Contiene <strong>223 artículos + 10 transitorios + Glosario Reglamentario</strong> en 14 Títulos. Resultado de consulta con <strong>72 especialistas</strong>.</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-1">Estructura: 14 Títulos de la LGIA v1</h3>
            <p className="text-xs text-gray-500 font-sans-tech mb-3">223 artículos + 10 transitorios + Glosario Reglamentario</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs font-sans-tech">
                <thead><tr className="bg-emerald-50 border-b border-emerald-200"><th className="text-left p-2 pl-3 text-emerald-800 font-semibold w-12">Título</th><th className="text-left p-2 text-emerald-800 font-semibold">Contenido</th><th className="text-left p-2 pr-3 text-emerald-800 font-semibold w-24">Relevancia</th></tr></thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">1°</td><td className="p-2 text-gray-700">Disposiciones Generales (objeto, definiciones, ámbito)</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Base</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">2°</td><td className="p-2 text-gray-700">Principios Éticos, DDHH y Neuroderechos</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">3°</td><td className="p-2 text-gray-700">Gobernanza y Coordinación Multinivel</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">4°</td><td className="p-2 text-gray-700">Estrategia Nacional y Política Pública en IA</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Estratégico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">5°</td><td className="p-2 text-gray-700">Instituciones Rectoras (SECIHTI, ATDT, Autoridad Nacional)</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">6°</td><td className="p-2 text-gray-700">Educación, Capacitación y Cultura Digital</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Importante</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">7°</td><td className="p-2 text-gray-700">Perspectiva de Género, Inclusión y No Discriminación</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Importante</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">8°</td><td className="p-2 text-gray-700">Fomento al Desarrollo, Innovación y Capacidades Nacionales</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Estratégico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">9°</td><td className="p-2 text-gray-700">Evaluación, Clasificación y Gestión de Riesgos</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">10°</td><td className="p-2 text-gray-700">Aplicaciones Prohibidas y de Alto Riesgo</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">11°</td><td className="p-2 text-gray-700">Derechos y Obligaciones (Desarrolladores, Operadores, Usuarios)</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">12°</td><td className="p-2 text-gray-700">Transparencia, Rendición de Cuentas y Datos Abiertos</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Importante</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">13°</td><td className="p-2 text-gray-700">Procedimientos Administrativos</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">Operativo</span></td></tr>
                  <tr className="bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">14°</td><td className="p-2 text-gray-700">Infracciones, Responsabilidades y Sanciones</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Crítico</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Database size={16} className="text-indigo-600" /><h3 className="font-sans-tech text-sm font-semibold text-indigo-900">Primera Definición Federal de IA en México (Art. 4, fracc. XX)</h3></div>
            <p className="text-xs text-indigo-800 font-sans-tech leading-relaxed italic border-l-2 border-indigo-300 pl-3 mb-3">"Sistema socio-técnico basado en modelos computacionales o matemáticos que, a partir del procesamiento de datos, señales o instrucciones, realiza funciones de aprendizaje, razonamiento, predicción, clasificación, generación de contenidos o comprensión del lenguaje, con el objetivo de producir resultados, decisiones o acciones que, de efectuarse exclusivamente por personas, requerirían inteligencia o juicio humano; pudiendo operar de manera autónoma, semiautónoma o asistida."</p>
            <p className="text-xs text-indigo-700 font-sans-tech">Más amplia que la del AI Act europeo e incluye explícitamente la IA generativa. El Art. 4 establece un glosario de <strong>49 definiciones legales</strong>: sesgo algorítmico, deepfake, sandbox regulatorio, GPAI, modelo fundacional, sistema autónomo crítico, riesgo sistémico en IA y soberanía tecnológica, entre otros. Los Anexos añaden 14 definiciones técnicas complementarias.</p>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Arquitectura Institucional (Título Quinto)</h3>
            <p className="text-xs text-gray-500 font-sans-tech mb-3">La LGIA v1 distingue entre función estratégica científico-tecnológica (SECIHTI) y función operativa de transformación digital (ATDT):</p>
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-emerald-900 mb-1">Autoridad Nacional en IA</p><p className="text-xs text-emerald-800 font-sans-tech leading-relaxed">Ente rector nacional. Coordina, supervisa y regula la implementación de la ley.</p></div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-blue-900 mb-1">SECIHTI — Secretaría de Ciencia, Humanidades, Tecnología e Innovación</p><p className="text-xs text-blue-800 font-sans-tech leading-relaxed">Responsable de la política de I+D y fomento científico-tecnológico en IA.</p></div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-purple-900 mb-1">ATDT — Agencia de Transformación Digital y Telecomunicaciones</p><p className="text-xs text-purple-800 font-sans-tech leading-relaxed">Responsable de la función operativa: implementación, supervisión y transformación digital.</p></div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-teal-900 mb-1">Sistema Nacional de IA</p><p className="text-xs text-teal-800 font-sans-tech leading-relaxed">Marco de coordinación entre los tres órdenes de gobierno, sector privado, academia y sociedad civil.</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-amber-900 mb-1">Consejo Consultivo Nacional</p><p className="text-xs text-amber-800 font-sans-tech leading-relaxed">Órgano multisectorial, no vinculante. Emite recomendaciones y promueve la participación ciudadana.</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Principios Rectores (Art. 11)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Enfoque centrado en la persona y protección de derechos humanos</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Inclusión y no discriminación</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Transparencia y explicabilidad de los algoritmos</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Seguridad, fiabilidad y robustez de los sistemas</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Privacidad y gobernanza de datos</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Rendición de cuentas y supervisión humana</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Sostenibilidad y fomento a la innovación</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 sm:col-span-2"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Protección de derechos laborales, culturales, creativos y de propiedad intelectual, incluidos actores, artistas, escritores, periodistas, compositores y demás creadores</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Mecanismos Clave</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Scale size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Enfoque Basado en Riesgos</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">La LGIA v1 usa tres categorías: <strong>aplicaciones prohibidas</strong> (Título Décimo), <strong>sistemas de alto riesgo</strong> con obligaciones reforzadas, y <strong>sistemas de uso limitado o personal</strong> con principios básicos. No usa la nomenclatura exacta del AI Act europeo.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Building2 size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Aplicaciones Prohibidas (Título Décimo)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Prohíbe: manipulación cognitiva coercitiva, puntuación social estatal (social scoring), identificación biométrica masiva sin base legal, y cualquier aplicación que vulnere derechos humanos o la seguridad nacional.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Database size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Registro Nacional de Sistemas</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Registro obligatorio de sistemas de IA de alto riesgo, con documentación técnica, evaluaciones de impacto y auditorías periódicas.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Lightbulb size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Sandboxes Regulatorios (Art. 4, fracc. XXXVI)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Entornos controlados para probar sistemas de IA de alto riesgo. Accesibles para <strong>cualquier actor</strong>, no exclusivos para PyMEs o startups.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Globe size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">43 Ordenamientos — Art. 9</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">El Art. 9 lista 43 ordenamientos (leyes generales, federales, códigos y el T-MEC) con los que la LGIA debe interpretarse y aplicarse armónicamente.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Alcance Extraterritorial (Art. 6)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Aplica a sistemas de IA que generen impactos en México o sean usados por entidades extranjeras que presten servicios a residentes mexicanos. El Art. 7 lista 31 ámbitos sectoriales específicos.</p></div>
            </div>
          </div>

          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Eye size={16} className="text-purple-600" /><h3 className="font-sans-tech text-sm font-semibold text-purple-900">Cinco Neuroderechos Reconocidos (Art. 18)</h3></div>
            <p className="text-xs text-purple-700 font-sans-tech mb-3">México sería uno de los primeros países en reconocer neuroderechos a nivel de ley ordinaria (Chile lo hizo a nivel constitucional en 2021):</p>
            <div className="space-y-1">
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">I. Identidad personal y continuidad psicológica</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">II. Privacidad mental</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">III. Integridad cognitiva y protección frente a interferencias no consentidas</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">IV. Autonomía de la voluntad</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">V. Equidad y no manipulación neurotecnológica indebida</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Régimen Sancionador — Título Décimo Cuarto (Arts. 208-222)</h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-yellow-900 mb-1">Infracciones Leves (Art. 209)</p><p className="text-xs text-yellow-800 font-sans-tech leading-relaxed">Omisiones formales de transparencia, registro o notificación.</p></div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-orange-900 mb-1">Infracciones Graves (Art. 210)</p><p className="text-xs text-orange-800 font-sans-tech leading-relaxed">Incumplimiento de evaluaciones de impacto, auditorías, falta de supervisión humana en sistemas de alto riesgo.</p></div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-red-900 mb-1">Infracciones Gravísimas (Art. 211)</p><p className="text-xs text-red-800 font-sans-tech leading-relaxed">Uso de aplicaciones prohibidas, daño grave a DDHH, discriminación sistemática, afectación a seguridad nacional.</p></div>
            </div>
            <p className="text-xs text-gray-500 font-sans-tech mt-3 italic">Sanciones (Art. 217): amonestación, multas, inhabilitación, suspensión o retiro del sistema, reparación integral del daño. La reincidencia en graves o gravísimas puede duplicar las sanciones (Art. 222).</p>
          </div>

          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-amber-600" /><h3 className="font-sans-tech text-sm font-semibold text-amber-900">Régimen Transitorio — Plazos Clave</h3></div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">Día siguiente al DOF</span><p className="text-xs font-sans-tech text-amber-800">Entrada en vigor de la Ley</p></div>
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">90 días</span><p className="text-xs font-sans-tech text-amber-800">Instalación de la Autoridad Nacional en IA + Consejo Consultivo Nacional</p></div>
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">180 días</span><p className="text-xs font-sans-tech text-amber-800">Reglamento de la Ley + Estrategia Nacional de IA</p></div>
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">365 días</span><p className="text-xs font-sans-tech text-amber-800">Armonización normativa por los 3 órdenes de gobierno y organismos autónomos</p></div>
              <div className="flex items-start gap-3"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">2 años</span><p className="text-xs font-sans-tech text-amber-800">Registro, clasificación y adecuación de sistemas de IA preexistentes</p></div>
            </div>
          </div>

        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><History size={18} className="text-indigo-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">¿De dónde salió la iniciativa?</h2><p className="text-xs text-gray-500 font-sans-tech">Origen y proceso de consulta</p></div>
          </div>
          <p className="text-sm text-gray-700 font-sans-tech leading-relaxed mb-4">El marco regulatorio es la culminación de un proceso que comenzó en 2023 y se intensificó a lo largo de 2024 y 2025.</p>
          <div className="space-y-3">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Necesidad de Certeza Jurídica</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">El rápido avance de la IA en México generó un vacío normativo que creaba incertidumbre para la inversión y riesgos para los derechos de los ciudadanos.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Iniciativas Precursoras</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Desde 2023, se presentaron al menos seis iniciativas en el Congreso, incluyendo propuestas del Dip. Ricardo Monreal y el Sen. Clemente Castañeda.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Proceso de Parlamento Abierto</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">La Comisión de IA del Senado, presidida por el Sen. Rolando Rodrigo Zapata Bello, realizó 6 conversatorios con 72 expertos, cuyas 34 recomendaciones constituyen el núcleo de la propuesta.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Influencia Internacional</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Inspirada en la Ley de IA de la UE, adoptando enfoque de clasificación de riesgos. La definición mexicana de IA es más amplia que la europea e incluye explícitamente la IA generativa.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Nota Inédita de Transparencia</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">La propia LGIA v1 incluye una "Nota de Transparencia y Buenas Prácticas Editoriales" donde la Comisión reconoce haber usado herramientas de IA generativa para tareas auxiliares de revisión formal del texto, bajo supervisión humana permanente. Esto es inédito en la legislación mexicana.</p></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center"><BookOpen size={18} className="text-teal-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">¿Cómo puedo leer la iniciativa?</h2><p className="text-xs text-gray-500 font-sans-tech">Documentos oficiales y fuentes</p></div>
          </div>
          <p className="text-sm text-gray-700 font-sans-tech leading-relaxed mb-4">El proceso legislativo involucra dos documentos: la Iniciativa de Reforma al Art. 73, presentada por el Sen. Saúl Monreal Ávila, y el texto de la Ley General de IA elaborado por la Comisión de IA del Senado, presidida por el Sen. Rolando Zapata Bello.</p>
          <div className="space-y-3">
            <a href="http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5014841_20260217_1770228073.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors"><FileText size={20} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">Iniciativa de Reforma al Artículo 73 Constitucional</p><p className="text-xs text-teal-700 font-sans-tech mt-1">Documento oficial — Sen. Saúl Monreal Ávila — PDF (SIL Gobernación)</p></div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>
            <a href="https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors"><FileText size={20} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">Ley General de Inteligencia Artificial — Dictamen</p><p className="text-xs text-teal-700 font-sans-tech mt-1">LGIA v1 — PDF publicado por la Comisión de IA del Senado</p></div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>
            <a href="https://sil.gobernacion.gob.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600 transition-colors"><Globe size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-sans-tech font-medium text-gray-700 group-hover:text-gray-900">Sistema de Información Legislativa (SIL) — Gobernación</p><p className="text-xs text-gray-400 font-sans-tech mt-0.5">sil.gobernacion.gob.mx</p></div>
              <ExternalLink size={14} className="text-gray-300 flex-shrink-0 group-hover:text-gray-500" />
            </a>
          </div>
          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">El dictamen de la LGIA v1 está disponible en el link anterior. La iniciativa de reforma al Art. 73 fue publicada en el SIL de Gobernación el 17 de febrero de 2026.</p>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Clock size={18} className="text-orange-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Línea de Tiempo Legislativa</h2><p className="text-xs text-gray-500 font-sans-tech">Hitos principales del proceso</p></div>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-orange-200" />
            <div className="space-y-4">
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">30 mar. 2023</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">Se presenta la primera iniciativa de "Ley para la regulación ética de la IA y la robótica".</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">20 sep. 2023</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">Se presenta la propuesta de reforma al Artículo 73 constitucional para incluir IA, ciberseguridad y neuroderechos.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Oct 2024 – Abr 2025</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">La Comisión de IA del Senado realiza 6 conversatorios con 72 expertos de la industria, academia, gobierno y sociedad civil.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">3 oct. 2025</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">La Comisión de IA publica la "Propuesta de Marco Normativo para la IA en México", contemplando reformas a los Arts. 3 y 73.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">16 oct. 2025</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">La Comisión de IA aprueba su plan de trabajo anual, priorizando la creación de la Ley General de IA.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">3 feb. 2026</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">El Sen. Saúl Monreal Ávila presenta la iniciativa formal para reformar únicamente el Artículo 73 de la Constitución (adición de fracción XXXII).</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">17 feb. 2026</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">La Cámara de Diputados aprueba por unanimidad (442 votos) la reforma para sancionar deepfakes de contenido sexual. Remitida al Senado.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-500 ring-4 ring-orange-100 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-white" /></div><div className="flex-1 pb-2 bg-orange-50 border border-orange-200 rounded-xl p-3 -mt-1"><p className="text-xs font-sans-tech font-semibold text-orange-700">25 feb. 2026</p><p className="text-sm font-sans-tech mt-0.5 text-orange-900 font-medium">Fecha prevista para la votación en el Pleno del Senado de la Ley General de Inteligencia Artificial.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-500 ring-4 ring-orange-100 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-white" /></div><div className="flex-1 pb-2 bg-orange-50 border border-orange-200 rounded-xl p-3 -mt-1"><p className="text-xs font-sans-tech font-semibold text-orange-700">26 feb. 2026</p><p className="text-sm font-sans-tech mt-0.5 text-orange-900 font-medium">Foro "Del Senado a la Industria" para explicar los alcances de la nueva ley al sector empresarial.</p></div></div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center"><Gavel size={18} className="text-teal-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Contexto Legislativo Paralelo</h2><p className="text-xs text-gray-500 font-sans-tech">Legislación complementaria en curso</p></div>
          </div>
          <div className="space-y-3">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><CheckCircle size={14} className="text-teal-600" /><h4 className="font-sans-tech text-sm font-semibold text-teal-900">Reforma deepfakes — Aprobada en Diputados (17 feb. 2026)</h4></div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">La Cámara de Diputados aprobó por unanimidad (442 votos) la reforma al Art. 20 Quáter de la LGAMVLV, para sancionar la violencia digital mediante IA generativa (deepfakes de contenido sexual). Ya remitida al Senado.</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-teal-600" /><h4 className="font-sans-tech text-sm font-semibold text-teal-900">Ley Federal para el Desarrollo Ético, Soberano e Inclusivo de la IA — En Diputados</h4></div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Propuesta de MORENA/PVEM (2025) que incluye reformas al Código Penal Federal y a la Ley Federal del Derecho de Autor en materia de IA generativa. Contempla protección específica para actores de doblaje frente al uso de IA para replicar su voz sin consentimiento.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><MessageSquareWarning size={18} className="text-red-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Principales Preocupaciones y Críticas</h2><p className="text-xs text-gray-500 font-sans-tech">Voces de la sociedad civil, academia y expertos</p></div>
          </div>
          <p className="text-sm text-gray-600 font-sans-tech leading-relaxed mb-4">A pesar del consenso sobre la necesidad de regular la IA, han surgido diversas preocupaciones:</p>
          <div className="space-y-3">
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Riesgos para la Libertad de Expresión y Privacidad</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Organizaciones como Artículo 19 advierten que conceptos ambiguos como "alterar la confianza pública" o "paz social" podrían criminalizar actividades legítimas como la crítica política, la sátira o la creación artística.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Vigilancia y Seguridad Nacional</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">La participación de SEDENA, SEMAR y Guardia Nacional en los conversatorios ha generado preocupación sobre el posible uso de IA para vigilancia masiva y reconocimiento facial. La ley prohíbe la identificación biométrica masiva sin base legal, pero los límites prácticos son objeto de debate.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Capacidad Institucional</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Expertos señalan que la ambición de la ley podría superar la capacidad del Estado para implementarla. Los plazos de 90 a 365 días para instalar instituciones y emitir reglamentos son considerados muy ajustados.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Propiedad Intelectual y Derechos de Creadores</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Fuerte tensión en torno al uso de obras protegidas para entrenar modelos de IA. La LGIA v1 incluye en sus principios la protección de derechos de actores, escritores, artistas, periodistas y compositores, pero el mecanismo concreto queda pendiente de reglamentación.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Derechos Laborales</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Sindicatos y trabajadores han expresado preocupación por el desplazamiento de puestos de trabajo, la precarización y la necesidad de una transición justa.</p></div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><Play size={18} className="text-red-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Sesiones Plenarias del Senado</h2><p className="text-xs text-gray-500 font-sans-tech">Con transmisión en vivo</p></div>
          </div>
          <p className="text-gray-600 font-sans-tech text-sm mb-4">Ambas sesiones serán transmitidas en vivo por el Canal del Congreso México en YouTube y por TV abierta (canales 45.1, 45.2 y 45.3). La Ley General de IA está prevista para la sesión del 25 de febrero.</p>
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-sans-tech font-semibold"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />CLAVE</span><span className="text-sm font-sans-tech font-medium text-gray-900">Miércoles 25 de febrero</span></div>
                <div className="flex-1"><p className="text-sm text-gray-700 font-sans-tech">Sesión Ordinaria del Pleno — <strong>Votación prevista de la Ley General de IA</strong></p></div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-red-700 transition-colors whitespace-nowrap"><Play size={12} />Canal del Congreso</a>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-sans-tech font-semibold"><Clock size={12} />SESIÓN</span><span className="text-sm font-sans-tech font-medium text-gray-900">Jueves 26 de febrero</span></div>
                <div className="flex-1"><p className="text-sm text-gray-700 font-sans-tech">Sesión Ordinaria del Pleno del Senado</p></div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"><Play size={12} />Canal del Congreso</a>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">El Canal del Congreso no publica los links de transmisión con anticipación; los videos quedan disponibles en YouTube al concluir cada sesión.</p>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={18} className="text-blue-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Webinar Especial — Post-Legislativo</h2><p className="text-xs text-gray-500 font-sans-tech">Exclusivo para socios CANACINTRA</p></div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-sans-tech font-semibold"><Calendar size={12} />Jueves 26 de febrero, 10:00 a.m.</span></div>
            <h3 className="font-sans-tech text-sm font-semibold text-blue-900 mb-2">Del Senado a la Industria: Panorama Legislativo IA 2026</h3>
            <p className="text-sm text-blue-800 font-sans-tech leading-relaxed mb-3">Implementa IA sin poner en riesgo a tu empresa. Impartido por <strong>Mtro. Alonso Bernardo Tamez Vélez</strong>, Secretario Técnico de la Comisión de IA del Senado. Organizado por el Comité de IA de CANACINTRA Coahuila Sureste.</p>
            <a href="https://gqr.sh/7mDQ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-sans-tech font-medium hover:bg-blue-700 transition-colors"><ExternalLink size={14} />Registrarse</a>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Tv size={18} className="text-purple-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Videos Disponibles</h2><p className="text-xs text-gray-500 font-sans-tech">Canal Oficial del Senado de México y Canal del Congreso</p></div>
          </div>
          <div className="space-y-2">
            <a href="https://www.youtube.com/watch?v=4CblZopqEg4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Sesión Ordinaria del Senado 18/02/2026 (sesión más reciente)</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">18 feb. 2026</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=yGHlnWu5Zjw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Sesión Ordinaria del Senado 17/02/2026</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">17 feb. 2026</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=K-lNHJkDYQk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Inauguración del Ciclo de Talleres de IA del Senado (presidido por Sen. Rolando Zapata Bello)</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">11 feb. 2025</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=H9qL7df8_as" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Reunión Ordinaria de la Comisión de Análisis, Seguimiento y Evaluación sobre la IA en México</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">16 oct. 2025</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
          </div>
          <h3 className="font-sans-tech text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">Intervenciones de Senadores</h3>
          <div className="space-y-2">
            <a href="https://www.youtube.com/watch?v=F-oPzipptD4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">"Esta iniciativa busca establecer las facultades para legislar en materia de IA": Sen. Ruiz (GPMorena)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=1yTOMvW3W3c" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">"El fraude con IA aumentó 2000%": Sen. Martín (GPPAN)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=ryBajW8C0Lw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">"Regular la IA implica impulsar beneficios y combatir prejuicios": Sen. Sanmiguel (GPPAN)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=ysF__tvVrOw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">"Regular IA para que coexista con humanidad": Sen. Martha Márquez (PT)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=vUvvOHRXnYc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">Conversatorio "IA: retos, riesgos y oportunidades" — Sen. Alejandra Lagunes</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=4p5iBGfgocg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">Foro internacional "El futuro de la IA: plataformas y redes sociales"</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=a5eAK6A4am0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">"Impacto de la IA en la ética, los derechos humanos y la política pública"</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Radio size={18} className="text-amber-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Dónde Seguir las Sesiones en Vivo</h2></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><Play size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso México</p><p className="text-xs text-gray-500 font-sans-tech">YouTube</p></div></a>
            <a href="https://www.youtube.com/c/senadomexico" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><Play size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Senado de México (oficial)</p><p className="text-xs text-gray-500 font-sans-tech">YouTube</p></div></a>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4"><div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"><Tv size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p><p className="text-xs text-gray-500 font-sans-tech">TV Abierta — Canales 45.1, 45.2 y 45.3</p></div></div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4"><div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"><Tv size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p><p className="text-xs text-gray-500 font-sans-tech">Dish / Sky — Canal 145</p></div></div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><BookOpen size={18} className="text-gray-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Referencias y Fuentes</h2></div>
          </div>
          <div className="space-y-2">
            <a href="http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5014841_20260217_1770228073.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">1.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Iniciativa de Reforma al Art. 73 Constitucional — SIL Gobernación (PDF)</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">2.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Ley General de Inteligencia Artificial v1 — Dictamen (PDF, Comisión de IA del Senado)</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://mobiletime.la/noticias/03/10/2025/senado-regular-ia/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">3.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Senado de México publica iniciativa de ley para regular IA — Mobile Time</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://www.noticierogubernamental.com/comision-del-senado-impulsa-ley-general-para-regular-y-fomentar-el-uso-de-la-inteligencia-artificial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">4.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Comisión del Senado impulsa ley general para regular la IA — Noticiero Gubernamental</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://laorquesta.mx/legislar-ia-sin-definirla-articulo-19-critica-reforma-aprobada-en-slp/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">5.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Legislar IA sin definirla: Artículo 19 critica reforma aprobada en SLP — La Orquesta</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://www.eleconomista.com.mx/opinion/regulacion-inteligencia-artificial-mexico-20250929-779193.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">6.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Regulación de la Inteligencia Artificial en México — El Economista</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://centrocompetencia.com/mexico-las-diversas-iniciativas-de-regulacion-de-la-ia/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">7.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">México: Las diversas iniciativas de regulación de la IA — CeCo</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://gspp.berkeley.edu/assets/uploads/page/Sissi_De_La_Pena_Mexico_Sandbox_Dilemma.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">8.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Mexico's Sandbox Dilemma: Aligning Institutions for Adaptive Tech Regulation — Sissi De La Peña (UC Berkeley, 2024-2025)</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
          </div>
        </section>

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
