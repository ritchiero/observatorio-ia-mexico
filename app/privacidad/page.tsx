import type { Metadata } from 'next';
import Link from 'next/link';

// Aviso de privacidad integral (LFPDPPP arts. 15-16 y Lineamientos del Aviso de
// Privacidad). Nace de la auditoría externa del 1-sep-2026: el formulario recaba
// nombre, correo y teléfono con consentimiento para WhatsApp, y el sitio no tenía
// aviso alguno. Server component estático. La versión coincide con
// SUBSCRIPTION_CONSENT_VERSION para que el consentimiento registrado en cada
// suscripción apunte a un texto concreto.

export const metadata: Metadata = {
  title: 'Aviso de privacidad',
  description:
    'Aviso de privacidad del Observatorio IA México: qué datos personales recabamos al suscribirte, para qué los usamos, quién los resguarda y cómo ejercer tus derechos ARCO.',
  alternates: { canonical: '/privacidad', languages: { es: '/privacidad', en: '/en/privacidad' } },
};

const VERSION_AVISO = '2026-09-01';
const RESPONSABLE = 'Lawgic Lessons SAPI de C.V.';
// Domicilio del responsable: dato que sólo puede confirmar el titular del
// proyecto. Mientras esté vacío, la sección lo omite en lugar de inventarlo.
const DOMICILIO = '';
const CONTACTO = 'ricardo.rodriguez@getlawgic.com';

const H2 = 'font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-4';
const P = 'font-sans-tech text-[15px] text-gray-700 leading-relaxed';
const LI = 'flex gap-3';
const DASH = <span className="text-cyan-600 mt-0.5">—</span>;

