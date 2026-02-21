import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Play, Tv, Radio, Clock, Users, AlertCircle, Scale, Shield, Building2, Database, Lightbulb, Globe, FileText, BookOpen, ChevronRight, MessageSquareWarning, History, Landmark, ScrollText, Eye, Gavel, Info, CheckCircle, AlertTriangle, Brain, Lock } from 'lucide-react';

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
                Iniciativa del Sen. Saúl Monreal Ávila para adicionar una fracción XXXII al <strong>Artículo 73</strong> de la Constitución, otorgando al Congreso la facultad explícita de expedir una Ley General en materia de IA. Es el pilar jurídico que sustenta toda la regulación federal.
              </p>
              <p className="text-xs text-amber-700 font-sans-tech mt-2 italic">
                Nota: La iniciativa formal presentada el 3 de febrero de 2026 ante el Senado <strong>solo reforma el Art. 73</strong>. Aunque la "Propuesta de Marco Normativo" de octubre 2025 contemplaba también una reforma al Art. 3, no se ha presentado iniciativa formal para ese artículo.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-blue-600" />
                <h4 className="font-sans-tech text-sm font-semibold text-blue-900">2. Ley General de IA (LGIA v1)</h4>
              </div>
              <p className="text-sm text-blue-800 font-sans-tech leading-relaxed">
                Propuesta de la Comisión de IA del Senado. Contiene <strong>223 artículos + 10 transitorios + Glosario Reglamentario</strong>, distribuidos en 14 Títulos. Resultado de un proceso de consulta con <strong>72 especialistas</strong> de la industria, la academia, el gobierno y la sociedad civil.
              </p>
            </div>
          </div>

          {/* Estructura completa de la LGIA */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-1">Estructura de la LGIA v1: 14 Títulos</h3>
            <p className="text-xs text-gray-500 font-sans-tech mb-3">223 artículos + 10 transitorios + Glosario Reglamentario</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans-tech border-collapse">
                <thead>
                  <tr className="bg-emerald-50 border border-emerald-200">
                    <th className="text-left p-2 text-emerald-800 font-semibold border-r border-emerald-200">Título</th>
                    <th className="text-left p-2 text-emerald-800 font-semibold border-r border-emerald-200">Contenido</th>
                    <th className="text-left p-2 text-emerald-800 font-semibold">Relevancia</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { num: '1°', contenido: 'Disposiciones Generales (objeto, definiciones, ámbito)', relevancia: 'Base' },
                    { num: '2°', contenido: 'Principios Éticos, DDHH y Neuroderechos', relevancia: 'Crítico' },
                    { num: '3°', contenido: 'Gobernanza y Coordinación Multinivel', relevancia: 'Crítico' },
                    { num: '4°', contenido: 'Estrategia Nacional y Política Pública en IA', relevancia: 'Estratégico' },
                    { num: '5°', contenido: 'Instituciones Rectoras (SECIHTI, ATDT, Autoridad Nacional)', relevancia: 'Crítico' },
                    { num: '6°', contenido: 'Educación, Capacitación y Cultura Digital', relevancia: 'Importante' },
                    { num: '7°', contenido: 'Perspectiva de Género, Inclusión y No Discriminación', relevancia: 'Importante' },
                    { num: '8°', contenido: 'Fomento al Desarrollo, Innovación y Capacidades Nacionales', relevancia: 'Estratégico' },
                    { num: '9°', contenido: 'Evaluación, Clasificación y Gestión de Riesgos', relevancia: 'Crítico' },
                    { num: '10°', contenido: 'Aplicaciones Prohibidas y de Alto Riesgo', relevancia: 'Crítico' },
                    { num: '11°', contenido: 'Derechos y Obligaciones (Desarrolladores, Operadores, Usuarios)', relevancia: 'Crítico' },
                    { num: '12°', contenido: 'Transparencia, Rendición de Cuentas y Datos Abiertos', relevancia: 'Importante' },
                    { num: '13°', contenido: 'Procedimientos Administrativos', relevancia: 'Operativo' },
                    { num: '14°', contenido: 'Infracciones, Responsabilidades y Sanciones', relevancia: 'Crítico' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-2 font-semibold text-emerald-700 border-r border-gray-100 whitespace-nowrap">{row.num}</td>
                      <td className="p-2 text-gray-700 border-r border-gray-100">{row.contenido}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          row.relevancia === 'Crítico' ? 'bg-red-100 text-red-700' :
                          row.relevancia === 'Estratégico' ? 'bg-blue-100 text-blue-700' :
                          row.relevancia === 'Importante' ? 'bg-amber-100 text-amber-700' :
                          row.relevancia === 'Base' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{row.relevancia}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <p className="text-sm font-sans-tech font-medium text-gray-900">Reforma Constitucional al Art. 73</p>
                  <p className="text-xs text-gray-600 font-sans-tech mt-1">Adición de la fracción XXXII al Artículo 73 para facultar al Congreso para legislar en la materia.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-sans-tech text-xs font-bold">2</div>
                <div>
                  <p className="text-sm font-sans-tech font-medium text-gray-900">Ley General de IA</p>
                  <p className="text-xs text-gray-600 font-sans-tech mt-1">Establece principios rectores, mecanismos de gobernanza, estándares técnicos y esquemas de evaluación de riesgos. Define la arquitectura institucional con la Autoridad Nacional en IA, SECIHTI, ATDT, el Sistema Nacional de IA y el Consejo Consultivo Nacional.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-sans-tech text-xs font-bold">3</div>
                <div>
                  <p className="text-sm font-sans-tech font-medium text-gray-900">Armonización Sectorial</p>
                  <p className="text-xs text-gray-600 font-sans-tech mt-1">43 ordenamientos listados explícitamente en el Art. 9 de la LGIA (leyes generales, federales, códigos y el T-MEC) con los que la ley debe interpretarse y aplicarse armónicamente.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Definición legal de IA */}
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-indigo-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-indigo-900">Primera Definición Federal de IA en México (Art. 4, fracc. XX)</h3>
            </div>
            <blockquote className="text-xs text-indigo-800 font-sans-tech leading-relaxed italic border-l-2 border-indigo-300 pl-3 mb-3">
              "Sistema socio-técnico basado en modelos computacionales o matemáticos que, a partir del procesamiento de datos, señales o instrucciones, realiza funciones de aprendizaje, razonamiento, predicción, clasificación, generación de contenidos o comprensión del lenguaje, con el objetivo de producir resultados, decisiones o acciones que, de efectuarse exclusivamente por personas, requerirían inteligencia o juicio humano; pudiendo operar de manera autónoma, semiautónoma o asistida, y cuyo comportamiento y resultados dependen de su diseño, entrenamiento, uso y contexto de aplicación."
            </blockquote>
            <p className="text-xs text-indigo-700 font-sans-tech">Esta definición adopta el concepto de "sistema socio-técnico", es más amplia que la del AI Act europeo e incluye explícitamente la IA generativa. El Art. 4 establece un glosario de <strong>49 definiciones legales</strong>, incluyendo sesgo algorítmico, deepfake, sandbox regulatorio, modelo de propósito general (GPAI), modelo fundacional, sistema autónomo crítico, riesgo sistémico en IA y soberanía tecnológica. Los Anexos añaden 14 definiciones técnicas complementarias.</p>
          </div>

          {/* Arquitectura Institucional */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Arquitectura Institucional (Título Quinto)</h3>
            <p className="text-xs text-gray-500 font-sans-tech mb-3">La LGIA v1 distingue claramente entre la función estratégica de fomento científico-tecnológico y la función operativa de transformación digital:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { nombre: 'Autoridad Nacional en IA', desc: 'Ente rector nacional. Coordina, supervisa y regula la implementación de la ley.', color: 'emerald' },
                { nombre: 'SECIHTI', desc: 'Secretaría de Ciencia, Humanidades, Tecnología e Innovación. Responsable de la política de I+D y fomento científico-tecnológico en IA.', color: 'blue' },
                { nombre: 'ATDT', desc: 'Agencia de Transformación Digital y Telecomunicaciones. Responsable de la función operativa: implementación, supervisión y transformación digital.', color: 'purple' },
                { nombre: 'Sistema Nacional de IA', desc: 'Marco de coordinación entre los tres órdenes de gobierno, sector privado, academia y sociedad civil.', color: 'teal' },
                { nombre: 'Consejo Consultivo Nacional', desc: 'Órgano multisectorial, no vinculante. Emite recomendaciones y promueve la participación ciudadana en la gobernanza de la IA.', color: 'amber' },
              ].map((inst, i) => (
                <div key={i} className={`bg-${inst.color}-50 border border-${inst.color}-200 rounded-xl p-4`}>
                  <p className={`text-sm font-sans-tech font-semibold text-${inst.color}-900 mb-1`}>{inst.nombre}</p>
                  <p className={`text-xs text-${inst.color}-800 font-sans-tech leading-relaxed`}>{inst.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Principios Rectores */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Principios Rectores (Art. 11)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Enfoque centrado en la persona y protección de derechos humanos' },
                { label: 'Inclusión y no discriminación' },
                { label: 'Transparencia y explicabilidad de los algoritmos' },
                { label: 'Seguridad, fiabilidad y robustez de los sistemas' },
                { label: 'Privacidad y gobernanza de datos' },
                { label: 'Rendición de cuentas y supervisión humana' },
                { label: 'Sostenibilidad y fomento a la innovación' },
                { label: 'Protección de derechos laborales, culturales, creativos y de propiedad industrial e intelectual, incluidos los de actores, artistas, escritores, periodistas, compositores y demás creadores' },
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
                  La LGIA v1 establece tres categorías operativas: <strong>aplicaciones prohibidas</strong> (Título Décimo), <strong>sistemas de alto riesgo</strong> con obligaciones reforzadas de registro, evaluación, certificación, auditoría y supervisión, y <strong>sistemas de uso limitado o personal</strong> con principios básicos de seguridad y transparencia. No utiliza la nomenclatura exacta del AI Act europeo (inaceptable / alto / limitado / bajo).
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Instituciones Rectoras</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Autoridad Nacional en IA (coordinación y regulación), SECIHTI (política científico-tecnológica), ATDT (implementación y supervisión operativa), Sistema Nacional de IA y Consejo Consultivo Nacional multisectorial no vinculante.
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
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Sandboxes Regulatorios (Art. 4, fracc. XXXVI)</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Entornos controlados para probar sistemas de IA de alto riesgo. Accesibles para <strong>cualquier actor</strong> (no exclusivos para PyMEs o startups), sujeto a los requisitos que establezca la Autoridad Nacional.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">43 Ordenamientos — Art. 9</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  El Art. 9 lista 43 ordenamientos (leyes generales, federales, códigos y el T-MEC) con los que la LGIA debe interpretarse y aplicarse armónicamente, lo que hace de ésta una de las leyes de IA con mayor granularidad sectorial en el mundo.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Aplicaciones Prohibidas (Título Décimo)</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Prohíbe explícitamente: manipulación cognitiva coercitiva, puntuación social estatal (social scoring), identificación biométrica masiva sin base legal, y cualquier aplicación que vulnere derechos humanos o la seguridad nacional.
                </p>
              </div>
            </div>
          </div>

          {/* Neuroderechos */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-purple-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-purple-900">Cinco Neuroderechos Reconocidos (Art. 18)</h3>
            </div>
            <p className="text-xs text-purple-700 font-sans-tech mb-3">México sería uno de los primeros países en reconocer neuroderechos a nivel de ley ordinaria (Chile lo hizo a nivel constitucional en 2021):</p>
            <div className="space-y-2">
              {[
                'I. Identidad personal y continuidad psicológica',
                'II. Privacidad mental',
                'III. Integridad cognitiva y protección frente a interferencias no consentidas',
                'IV. Autonomía de la voluntad',
                'V. Equidad y no manipulación neurotecnológica indebida',
              ].map((nd, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-sans-tech text-purple-800">{nd}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ámbito de aplicación */}
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-teal-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-teal-900">Ámbito de Aplicación Territorial y Sectorial (Arts. 5-7)</h3>
            </div>
            <p className="text-xs text-teal-800 font-sans-tech leading-relaxed mb-2">
              La ley tiene <strong>alcance extraterritorial (Art. 6)</strong>: aplica a sistemas de IA cuyo diseño, operación o efectos trasciendan el territorio nacional cuando generen impactos en México o sean usados por entidades extranjeras que presten servicios a residentes mexicanos.
            </p>
            <p className="text-xs text-teal-800 font-sans-tech leading-relaxed">
              El <strong>Art. 7 lista 31 ámbitos sectoriales</strong> específicos de aplicación, desde aduanas hasta urbanismo, lo que hace de esta una de las leyes de IA con mayor granularidad sectorial en el mundo.
            </p>
          </div>

          {/* Régimen Sancionador */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Régimen Sancionador — Título Décimo Cuarto (Arts. 208–222)</h3>
            <div className="space-y-3">
              {[
                {
                  nivel: 'Infracciones Leves (Art. 209)',
                  ejemplos: 'Omisiones formales de transparencia, registro o notificación.',
                  color: 'yellow',
                },
                {
                  nivel: 'Infracciones Graves (Art. 210)',
                  ejemplos: 'Incumplimiento de evaluaciones de impacto, auditorías, falta de supervisión humana significativa en sistemas de alto riesgo.',
                  color: 'orange',
                },
                {
                  nivel: 'Infracciones Gravísimas (Art. 211)',
                  ejemplos: 'Uso de aplicaciones prohibidas, daño grave a DDHH, discriminación sistemática, afectación a seguridad nacional.',
                  color: 'red',
                },
              ].map((inf, i) => (
                <div key={i} className={`bg-${inf.color}-50 border border-${inf.color}-200 rounded-xl p-4`}>
                  <p className={`text-sm font-sans-tech font-semibold text-${inf.color}-900 mb-1`}>{inf.nivel}</p>
                  <p className={`text-xs text-${inf.color}-800 font-sans-tech leading-relaxed`}>{inf.ejemplos}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-sans-tech mt-3 italic">
              Sanciones (Art. 217): amonestación, multas, inhabilitación, suspensión o retiro del sistema, reparación integral del daño. La reincidencia en graves o gravísimas puede duplicar las sanciones (Art. 222).
            </p>
          </div>

          {/* Régimen Transitorio */}
          <div className="mb-2">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Régimen Transitorio — Plazos Clave para la Industria</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans-tech border-collapse">
                <thead>
                  <tr className="bg-amber-50 border border-amber-200">
                    <th className="text-left p-2 text-amber-800 font-semibold border-r border-amber-200">Plazo</th>
                    <th className="text-left p-2 text-amber-800 font-semibold">Obligación</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plazo: 'Día siguiente al DOF', obligacion: 'Entrada en vigor de la Ley' },
                    { plazo: '90 días', obligacion: 'Instalación de la Autoridad Nacional en IA + Consejo Consultivo Nacional' },
                    { plazo: '180 días', obligacion: 'Reglamento de la Ley + Estrategia Nacional de IA' },
                    { plazo: '365 días', obligacion: 'Armonización normativa por los 3 órdenes de gobierno y organismos autónomos' },
                    { plazo: '2 años', obligacion: 'Registro, clasificación y adecuación de sistemas de IA preexistentes' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-2 font-semibold text-amber-700 border-r border-gray-100 whitespace-nowrap">{row.plazo}</td>
                      <td className="p-2 text-gray-700">{row.obligacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                Desde 2023, se presentaron en el Congreso al menos seis iniciativas de ley relacionadas con la IA, incluyendo propuestas del Dip. Ricardo Monreal y el Sen. Clemente Castañeda, que sentaron las bases para la discusión actual.
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
                Inspirada en la Ley de IA de la UE, adoptando un enfoque basado en clasificación de riesgos. Sin embargo, la definición mexicana de IA es más amplia que la europea e incluye explícitamente la IA generativa. Expertos insisten en adaptar (y no simplemente replicar) modelos extranjeros, considerando las particularidades de México como país adoptante de tecnología.
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Nota de Transparencia sobre uso de IA</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                La propia LGIA v1 incluye una "Nota de Transparencia y Buenas Prácticas Editoriales" donde la Comisión de IA del Senado reconoce que se usaron herramientas de IA generativa para tareas auxiliares de revisión formal del texto (redacción, ortografía, gramática), bajo supervisión humana permanente. Esto es inédito en la legislación mexicana.
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
            <a
              href="https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group"
            >
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors">
                <FileText size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">
                  Ley General de Inteligencia Artificial — Dictamen
                </p>
                <p className="text-xs text-teal-700 font-sans-tech mt-1">
                  LGIA v1 — PDF publicado por la Comisión de IA del Senado
                </p>
              </div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>
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
            El dictamen de la LGIA v1 está disponible en el link anterior (PDF publicado por la Comisión de IA del Senado). La iniciativa de reforma al Art. 73 fue publicada oficialmente en el SIL de Gobernación el 17 de febrero de 2026.
          </p>
        </section>

          {/* Principios Rectores */}
          <div className="mb-6">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Principios Rectores (Art. 11)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Enfoque centrado en la persona y protección de derechos humanos',
                'Inclusión y no discriminación',
                'Transparencia y explicabilidad de los algoritmos',
                'Seguridad, fiabilidad y robustez de los sistemas',
                'Privacidad y gobernanza de datos',
                'Rendición de cuentas y supervisión humana',
                'Sostenibilidad y fomento a la innovación',
                'Protección de derechos laborales, culturales, creativos y de propiedad intelectual',
                'Soberanía tecnológica nacional',
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                  <ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-sans-tech text-gray-700">{p}</p>
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
                  La LGIA v1 define tres categorías operativas: <strong>aplicaciones prohibidas</strong> (Título Décimo), <strong>sistemas de alto riesgo</strong> con obligaciones reforzadas (registro, evaluación, certificación, auditoría y supervisión), y <strong>sistemas de uso limitado o personal</strong> con requisitos básicos de seguridad, transparencia y no discriminación (Art. 8).
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Autoridades Nacionales de IA</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Autoridad Nacional en IA como ente rector, con SECIHTI para política de I+D y ATDT para implementación y supervisión operativa. El Consejo Consultivo Nacional es multisectorial y no vinculante.
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
                  Entornos controlados para probar sistemas de IA de alto riesgo (Art. 4, fracc. XXXVI). Accesibles para cualquier actor —no exclusivo de PyMEs o startups— bajo supervisión de la autoridad competente.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">43 Ordenamientos — Art. 9</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  43 ordenamientos listados explícitamente en el Art. 9 con los que la LGIA debe interpretarse y aplicarse armónicamente: leyes generales, federales, códigos y el T-MEC.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-emerald-600" />
                  <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Protecciones Especiales</h4>
                </div>
                <p className="text-xs text-gray-600 font-sans-tech leading-relaxed">
                  Protección explícita de derechos laborales, culturales, creativos y de propiedad intelectual, incluyendo derechos sobre la voz, imagen, identidad, obra y autoría de actores, escritores, locutores, periodistas, compositores y demás personas creadoras.
                </p>
              </div>
            </div>
          </div>

          {/* Neuroderechos */}
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-purple-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-purple-900">Cinco Neuroderechos Reconocidos (Art. 18)</h3>
            </div>
            <p className="text-xs text-purple-800 font-sans-tech mb-3">México se posicionaría como uno de los primeros países en reconocer neuroderechos a nivel de ley ordinaria (Chile lo hizo a nivel constitucional en 2021):</p>
            <div className="space-y-2">
              {[
                { num: 'I', texto: 'Identidad personal y continuidad psicológica' },
                { num: 'II', texto: 'Privacidad mental' },
                { num: 'III', texto: 'Integridad cognitiva y protección frente a interferencias no consentidas' },
                { num: 'IV', texto: 'Autonomía de la voluntad' },
                { num: 'V', texto: 'Equidad y no manipulación neurotecnológica indebida' },
              ].map((nd, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-sans-tech font-bold text-purple-600 w-6 flex-shrink-0">{nd.num}.</span>
                  <p className="text-xs font-sans-tech text-purple-800">{nd.texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Aplicaciones Prohibidas */}
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-red-900">Aplicaciones Prohibidas (Título Décimo)</h3>
            </div>
            <p className="text-xs text-red-800 font-sans-tech mb-3">La LGIA v1 establece explícitamente como fines prohibidos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Manipulación cognitiva coercitiva',
                'Puntuación social estatal (social scoring)',
                'Identificación biométrica masiva sin base legal',
                'Cualquier aplicación que vulnere DDHH o seguridad nacional',
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-red-100/50 rounded-lg p-2">
                  <AlertTriangle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-sans-tech text-red-800">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Régimen Sancionador */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gavel size={16} className="text-gray-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-gray-900">Régimen Sancionador (Título Décimo Cuarto, Arts. 208–222)</h3>
            </div>
            <p className="text-xs text-gray-600 font-sans-tech mb-3">Tres niveles de infracciones:</p>
            <div className="space-y-2 mb-3">
              {[
                { nivel: 'Leves (Art. 209)', color: 'amber', ej: 'Omisiones formales de transparencia, registro o notificación.' },
                { nivel: 'Graves (Art. 210)', color: 'orange', ej: 'Incumplimiento de evaluaciones de impacto, auditorías, falta de supervisión humana en sistemas de alto riesgo.' },
                { nivel: 'Gravísimas (Art. 211)', color: 'red', ej: 'Uso de aplicaciones prohibidas, daño grave a DDHH, discriminación sistemática, afectación a seguridad nacional.' },
              ].map((inf, i) => (
                <div key={i} className={`flex items-start gap-2 bg-${inf.color}-50 border border-${inf.color}-200 rounded-lg p-3`}>
                  <span className={`text-xs font-sans-tech font-bold text-${inf.color}-700 flex-shrink-0 whitespace-nowrap`}>{inf.nivel}</span>
                  <p className={`text-xs font-sans-tech text-${inf.color}-800`}>{inf.ej}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-sans-tech">Sanciones (Art. 217): amonestación, multas, inhabilitación, suspensión o retiro del sistema, reparación integral del daño. La reincidencia en infracciones graves o gravísimas puede <strong>duplicar las sanciones</strong> (Art. 222).</p>
          </div>

          {/* Ámbito territorial y sectorial */}
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-teal-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-teal-900">Ámbito de Aplicación Territorial y Sectorial (Arts. 5–7)</h3>
            </div>
            <p className="text-xs text-teal-800 font-sans-tech mb-2">La ley tiene <strong>alcance extraterritorial</strong> (Art. 6): aplica a sistemas de IA cuyo diseño, operación o efectos trasciendan el territorio nacional cuando generen impactos en México o sean usados por entidades extranjeras que presten servicios a residentes mexicanos.</p>
            <p className="text-xs text-teal-800 font-sans-tech">El Art. 7 lista <strong>31 ámbitos sectoriales</strong> específicos de aplicación (desde aduanas hasta urbanismo), lo que hace de esta una de las leyes de IA con mayor granularidad sectorial en el mundo.</p>
          </div>

          {/* Régimen Transitorio */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-amber-600" />
              <h3 className="font-sans-tech text-sm font-semibold text-amber-900">Régimen Transitorio — Plazos Clave</h3>
            </div>
            <div className="space-y-2">
              {[
                { plazo: 'Día siguiente al DOF', obligacion: 'Entrada en vigor de la Ley' },
                { plazo: '90 días', obligacion: 'Instalación de la Autoridad Nacional en IA + Consejo Consultivo Nacional' },
                { plazo: '180 días', obligacion: 'Reglamento de la Ley + Estrategia Nacional de IA' },
                { plazo: '365 días', obligacion: 'Armonización normativa por los 3 órdenes de gobierno y organismos autónomos' },
                { plazo: '2 años', obligacion: 'Registro, clasificación y adecuación de sistemas de IA preexistentes' },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs font-sans-tech font-bold text-amber-700 w-32 flex-shrink-0">{t.plazo}</span>
                  <p className="text-xs font-sans-tech text-amber-800">{t.obligacion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nota de transparencia */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-sans-tech leading-relaxed">
                <strong>Nota inédita de transparencia:</strong> La propia LGIA v1 incluye al final una "Nota de Transparencia y Buenas Prácticas Editoriales" donde la Comisión de IA del Senado reconoce que se usaron herramientas de IA generativa para tareas auxiliares de revisión formal del texto (redacción, ortografía, gramática), bajo supervisión humana permanente. Esto es inédito en legislación mexicana.
              </p>
            </div>
          </div>


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
            <div className="absolute left-4 top-0 bottom-0 w-px bg-orange-200" />
            <div className="space-y-4">
              {[
                { fecha: '30 mar. 2023', texto: 'Se presenta la primera iniciativa de "Ley para la regulación ética de la IA y la robótica".' },
                { fecha: '20 sep. 2023', texto: 'Se presenta la propuesta de reforma al Artículo 73 constitucional para incluir IA, ciberseguridad y neuroderechos.' },
                { fecha: 'Oct 2024 – Abr 2025', texto: 'La Comisión de IA del Senado realiza 6 conversatorios con 72 expertos de la industria, academia, gobierno y sociedad civil.' },
                { fecha: '3 oct. 2025', texto: 'La Comisión de IA publica la "Propuesta de Marco Normativo para la Inteligencia Artificial en México", contemplando reformas a los Arts. 3 y 73.' },
                { fecha: '16 oct. 2025', texto: 'La Comisión de IA aprueba su plan de trabajo anual, priorizando la creación de la Ley General de IA.' },
                { fecha: '3 feb. 2026', texto: 'El Sen. Saúl Monreal Ávila presenta la iniciativa formal para reformar únicamente el Artículo 73 de la Constitución (fracción XXXII).' },
                { fecha: '17 feb. 2026', texto: 'La Cámara de Diputados aprueba por unanimidad (442 votos) la reforma al Art. 20 Quáter de la LGAMVLV para sancionar deepfakes de contenido sexual. Remitida al Senado.' },
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

        {/* ===== SECTION: Contexto Legislativo Paralelo ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Gavel size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Contexto Legislativo Paralelo</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Legislación complementaria en curso</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-teal-600" />
                <h4 className="font-sans-tech text-sm font-semibold text-teal-900">Reforma deepfakes — Aprobada en Diputados (17 feb. 2026)</h4>
              </div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                La Cámara de Diputados aprobó por unanimidad (442 votos) la reforma al Art. 20 Quáter de la Ley General de Acceso de las Mujeres a una Vida Libre de Violencia, para sancionar la violencia digital mediante IA generativa (deepfakes de contenido sexual). Ya fue remitida al Senado para su revisión.
              </p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-teal-600" />
                <h4 className="font-sans-tech text-sm font-semibold text-teal-900">Ley Federal para el Desarrollo Ético, Soberano e Inclusivo de la IA — En Diputados</h4>
              </div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Propuesta de MORENA/PVEM (2025) en Cámara de Diputados, que incluye reformas al Código Penal Federal y a la Ley Federal del Derecho de Autor en materia de IA generativa. Contempla protección específica para actores de doblaje frente al uso de IA para replicar su voz sin consentimiento.
              </p>
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
            <a
              href="https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group"
            >
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors">
                <FileText size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">
                  Ley General de Inteligencia Artificial — Dictamen
                </p>
                <p className="text-xs text-teal-700 font-sans-tech mt-1">
                  LGIA v1 — PDF publicado por la Comisión de IA del Senado
                </p>
              </div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>
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
                La participación de fuerzas armadas (SEDENA, SEMAR, Guardia Nacional) en los conversatorios ha generado preocupación sobre el posible uso de la IA para vigilancia masiva y reconocimiento facial sin contrapesos adecuados. La ley prohíbe la identificación biométrica masiva sin base legal, pero los límites prácticos son objeto de debate.
              </p>
            </div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Capacidad Institucional</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Expertos señalan que la ambición de la ley podría superar la capacidad del Estado para implementarla. La falta de personal técnico en los organismos reguladores podría llevar a una "gobernanza sin aplicabilidad práctica". Los plazos de implementación (90 a 365 días para instalar instituciones y emitir reglamentos) son considerados muy ajustados.
              </p>
            </div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Propiedad Intelectual y Derechos de Creadores</h4>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Existe fuerte tensión en torno al uso de obras creativas protegidas por derechos de autor para entrenar modelos de IA generativa. Artistas exigen mecanismos claros de compensación y protección. La LGIA v1 incluye en sus principios rectores la protección de derechos de actores, escritores, artistas, periodistas, compositores y demás creadores, pero el mecanismo concreto de implementación queda pendiente de reglamentación.
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
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-red-700 transition-colors whitespace-nowrap">
                  <Play size={12} />
                  Canal del Congreso
                </a>
              </div>
            </div>
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
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
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
                <a href="https://gqr.sh/7mDQ" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-sans-tech font-medium hover:bg-blue-700 transition-colors">
                  <ExternalLink size={14} />
                  Registrarse
                </a>
              </div>
            </div>
          </div>
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
                { fecha: '3 feb. 2026', texto: 'El Sen. Saúl Monreal Ávila presenta la iniciativa formal para adicionar la fracción XXXII al Artículo 73 de la Constitución.' },
                { fecha: '17 feb. 2026', texto: 'La Cámara de Diputados aprueba por unanimidad (442 votos) reforma al Art. 20 Quáter de la LGAMVLV para sancionar deepfakes de contenido sexual. Remitida al Senado.', highlight: false },
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

        {/* ===== SECTION: Contexto Legislativo Paralelo ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Landmark size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Contexto Legislativo Paralelo</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Legislación complementaria en curso</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-blue-600" />
                <h4 className="font-sans-tech text-sm font-semibold text-blue-900">Reforma contra deepfakes — Cámara de Diputados (17 feb. 2026)</h4>
              </div>
              <p className="text-xs text-blue-800 font-sans-tech leading-relaxed">
                La Cámara de Diputados aprobó por unanimidad (442 votos) una reforma al Art. 20 Quáter de la Ley General de Acceso de las Mujeres a una Vida Libre de Violencia (LGAMVLV) para sancionar la violencia digital mediante IA generativa (deepfakes de contenido sexual). Ya fue remitida al Senado.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-gray-500" />
                <h4 className="font-sans-tech text-sm font-semibold text-gray-900">Ley Federal para el Desarrollo Ético, Soberano e Inclusivo de la IA (MORENA/PVEM)</h4>
              </div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">
                Propuesta en Cámara de Diputados que incluye reformas al Código Penal Federal y a la Ley Federal del Derecho de Autor en materia de IA generativa. Incluye protección específica para actores de doblaje y creadores frente al uso de sus voces e imágenes por sistemas de IA.
              </p>
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
              <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group">
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
              <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group">
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
            <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso México</p>
                <p className="text-xs text-gray-500 font-sans-tech">YouTube</p>
              </div>
            </a>
            <a href="https://www.youtube.com/c/senadomexico" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group">
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
              { titulo: 'Ley General de Inteligencia Artificial v1 — Dictamen (PDF, Comisión de IA del Senado)', url: 'https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing' },
              { titulo: 'Senado de México publica iniciativa de ley para regular IA — Mobile Time', url: 'https://mobiletime.la/noticias/03/10/2025/senado-regular-ia/' },
              { titulo: 'Comisión del Senado impulsa ley general para regular la IA — Noticiero Gubernamental', url: 'https://www.noticierogubernamental.com/comision-del-senado-impulsa-ley-general-para-regular-y-fomentar-el-uso-de-la-inteligencia-artificial/' },
              { titulo: 'Legislar IA sin definirla: Artículo 19 critica reforma aprobada en SLP — La Orquesta', url: 'https://laorquesta.mx/legislar-ia-sin-definirla-articulo-19-critica-reforma-aprobada-en-slp/' },
              { titulo: '¿Regulación de la Inteligencia Artificial en México? — El Economista', url: 'https://www.eleconomista.com.mx/opinion/regulacion-inteligencia-artificial-mexico-20250929-779193.html' },
              { titulo: 'México: Las diversas iniciativas de regulación de la IA — CeCo', url: 'https://centrocompetencia.com/mexico-las-diversas-iniciativas-de-regulacion-de-la-ia/' },
              { titulo: "Mexico's Sandbox Dilemma: Aligning Institutions for Adaptive Tech Regulation — Sissi De La Peña (UC Berkeley, 2024–2025)", url: 'https://gspp.berkeley.edu/assets/uploads/page/Sissi_De_La_Pena_Mexico_Sandbox_Dilemma.pdf' },
            ].map((ref, i) => (
              <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group">
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
