'use client';

import { useEffect, useState } from 'react';

// Consentimiento de analítica (auditoría 1-sep-2026: GTM corría en el <head>
// sin aviso ni opción de exclusión). Modelo de EXCLUSIÓN, no de bloqueo: la
// analítica agregada arranca, se informa con un aviso enlazado al aviso de
// privacidad, y quien no quiera puede rechazarla con un clic. La elección se
// guarda en el navegador y se respeta en visitas posteriores. No hay datos
// personales en juego —GA4 y Vercel Analytics recogen navegación agregada—,
// por eso la exclusión es el equilibrio proporcional bajo la LFPDPPP.

const GTM_ID = 'GTM-KCCM2HNW';
const GA_ID = 'G-J8L5NBGJG7';
const KEY = 'oia-analitica';

type Eleccion = 'granted' | 'denied';

const T = {
  es: {
    texto: 'Usamos analítica agregada (Google Analytics y Vercel Analytics) para entender cómo se usa el Observatorio. No la cruzamos con tu suscripción.',
    aviso: 'Aviso de privacidad',
    ruta: '/privacidad',
    ok: 'Entendido',
    no: 'Rechazar analítica',
  },
  en: {
    texto: 'We use aggregate analytics (Google Analytics and Vercel Analytics) to understand how the Observatorio is used. We never link it to your subscription.',
    aviso: 'Privacy notice',
    ruta: '/en/privacidad',
    ok: 'Got it',
    no: 'Decline analytics',
  },
} as const;

function leer(): Eleccion | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function guardar(v: Eleccion) {
  try { localStorage.setItem(KEY, v); } catch { /* modo privado: la elección vale sólo esta visita */ }
}

declare global {
  interface Window { dataLayer?: unknown[]; [k: `ga-disable-${string}`]: boolean | undefined }
}

function cargarGtm() {
  if (document.getElementById('gtm-script')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.id = 'gtm-script';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

function desactivarGa() {
  // Bandera oficial de GA para no medir esta ventana aunque el script ya exista.
  window[`ga-disable-${GA_ID}`] = true;
  window.dataLayer?.push({ event: 'consent_update', analytics_storage: 'denied' });
}

export default function ConsentAnalytics({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const t = T[locale] ?? T.es;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const previa = leer();
    if (previa === 'denied') { desactivarGa(); return; }
    cargarGtm();
    if (previa === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const elegir = (v: Eleccion) => {
    guardar(v);
    if (v === 'denied') desactivarGa();
    setVisible(false);
  };

  return (
    <div role="region" aria-label={t.aviso} className="fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:right-5 md:bottom-5 md:max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur shadow-lg shadow-gray-900/10 p-4 font-sans-tech">
        <p className="text-[13px] leading-relaxed text-gray-700">
          {t.texto}{' '}
          <a href={t.ruta} className="text-cyan-700 underline underline-offset-2 hover:text-cyan-800">{t.aviso}</a>.
        </p>
        <div className="mt-3 flex gap-2 justify-end">
          <button type="button" onClick={() => elegir('denied')} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100">
            {t.no}
          </button>
          <button type="button" onClick={() => elegir('granted')} className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-gray-800">
            {t.ok}
          </button>
        </div>
      </div>
    </div>
  );
}
