import Link from 'next/link';
import MonitoreoLegislativo from '@/components/MonitoreoLegislativo';
import { ArrowLeft, Calendar, ExternalLink, Play, Tv, Radio, Clock, Users, AlertCircle, Scale, Shield, Building2, Database, Lightbulb, Globe, FileText, BookOpen, ChevronRight, MessageSquareWarning, History, Landmark, ScrollText, Eye, Gavel, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Ley General de IA Bill — Tracker (In Progress) | Observatorio IA México',
  description: 'Tracking the proposed Ley General de Inteligencia Artificial (General Law on Artificial Intelligence) in Mexico. IMPORTANT: this is a bill still moving through the legislature, NOT a law in force. Bill contents, timeline and resources.',
  alternates: { canonical: '/en/proceso-legislativo', languages: { es: '/proceso-legislativo', en: '/en/proceso-legislativo' } },
};

export default function ProcesoLegislativoPageEn() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">

        <Link href="/en" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-8 font-sans-tech">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/50 rounded-full mb-4">
            <Clock size={14} className="text-amber-600" />
            <span className="text-xs font-sans-tech text-amber-700 font-medium">Bill in progress · tracker</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3">
            The <span className="italic text-emerald-600">Ley General de IA</span> Bill
          </h1>
          <p className="text-gray-600 font-sans-tech text-sm sm:text-base max-w-3xl">
            Tracking the proposed comprehensive AI regulatory framework for Mexico: the bill&apos;s contents, the legislative timeline, key concerns and resources.
          </p>
        </div>

        {/* Disclaimer: bill ≠ law in force */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <MessageSquareWarning size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans-tech text-sm font-bold text-amber-900 mb-1">This is a bill, NOT a law in force</h3>
              <p className="text-amber-900 font-sans-tech text-sm leading-relaxed">
                As of <strong>May 29, 2026</strong>, the Ley General de IA (General Law on Artificial Intelligence) <strong>has not been approved or published</strong>. It is a proposal still moving through the Senado (Senate). The only AI regulation with binding effect published in Mexico is the reform to the LFT (Federal Labor Law) and LFDA (Federal Copyright Law), published in the DOF (Diario Oficial de la Federación — Official Gazette) on May 14, 2026, which is separate from this bill.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-2">Current status</h3>
              <p className="text-gray-700 font-sans-tech text-sm leading-relaxed">
                There are three parallel tracks: (1) a <strong>constitutional amendment to Art. 73</strong> from the Senate (Sen. Saúl Monreal) to empower Congress to legislate on AI, (2) a <strong>Ley General de IA proposal</strong> from the Comisión de IA del Senado (the Senate&apos;s AI Commission), led by Sen. Rolando Zapata, and (3) since <strong>August 5, 2026</strong>, a new <strong>amendment to section XVII of Art. 73</strong> filed before the Comisión Permanente (Permanent Commission) by <strong>Gabriela Jiménez Godoy</strong>, deputy coordinator of Morena in the Cámara de Diputados (Chamber of Deputies) — presented as a project of the majority caucus, with AI regulation announced by Ricardo Monreal as a top agenda item for the session starting September 1. The vote originally expected for <strong>February 25, 2026 did not take place</strong>; the Senate tracks remain <strong>in committee, with no date set for a dictamen (committee report) or a floor vote</strong>. This page documents the content and progress of the proposal, not a law in force.
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
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">What does the bill propose?</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Contents and structure of the proposal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Landmark size={16} className="text-amber-600" /><h4 className="font-sans-tech text-sm font-semibold text-amber-900">1. Constitutional Reform to Art. 73</h4></div>
              <p className="text-sm text-amber-800 font-sans-tech leading-relaxed">Bill from Sen. Saúl Monreal Ávila to add a fracción XXXII (subsection XXXII) to <strong>Article 73</strong>, granting Congress the power to enact a general law on AI.</p>
              <p className="text-xs text-amber-700 font-sans-tech mt-2 italic">Note: The formal bill filed on February 3, 2026 <strong>only amends Art. 73</strong>. A reform to Art. 3 was considered in the October 2025 Propuesta de Marco Normativo (Proposed Regulatory Framework), but it was never filed as a formal bill before the Senado.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><FileText size={16} className="text-blue-600" /><h4 className="font-sans-tech text-sm font-semibold text-blue-900">2. Ley General de IA (LGIA v1)</h4></div>
              <p className="text-sm text-blue-800 font-sans-tech leading-relaxed">Proposal from the Comisión de IA del Senado. Contains <strong>223 articles + 10 transitory articles + a Regulatory Glossary</strong> across 14 Títulos (Titles). The result of consultation with <strong>72 specialists</strong>.</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-1">Structure: the 14 Títulos of LGIA v1</h3>
            <p className="text-xs text-gray-500 font-sans-tech mb-3">223 articles + 10 transitory articles + Regulatory Glossary</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs font-sans-tech">
                <thead><tr className="bg-emerald-50 border-b border-emerald-200"><th className="text-left p-2 pl-3 text-emerald-800 font-semibold w-12">Title</th><th className="text-left p-2 text-emerald-800 font-semibold">Contents</th><th className="text-left p-2 pr-3 text-emerald-800 font-semibold w-24">Relevance</th></tr></thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">1st</td><td className="p-2 text-gray-700">General Provisions (purpose, definitions, scope)</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Foundational</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">2nd</td><td className="p-2 text-gray-700">Ethical Principles, Human Rights and Neurorights</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">3rd</td><td className="p-2 text-gray-700">Governance and Multilevel Coordination</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">4th</td><td className="p-2 text-gray-700">National Strategy and Public Policy on AI</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Strategic</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">5th</td><td className="p-2 text-gray-700">Governing Institutions (SECIHTI, ATDT, National Authority)</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">6th</td><td className="p-2 text-gray-700">Education, Training and Digital Culture</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Important</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">7th</td><td className="p-2 text-gray-700">Gender Perspective, Inclusion and Non-Discrimination</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Important</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">8th</td><td className="p-2 text-gray-700">Promotion of Development, Innovation and National Capabilities</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Strategic</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">9th</td><td className="p-2 text-gray-700">Risk Assessment, Classification and Management</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">10th</td><td className="p-2 text-gray-700">Prohibited and High-Risk Applications</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">11th</td><td className="p-2 text-gray-700">Rights and Obligations (Developers, Operators, Users)</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                  <tr className="border-b border-gray-100 bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">12th</td><td className="p-2 text-gray-700">Transparency, Accountability and Open Data</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Important</span></td></tr>
                  <tr className="border-b border-gray-100 bg-white"><td className="p-2 pl-3 font-semibold text-emerald-700">13th</td><td className="p-2 text-gray-700">Administrative Procedures</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">Operational</span></td></tr>
                  <tr className="bg-gray-50"><td className="p-2 pl-3 font-semibold text-emerald-700">14th</td><td className="p-2 text-gray-700">Violations, Liability and Sanctions</td><td className="p-2 pr-3"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Critical</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Database size={16} className="text-indigo-600" /><h3 className="font-sans-tech text-sm font-semibold text-indigo-900">Mexico&apos;s First Federal Definition of AI (Art. 4, fracc. XX)</h3></div>
            <p className="text-xs text-indigo-800 font-sans-tech leading-relaxed italic border-l-2 border-indigo-300 pl-3 mb-3">&quot;A socio-technical system based on computational or mathematical models that, through the processing of data, signals or instructions, performs functions of learning, reasoning, prediction, classification, content generation or language understanding, with the aim of producing results, decisions or actions that, if carried out exclusively by people, would require human intelligence or judgment; and that may operate autonomously, semi-autonomously or with human assistance.&quot;</p>
            <p className="text-xs text-indigo-700 font-sans-tech">Broader than the definition in the European AI Act, and it explicitly includes generative AI. Art. 4 sets out a glossary of <strong>49 legal definitions</strong>: algorithmic bias, deepfake, regulatory sandbox, GPAI, foundation model, critical autonomous system, systemic AI risk and technological sovereignty, among others. The Anexos (Annexes) add 14 supplementary technical definitions.</p>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Institutional Architecture (Título Quinto / Title Five)</h3>
            <p className="text-xs text-gray-500 font-sans-tech mb-3">LGIA v1 draws a line between the strategic scientific-technological function (SECIHTI) and the operational digital-transformation function (ATDT):</p>
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-emerald-900 mb-1">Autoridad Nacional en IA (National AI Authority)</p><p className="text-xs text-emerald-800 font-sans-tech leading-relaxed">The national governing body. Coordinates, oversees and regulates implementation of the law.</p></div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-blue-900 mb-1">SECIHTI — Secretaría de Ciencia, Humanidades, Tecnología e Innovación (Ministry of Science, Humanities, Technology and Innovation)</p><p className="text-xs text-blue-800 font-sans-tech leading-relaxed">Responsible for R&amp;D policy and scientific-technological promotion in AI.</p></div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-purple-900 mb-1">ATDT — Agencia de Transformación Digital y Telecomunicaciones (Digital Transformation and Telecommunications Agency)</p><p className="text-xs text-purple-800 font-sans-tech leading-relaxed">Responsible for the operational function: implementation, oversight and digital transformation.</p></div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-teal-900 mb-1">Sistema Nacional de IA (National AI System)</p><p className="text-xs text-teal-800 font-sans-tech leading-relaxed">A coordination framework spanning the three levels of government, the private sector, academia and civil society.</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-amber-900 mb-1">Consejo Consultivo Nacional (National Advisory Council)</p><p className="text-xs text-amber-800 font-sans-tech leading-relaxed">A multi-sector, non-binding body. Issues recommendations and promotes public participation.</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Guiding Principles (Art. 11)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">A human-centered approach and protection of human rights</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Inclusion and non-discrimination</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Transparency and explainability of algorithms</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Safety, reliability and robustness of systems</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Privacy and data governance</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Accountability and human oversight</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Sustainability and promotion of innovation</p></div>
              <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 sm:col-span-2"><ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-gray-700">Protection of labor, cultural, creative and intellectual-property rights, including for actors, artists, writers, journalists, composers and other creators</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Key Mechanisms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Scale size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Risk-Based Approach</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">LGIA v1 uses three categories: <strong>prohibited applications</strong> (Título Décimo / Title Ten), <strong>high-risk systems</strong> subject to reinforced obligations, and <strong>limited-use or personal systems</strong> subject to baseline principles. It does not use the exact nomenclature of the European AI Act.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Building2 size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Prohibited Applications (Título Décimo / Title Ten)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Prohibits: coercive cognitive manipulation, state-run social scoring (puntuación social), mass biometric identification without a legal basis, and any application that violates human rights or national security.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Database size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Registro Nacional de Sistemas (National Systems Registry)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Mandatory registration of high-risk AI systems, with technical documentation, impact assessments and periodic audits.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Lightbulb size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Regulatory Sandboxes (Art. 4, fracc. XXXVI)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Controlled environments for testing high-risk AI systems. Open to <strong>any actor</strong>, not limited to SMEs or startups.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Globe size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">43 Ordenamientos (Related Statutes) — Art. 9</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Art. 9 lists 43 ordenamientos (general and federal laws, codes and the T-MEC / USMCA) with which the LGIA must be interpreted and applied in harmony.</p></div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-emerald-600" /><h4 className="font-sans-tech text-sm font-semibold text-gray-900">Extraterritorial Scope (Art. 6)</h4></div><p className="text-xs text-gray-600 font-sans-tech leading-relaxed">Applies to AI systems that have effects in Mexico or that are used by foreign entities providing services to Mexican residents. Art. 7 lists 31 specific sectoral scopes.</p></div>
            </div>
          </div>

          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Eye size={16} className="text-purple-600" /><h3 className="font-sans-tech text-sm font-semibold text-purple-900">Five Neurorights Recognized (Art. 18)</h3></div>
            <p className="text-xs text-purple-700 font-sans-tech mb-3">Mexico would be among the first countries to recognize neurorights at the level of ordinary statute (Chile did so at the constitutional level in 2021):</p>
            <div className="space-y-1">
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">I. Personal identity and psychological continuity</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">II. Mental privacy</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">III. Cognitive integrity and protection against non-consensual interference</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">IV. Free will and autonomy</p></div>
              <div className="flex items-start gap-2"><ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" /><p className="text-xs font-sans-tech text-purple-800">V. Fairness and protection against undue neurotechnological manipulation</p></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-sans-tech text-sm font-semibold text-gray-800 mb-3">Sanctions Regime — Título Décimo Cuarto / Title Fourteen (Arts. 208-222)</h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-yellow-900 mb-1">Minor Violations (Art. 209)</p><p className="text-xs text-yellow-800 font-sans-tech leading-relaxed">Formal omissions relating to transparency, registration or notification.</p></div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-orange-900 mb-1">Serious Violations (Art. 210)</p><p className="text-xs text-orange-800 font-sans-tech leading-relaxed">Failure to conduct impact assessments or audits, or lack of human oversight in high-risk systems.</p></div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm font-sans-tech font-semibold text-red-900 mb-1">Most Serious Violations (Art. 211)</p><p className="text-xs text-red-800 font-sans-tech leading-relaxed">Use of prohibited applications, serious harm to human rights, systematic discrimination, or harm to national security.</p></div>
            </div>
            <p className="text-xs text-gray-500 font-sans-tech mt-3 italic">Sanctions (Art. 217): formal warning, fines, disqualification, suspension or withdrawal of the system, and full remediation of harm. Repeat serious or most-serious violations can double the sanctions (Art. 222).</p>
          </div>

          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-amber-600" /><h3 className="font-sans-tech text-sm font-semibold text-amber-900">Transitional Regime — Key Deadlines</h3></div>
            <div className="space-y-2">
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">Day after DOF</span><p className="text-xs font-sans-tech text-amber-800">The Law takes effect</p></div>
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">90 days</span><p className="text-xs font-sans-tech text-amber-800">Autoridad Nacional en IA and Consejo Consultivo Nacional installed</p></div>
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">180 days</span><p className="text-xs font-sans-tech text-amber-800">Implementing regulations for the Law + National AI Strategy</p></div>
              <div className="flex items-start gap-3 border-b border-amber-200 pb-2"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">365 days</span><p className="text-xs font-sans-tech text-amber-800">Legal harmonization across the three levels of government and autonomous bodies</p></div>
              <div className="flex items-start gap-3"><span className="text-xs font-sans-tech font-bold text-amber-700 w-36 flex-shrink-0">2 years</span><p className="text-xs font-sans-tech text-amber-800">Registration, classification and adaptation of pre-existing AI systems</p></div>
            </div>
          </div>

        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><History size={18} className="text-indigo-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Where did the bill come from?</h2><p className="text-xs text-gray-500 font-sans-tech">Origins and consultation process</p></div>
          </div>
          <p className="text-sm text-gray-700 font-sans-tech leading-relaxed mb-4">The regulatory framework is the culmination of a process that began in 2023 and gathered pace throughout 2024 and 2025.</p>
          <div className="space-y-3">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">The Need for Legal Certainty</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">The rapid advance of AI in Mexico created a regulatory vacuum that generated uncertainty for investment and risks to citizens&apos; rights.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Precursor Bills</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Since 2023, at least six bills have been introduced in Congress, including proposals from Dip. Ricardo Monreal and Sen. Clemente Castañeda.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">Open Parliament Process</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">The Comisión de IA del Senado, chaired by Sen. Rolando Rodrigo Zapata Bello, held 6 discussion forums with 72 experts, whose 34 recommendations form the core of the proposal.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">International Influence</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Inspired by the EU&apos;s AI Act, adopting a risk-classification approach. Mexico&apos;s definition of AI is broader than Europe&apos;s and explicitly includes generative AI.</p></div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4"><h4 className="font-sans-tech text-sm font-semibold text-indigo-900 mb-1">An Unprecedented Transparency Note</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">LGIA v1 itself includes a &quot;Nota de Transparencia y Buenas Prácticas Editoriales&quot; (Transparency and Good Editorial Practice Note), in which the Commission acknowledges having used generative-AI tools for auxiliary tasks in the formal editing of the text, under permanent human supervision. This is unprecedented in Mexican legislation.</p></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center"><BookOpen size={18} className="text-teal-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">How can I read the bill?</h2><p className="text-xs text-gray-500 font-sans-tech">Official documents and sources</p></div>
          </div>
          <p className="text-sm text-gray-700 font-sans-tech leading-relaxed mb-4">The legislative process involves two documents: the Iniciativa de Reforma al Art. 73 (Art. 73 Reform Bill), filed by Sen. Saúl Monreal Ávila, and the text of the Ley General de IA drafted by the Comisión de IA del Senado, chaired by Sen. Rolando Zapata Bello.</p>
          <div className="space-y-3">
            <a href="http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5014841_20260217_1770228073.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors"><FileText size={20} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">Iniciativa de Reforma al Artículo 73 Constitucional (Bill to Reform Article 73 of the Constitution)</p><p className="text-xs text-teal-700 font-sans-tech mt-1">Official document — Sen. Saúl Monreal Ávila — PDF (SIL, Secretaría de Gobernación)</p></div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>
            <a href="https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-xl p-5 hover:border-teal-400 transition-colors group">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors"><FileText size={20} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-sans-tech font-semibold text-teal-900 group-hover:text-teal-700">Ley General de Inteligencia Artificial — Dictamen (Committee Report)</p><p className="text-xs text-teal-700 font-sans-tech mt-1">LGIA v1 — PDF published by the Comisión de IA del Senado</p></div>
              <ExternalLink size={16} className="text-teal-400 flex-shrink-0 group-hover:text-teal-600" />
            </a>
            <a href="https://sil.gobernacion.gob.mx/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600 transition-colors"><Globe size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-sans-tech font-medium text-gray-700 group-hover:text-gray-900">Sistema de Información Legislativa (SIL — Legislative Information System) — Secretaría de Gobernación</p><p className="text-xs text-gray-400 font-sans-tech mt-0.5">sil.gobernacion.gob.mx</p></div>
              <ExternalLink size={14} className="text-gray-300 flex-shrink-0 group-hover:text-gray-500" />
            </a>
          </div>
          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">The LGIA v1 dictamen (committee report) is available at the link above. The Art. 73 reform bill was published in the SIL of the Secretaría de Gobernación on February 17, 2026.</p>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Clock size={18} className="text-orange-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Legislative Timeline</h2><p className="text-xs text-gray-500 font-sans-tech">Key milestones in the process</p></div>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-orange-200" />
            <div className="space-y-4">
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Mar. 30, 2023</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">The first bill, a &quot;Ley para la Regulación Ética de la IA y la Robótica&quot; (Law for the Ethical Regulation of AI and Robotics), is introduced.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Sep. 20, 2023</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">A proposed reform to Article 73 of the Constitution to cover AI, cybersecurity and neurorights is introduced.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Oct. 2024 – Apr. 2025</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">The Comisión de IA del Senado holds 6 discussion forums with 72 experts from industry, academia, government and civil society.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Oct. 3, 2025</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">The Comisión de IA publishes the &quot;Propuesta de Marco Normativo para la IA en México&quot; (Proposed Regulatory Framework for AI in Mexico), contemplating reforms to Arts. 3 and 73.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Oct. 16, 2025</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">The Comisión de IA approves its annual work plan, prioritizing the drafting of the Ley General de IA.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Feb. 3, 2026</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">Sen. Saúl Monreal Ávila files the formal bill to amend only Article 73 of the Constitution (adding a fracción XXXII).</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-orange-500" /></div><div className="flex-1 pb-2"><p className="text-xs font-sans-tech font-semibold text-gray-500">Feb. 17, 2026</p><p className="text-sm font-sans-tech mt-0.5 text-gray-700">The Cámara de Diputados (Chamber of Deputies) unanimously approves (442 votes) the reform to penalize sexual deepfakes. Sent to the Senado (Senate).</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-500 ring-4 ring-orange-100 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-white" /></div><div className="flex-1 pb-2 bg-orange-50 border border-orange-200 rounded-xl p-3 -mt-1"><p className="text-xs font-sans-tech font-semibold text-orange-700">Feb. 25, 2026</p><p className="text-sm font-sans-tech mt-0.5 text-orange-900 font-medium">Date scheduled for the floor vote on the Ley General de Inteligencia Artificial in the Senado.</p></div></div>
              <div className="flex items-start gap-4 relative"><div className="w-8 h-8 rounded-full bg-orange-500 ring-4 ring-orange-100 flex items-center justify-center flex-shrink-0 z-10"><div className="w-2 h-2 rounded-full bg-white" /></div><div className="flex-1 pb-2 bg-orange-50 border border-orange-200 rounded-xl p-3 -mt-1"><p className="text-xs font-sans-tech font-semibold text-orange-700">Feb. 26, 2026</p><p className="text-sm font-sans-tech mt-0.5 text-orange-900 font-medium">&quot;Del Senado a la Industria&quot; (From the Senado to Industry) forum to explain the scope of the new law to the business sector.</p></div></div>
            </div>
          </div>
        </section>

        <MonitoreoLegislativo locale="en" />

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center"><Gavel size={18} className="text-teal-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Parallel Legislative Context</h2><p className="text-xs text-gray-500 font-sans-tech">Related legislation in progress</p></div>
          </div>
          <div className="space-y-3">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><CheckCircle size={14} className="text-teal-600" /><h4 className="font-sans-tech text-sm font-semibold text-teal-900">Deepfakes Reform — Approved in the Cámara de Diputados (Feb. 17, 2026)</h4></div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">The Cámara de Diputados unanimously approved (442 votes) the reform to Art. 20 Quáter of the LGAMVLV (Ley General de Acceso de las Mujeres a una Vida Libre de Violencia — General Law on Women&apos;s Access to a Life Free of Violence), to penalize digital violence carried out through generative AI (sexual deepfakes). Already sent to the Senado.</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-teal-600" /><h4 className="font-sans-tech text-sm font-semibold text-teal-900">Ley Federal para el Desarrollo Ético, Soberano e Inclusivo de la IA (Federal Law for the Ethical, Sovereign and Inclusive Development of AI) — In the Cámara de Diputados</h4></div>
              <p className="text-xs text-gray-700 font-sans-tech leading-relaxed">A 2025 proposal from MORENA/PVEM that includes reforms to the Código Penal Federal (Federal Criminal Code) and the Ley Federal del Derecho de Autor (Federal Copyright Law) on generative AI. It includes specific protection for dubbing actors against the use of AI to replicate their voice without consent.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><MessageSquareWarning size={18} className="text-red-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Main Concerns and Criticisms</h2><p className="text-xs text-gray-500 font-sans-tech">Voices from civil society, academia and experts</p></div>
          </div>
          <p className="text-sm text-gray-600 font-sans-tech leading-relaxed mb-4">Despite broad consensus on the need to regulate AI, a range of concerns have emerged:</p>
          <div className="space-y-3">
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Risks to Free Expression and Privacy</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Organizations such as Article 19 warn that ambiguous concepts like &quot;undermining public trust&quot; or &quot;social peace&quot; could criminalize legitimate activities such as political criticism, satire or artistic creation.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Surveillance and National Security</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">The participation of SEDENA (the Defense Ministry), SEMAR (the Navy Ministry) and the Guardia Nacional (National Guard) in the discussion forums has raised concern about the potential use of AI for mass surveillance and facial recognition. The law prohibits mass biometric identification without a legal basis, but the practical limits remain a matter of debate.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Institutional Capacity</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Experts point out that the law&apos;s ambition could exceed the state&apos;s capacity to implement it. The 90-to-365-day deadlines for setting up institutions and issuing regulations are seen as very tight.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Intellectual Property and Creators&apos; Rights</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Strong tension surrounds the use of protected works to train AI models. LGIA v1&apos;s principles include protection for the rights of actors, writers, artists, journalists and composers, but the concrete mechanism is still pending regulation.</p></div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5"><h4 className="font-sans-tech text-sm font-semibold text-red-900 mb-2">Labor Rights</h4><p className="text-xs text-gray-700 font-sans-tech leading-relaxed">Unions and workers have expressed concern about job displacement, precarious employment and the need for a just transition.</p></div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><Play size={18} className="text-red-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Senado Floor Sessions</h2><p className="text-xs text-gray-500 font-sans-tech">Livestreamed</p></div>
          </div>
          <p className="text-gray-600 font-sans-tech text-sm mb-4">Both sessions will be livestreamed by the Canal del Congreso México on YouTube and over broadcast TV (channels 45.1, 45.2 and 45.3). The Ley General de IA is scheduled for the February 25 session.</p>
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-sans-tech font-semibold"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />KEY</span><span className="text-sm font-sans-tech font-medium text-gray-900">Wednesday, February 25</span></div>
                <div className="flex-1"><p className="text-sm text-gray-700 font-sans-tech">Ordinary Floor Session — <strong>Ley General de IA vote expected</strong></p></div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-red-700 transition-colors whitespace-nowrap"><Play size={12} />Canal del Congreso</a>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-sans-tech font-semibold"><Clock size={12} />SESSION</span><span className="text-sm font-sans-tech font-medium text-gray-900">Thursday, February 26</span></div>
                <div className="flex-1"><p className="text-sm text-gray-700 font-sans-tech">Ordinary Floor Session of the Senado</p></div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"><Play size={12} />Canal del Congreso</a>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">Canal del Congreso does not publish livestream links in advance; videos become available on YouTube once each session ends.</p>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={18} className="text-blue-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Special Webinar — Post-Legislative</h2><p className="text-xs text-gray-500 font-sans-tech">Exclusive for CANACINTRA (National Chamber of the Manufacturing Industry) members</p></div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-sans-tech font-semibold"><Calendar size={12} />Thursday, February 26, 10:00 a.m.</span></div>
            <h3 className="font-sans-tech text-sm font-semibold text-blue-900 mb-2">From the Senado to Industry: AI Legislative Outlook 2026</h3>
            <p className="text-sm text-blue-800 font-sans-tech leading-relaxed mb-3">Implement AI without putting your company at risk. Presented by <strong>Mtro. Alonso Bernardo Tamez Vélez</strong>, Secretario Técnico (Technical Secretary) of the Comisión de IA del Senado. Organized by the CANACINTRA Southeast Coahuila AI Committee.</p>
            <a href="https://gqr.sh/7mDQ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-sans-tech font-medium hover:bg-blue-700 transition-colors"><ExternalLink size={14} />Register</a>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Tv size={18} className="text-purple-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Available Videos</h2><p className="text-xs text-gray-500 font-sans-tech">Official Channel of the Senado de México and Canal del Congreso</p></div>
          </div>
          <div className="space-y-2">
            <a href="https://www.youtube.com/watch?v=4CblZopqEg4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Ordinary Senado Session — Feb. 18, 2026 (most recent session)</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">Feb. 18, 2026</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=yGHlnWu5Zjw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Ordinary Senado Session — Feb. 17, 2026</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">Feb. 17, 2026</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=K-lNHJkDYQk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Opening of the Senado&apos;s AI Workshop Series (chaired by Sen. Rolando Zapata Bello)</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">Feb. 11, 2025</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=H9qL7df8_as" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors"><Play size={16} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">Ordinary Meeting of the Comisión de Análisis, Seguimiento y Evaluación sobre la IA en México (Commission for the Analysis, Monitoring and Evaluation of AI in Mexico)</p><p className="text-xs text-gray-500 font-sans-tech mt-0.5">Oct. 16, 2025</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
          </div>
          <h3 className="font-sans-tech text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">Statements by Senators</h3>
          <div className="space-y-2">
            <a href="https://www.youtube.com/watch?v=F-oPzipptD4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">&quot;This bill seeks to establish the power to legislate on AI&quot;: Sen. Ruiz (GPMorena)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=1yTOMvW3W3c" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">&quot;AI-enabled fraud increased 2,000%&quot;: Sen. Martín (GPPAN)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=ryBajW8C0Lw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">&quot;Regulating AI means driving benefits and fighting bias&quot;: Sen. Sanmiguel (GPPAN)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=ysF__tvVrOw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">&quot;Regulating AI so it can coexist with humanity&quot;: Sen. Martha Márquez (PT)</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=vUvvOHRXnYc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">Discussion Forum &quot;AI: Challenges, Risks and Opportunities&quot; — Sen. Alejandra Lagunes</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=4p5iBGfgocg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">International Forum &quot;The Future of AI: Platforms and Social Media&quot;</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
            <a href="https://www.youtube.com/watch?v=a5eAK6A4am0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"><div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><Play size={14} className="text-white" /></div><div className="flex-1 min-w-0"><p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">&quot;The Impact of AI on Ethics, Human Rights and Public Policy&quot;</p></div><ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" /></a>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Radio size={18} className="text-amber-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Where to Follow the Sessions Live</h2></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><Play size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso México</p><p className="text-xs text-gray-500 font-sans-tech">YouTube</p></div></a>
            <a href="https://www.youtube.com/c/senadomexico" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group"><div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><Play size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Senado de México (official)</p><p className="text-xs text-gray-500 font-sans-tech">YouTube</p></div></a>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4"><div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"><Tv size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p><p className="text-xs text-gray-500 font-sans-tech">Broadcast TV — Channels 45.1, 45.2 and 45.3</p></div></div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4"><div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"><Tv size={16} className="text-white" /></div><div><p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p><p className="text-xs text-gray-500 font-sans-tech">Dish / Sky — Channel 145</p></div></div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><BookOpen size={18} className="text-gray-600" /></div>
            <div><h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">References and Sources</h2></div>
          </div>
          <div className="space-y-2">
            <a href="http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5014841_20260217_1770228073.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">1.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Iniciativa de Reforma al Art. 73 Constitucional (Art. 73 Reform Bill) — SIL, Secretaría de Gobernación (PDF)</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://drive.google.com/file/d/1IVWTfK74RSVAMDs6cZ8B-WLuafOygFmO/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">2.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Ley General de Inteligencia Artificial v1 — Dictamen (Committee Report) (PDF, Comisión de IA del Senado)</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://mobiletime.la/noticias/03/10/2025/senado-regular-ia/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">3.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Senado de México Publishes Bill to Regulate AI — Mobile Time</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://www.noticierogubernamental.com/comision-del-senado-impulsa-ley-general-para-regular-y-fomentar-el-uso-de-la-inteligencia-artificial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">4.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Senate Commission Pushes General Law to Regulate AI — Noticiero Gubernamental</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://laorquesta.mx/legislar-ia-sin-definirla-articulo-19-critica-reforma-aprobada-en-slp/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">5.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Legislating AI Without Defining It: Article 19 Criticizes Reform Approved in SLP — La Orquesta</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://www.eleconomista.com.mx/opinion/regulacion-inteligencia-artificial-mexico-20250929-779193.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">6.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Regulation of Artificial Intelligence in Mexico — El Economista</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://centrocompetencia.com/mexico-las-diversas-iniciativas-de-regulacion-de-la-ia/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">7.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Mexico: The Various AI Regulation Bills — CeCo</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
            <a href="https://gspp.berkeley.edu/assets/uploads/page/Sissi_De_La_Pena_Mexico_Sandbox_Dilemma.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"><span className="text-xs font-sans-tech text-gray-400 font-mono w-5 text-right flex-shrink-0">8.</span><p className="text-xs font-sans-tech text-gray-600 group-hover:text-emerald-700 transition-colors flex-1">Mexico&apos;s Sandbox Dilemma: Aligning Institutions for Adaptive Tech Regulation — Sissi De La Peña (UC Berkeley, 2024-2025)</p><ExternalLink size={12} className="text-gray-300 flex-shrink-0 group-hover:text-emerald-500" /></a>
          </div>
        </section>

        <div className="border-t border-gray-200 pt-8">
          <Link href="/en/anuncio/5ZS5BxrNE7nTBBNVdaEG" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-sans-tech font-medium transition-colors">
            <ExternalLink size={14} />
            View full record: Ley General de Inteligencia Artificial in the Senado
          </Link>
        </div>

      </main>
    </div>
  );
}