export default function AvisoPrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="font-sans-tech text-[11px] uppercase tracking-[0.22em] text-cyan-700 mb-4">Aviso de privacidad · versión {VERSION_AVISO}</p>
          <h1 className="font-serif-display text-4xl md:text-6xl font-light text-gray-900 leading-[1.02] tracking-tight">
            Qué hacemos con <em className="italic text-cyan-700">tus datos</em>.
          </h1>
          <p className="font-serif-display text-lg md:text-xl text-gray-600 mt-6 max-w-2xl leading-relaxed">
            El Observatorio sólo recaba datos personales cuando te suscribes a sus actualizaciones. Este aviso explica cuáles, para qué,
            quién los resguarda y cómo puedes <strong className="text-gray-900 font-medium">acceder, corregir, cancelar u oponerte</strong> en cualquier momento.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">

        <section>
          <h2 className={H2}>01 · Responsable</h2>
          <p className={P}>
            El responsable del tratamiento de tus datos personales es <strong className="text-gray-900 font-medium">{RESPONSABLE}</strong>,
            que opera el sitio <span className="text-gray-900">observatorio-ia-mexico.com</span> (en adelante, el Observatorio).
            {DOMICILIO ? <> Domicilio: {DOMICILIO}.</> : null}
            {' '}Para cualquier asunto relacionado con este aviso escribe a{' '}
            <a href={`mailto:${CONTACTO}`} className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2">{CONTACTO}</a>.
          </p>
        </section>

        <section>
          <h2 className={H2}>02 · Datos que recabamos</h2>
          <p className={P}>Únicamente a través del formulario de suscripción, y sólo los que tú proporcionas:</p>
          <ul className={`mt-4 space-y-2 ${P}`}>
            <li className={LI}>{DASH}<span><strong className="text-gray-900 font-medium">Nombre</strong>, para dirigirnos a ti.</span></li>
            <li className={LI}>{DASH}<span><strong className="text-gray-900 font-medium">Correo electrónico</strong>, para enviarte las actualizaciones.</span></li>
            <li className={LI}>{DASH}<span><strong className="text-gray-900 font-medium">Teléfono móvil</strong>, para enviarte avisos por WhatsApp.</span></li>
            <li className={LI}>{DASH}<span>La <strong className="text-gray-900 font-medium">fecha y versión del consentimiento</strong> que otorgaste para cada canal, como constancia.</span></li>
          </ul>
          <p className={`mt-4 ${P}`}>
            No recabamos datos sensibles. Navegar el sitio, consultar el tracker, el mapa o la hemeroteca no requiere registro ni datos personales.
          </p>
        </section>

        <section>
          <h2 className={H2}>03 · Para qué los usamos</h2>
          <p className={P}><strong className="text-gray-900 font-medium">Finalidades primarias</strong> — las que dan origen a la relación contigo:</p>
          <ul className={`mt-3 space-y-2 ${P}`}>
            <li className={LI}>{DASH}<span>Enviarte el recap mensual del Observatorio por correo electrónico.</span></li>
            <li className={LI}>{DASH}<span>Avisarte por correo o WhatsApp cuando cambie el estatus de un anuncio, iniciativa o caso que seguimos.</span></li>
            <li className={LI}>{DASH}<span>Conservar constancia de tu consentimiento y atender tus solicitudes de baja o de derechos ARCO.</span></li>
          </ul>
          <p className={`mt-4 ${P}`}>
            <strong className="text-gray-900 font-medium">Finalidades secundarias</strong> — ninguna. No usamos tus datos para publicidad, perfilado comercial ni los cedemos a terceros con fines propios.
          </p>
        </section>

        <section>
          <h2 className={H2}>04 · Dónde se resguardan y quién los trata por nuestra cuenta</h2>
          <p className={P}>
            Tus datos se almacenan en infraestructura de Google Cloud (Firebase / Firestore) y el sitio se aloja en Vercel. Ambos actúan
            como encargados del tratamiento bajo sus propios términos y medidas de seguridad; no deciden sobre tus datos ni los usan para
            fines propios. El correo se envía mediante un proveedor de mensajería transaccional y los avisos por WhatsApp a través de la
            plataforma de WhatsApp Business. Fuera de estos encargados, <strong className="text-gray-900 font-medium">no transferimos tus datos a terceros</strong>,
            salvo requerimiento fundado y motivado de autoridad competente.
          </p>
        </section>

        <section>
          <h2 className={H2}>05 · Tus derechos (ARCO) y cómo ejercerlos</h2>
          <p className={P}>
            Tienes derecho a <strong className="text-gray-900 font-medium">acceder</strong> a tus datos, <strong className="text-gray-900 font-medium">rectificarlos</strong> si son inexactos,
            <strong className="text-gray-900 font-medium"> cancelarlos</strong> y <strong className="text-gray-900 font-medium">oponerte</strong> a su tratamiento, así como a revocar el consentimiento que nos diste.
          </p>
          <ul className={`mt-4 space-y-2 ${P}`}>
            <li className={LI}>{DASH}<span>Envía tu solicitud a <a href={`mailto:${CONTACTO}?subject=Derechos%20ARCO%20-%20Observatorio%20IA%20M%C3%A9xico`} className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2">{CONTACTO}</a> con el asunto «Derechos ARCO – Observatorio IA México», indicando qué derecho ejerces y el correo con el que te suscribiste.</span></li>
            <li className={LI}>{DASH}<span>Te responderemos en un plazo máximo de <strong className="text-gray-900 font-medium">20 días hábiles</strong>, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</span></li>
            <li className={LI}>{DASH}<span>Para <strong className="text-gray-900 font-medium">darte de baja</strong> de cualquier canal basta con pedirlo por el mismo correo; la baja es inmediata y no afecta el tratamiento previo.</span></li>
          </ul>
          <p className={`mt-4 ${P}`}>
            Si consideras que tu derecho a la protección de datos ha sido vulnerado, puedes acudir a la autoridad competente en materia de
            protección de datos personales.
          </p>
        </section>

        <section>
          <h2 className={H2}>06 · Cookies y analítica</h2>
          <p className={P}>
            El sitio usa una cookie funcional (<code className="text-[13px] bg-gray-100 px-1.5 py-0.5 rounded">hl</code>) para recordar tu idioma, y herramientas de analítica —Google Analytics 4,
            cargado mediante Google Tag Manager, y Vercel Analytics— que recogen datos agregados de navegación (páginas vistas, país, tipo de
            dispositivo) para entender cómo se usa el Observatorio. No los cruzamos con tu suscripción. Puedes bloquear o borrar estas cookies
            desde la configuración de tu navegador, o usar el complemento de inhabilitación de Google Analytics; el sitio seguirá funcionando.
          </p>
        </section>

        <section>
          <h2 className={H2}>07 · Cambios a este aviso</h2>
          <p className={P}>
            Cuando el aviso cambie, publicaremos la nueva versión en esta misma página con su fecha. Si el cambio afecta las finalidades o los
            datos que recabamos, lo comunicaremos también por correo a las personas suscritas. Versión vigente: <strong className="text-gray-900 font-medium">{VERSION_AVISO}</strong>.
          </p>
        </section>

        <p className="font-sans-tech text-sm text-gray-500 border-t border-gray-200 pt-6">
          Este aviso forma parte de la gobernanza pública del Observatorio. Ver también <Link href="/metodologia" className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2">cómo verificamos los datos</Link>.
        </p>
      </div>
    </div>
  );
}
