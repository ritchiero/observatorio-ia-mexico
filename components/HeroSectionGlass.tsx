'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Tema dark (Holographic Glass)
import GrafoEcosistema from './GrafoEcosistema';

const T = {
  void: '#05070C', text: '#E7ECF7', body: '#B5BFD4', mute: '#7886A2',
  faint: '#48556F', cyan: '#3DE0FF', blue: '#4D7BFF', green: '#34E59C', violet: '#A47CFF',
};

interface HeroGlassProps {
  stats: { total: number; operando: number; enDesarrollo: number; incumplido: number; prometido: number };
  legStats?: { total: number; activas: number };
  casosStats?: { total: number; conCriterio: number };
  loading?: boolean;
  loadingLeg?: boolean;
  loadingCasos?: boolean;
}

export default function HeroSectionGlass({ stats, legStats, casosStats, loading, loadingLeg, loadingCasos }: HeroGlassProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Modal de suscripción (preservado del hero original)
  const [showModal, setShowModal] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    email: '',
    consentimientoEmail: false,
    website: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;
    const focusableSelector =
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const focusFirst = window.requestAnimationFrame(() => {
      dialog?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowModal(false);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [showModal]);

  // Header sticky con conciencia de scroll: se condensa y se opaca al bajar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menú móvil al pasar a desktop.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const navItems: [string, string][] = [['Tracker', '/'], ['Legislación', '/legislacion'], ['Casos', '/casos-ia'], ['Hemeroteca', '/hemeroteca'], ['Recap', '/recap'], ['Actividad', '/actividad']];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setFormMessage('');
    try {
      const response = await fetch('/api/suscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, origen: pathname || '/' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al suscribirse');
      setFormStatus('success');
      setFormMessage(data.message);
      setFormData({ email: '', consentimientoEmail: false, website: '' });
    } catch (error) {
      setFormStatus('error');
      setFormMessage(error instanceof Error ? error.message : 'Error al suscribirse');
    }
  };

  const nAnuncios = loading ? '—' : stats.total;
  const nProductos = loading ? '—' : stats.operando;
  const nIniciativas = loadingLeg !== false && !legStats?.total ? '—' : legStats?.total ?? '—';
  const nCasos = loadingCasos !== false && !casosStats?.total ? '—' : casosStats?.total ?? '—';
  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ background: T.void, color: T.text }}>
      {/* Fondo: gradientes holográficos */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 50% at 20% 30%, rgba(77,123,255,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 80% 70%, rgba(61,224,255,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 50% 100%, rgba(164,124,255,0.16) 0%, transparent 60%),
          linear-gradient(180deg, #06081A 0%, #04060F 100%)`,
      }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(to right, #1A2440 1px, transparent 1px), linear-gradient(to bottom, #1A2440 1px, transparent 1px)`,
        backgroundSize: '56px 56px', opacity: 0.18,
        maskImage: 'radial-gradient(ellipse at 50% 40%, #000 0%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 0%, transparent 85%)',
      }} />
      {/* EL MAPA VIVO — el grafo real del ecosistema como corazón del hero */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <GrafoEcosistema chrome={false} />
      </div>
      {/* legibilidad del texto sobre el mapa (izquierda) + fundido inferior */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(5,7,12,0.90) 0%, rgba(5,7,12,0.62) 34%, rgba(5,7,12,0.12) 62%, rgba(5,7,12,0.30) 100%)',
      }} />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-28 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(5,7,12,0) 0%, rgba(5,7,12,0.9) 100%)',
      }} />

      {/* Header glass FIJO — persiste en todo el scroll del home (el global se oculta en home).
          Se condensa y opaca al bajar; trae menú hamburguesa en móvil. */}
      <header className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-4 mx-3 md:mx-8 rounded-[100px] transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'} ${scrolled ? 'mt-2 px-4 md:px-7 py-2.5' : 'mt-4 md:mt-5 px-5 md:px-8 py-3.5 md:py-4'}`}
        style={{
          background: scrolled ? 'rgba(7,10,20,0.82)' : 'rgba(11,15,28,0.55)',
          backdropFilter: 'blur(22px) saturate(160%)', WebkitBackdropFilter: 'blur(22px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 12px 40px -12px rgba(0,0,0,0.65)' : 'none',
        }}>
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 shrink-0 group">
          <span className="transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-110"><IrisMark /></span>
          <div className="flex flex-col leading-none">
            <span className="font-mono uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: '0.28em', color: T.cyan }}>Observatorio · v.2026</span>
            <span className="font-sans-tech uppercase" style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: '0.04em' }}>IA México</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-7">
          {navItems.map(([t, h]) => {
            const active = pathname === h;
            return (
              <Link key={t} href={h} className="relative font-sans-tech group py-1" style={{ fontSize: 13, fontWeight: 500, color: active ? T.text : T.body, opacity: active ? 1 : 0.8 }}>
                <span className="transition-opacity group-hover:opacity-100" style={{ opacity: active ? 1 : 0.85 }}>{t}</span>
                <span className="absolute left-0 -bottom-0.5 h-[1.5px] rounded-full transition-transform duration-300 origin-left"
                  style={{ width: '100%', background: `linear-gradient(90deg, ${T.cyan}, ${T.blue})`, transform: active ? 'scaleX(1)' : 'scaleX(0)' }} />
                <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-full rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  style={{ background: `linear-gradient(90deg, ${T.cyan}, ${T.blue})` }} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={() => setShowModal(true)} className="hidden sm:flex font-sans-tech uppercase items-center gap-2.5 cursor-pointer transition-transform hover:scale-[1.04]"
            style={{ fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: T.void, padding: '10px 18px', borderRadius: 100, border: 'none', background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 100%)`, boxShadow: `0 8px 32px ${T.cyan}40, inset 0 1px 0 rgba(255,255,255,0.4)` }}>
            Suscribirse
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.void }} />
          </button>
          {/* Hamburguesa móvil */}
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menú" aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center cursor-pointer"
            style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: T.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </header>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden fixed inset-x-3 z-40 rounded-3xl p-3 flex flex-col gap-1" style={{
          top: scrolled ? 64 : 78, background: 'rgba(9,13,24,0.92)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 24px 60px -16px rgba(0,0,0,0.7)',
        }}>
          {navItems.map(([t, h]) => {
            const active = pathname === h;
            return (
              <Link key={t} href={h} onClick={() => setMenuOpen(false)} className="font-sans-tech px-4 py-3 rounded-2xl transition-colors"
                style={{ fontSize: 15, fontWeight: 500, color: active ? T.cyan : T.body, background: active ? 'rgba(61,224,255,0.08)' : 'transparent' }}>
                {t}
              </Link>
            );
          })}
          <button onClick={() => { setMenuOpen(false); setShowModal(true); }} className="mt-1 font-sans-tech uppercase flex items-center justify-center gap-2.5 cursor-pointer"
            style={{ fontSize: 13, letterSpacing: '0.1em', fontWeight: 600, color: T.void, padding: '13px 18px', borderRadius: 100, border: 'none', background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 100%)` }}>
            Suscribirse
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.void }} />
          </button>
        </div>
      )}

      {/* Contenido */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-8 px-6 md:px-12 lg:px-16 pt-28 lg:pt-32 pb-16">
        {/* Columna izquierda */}
        <div>
          <div className="inline-flex items-center gap-3 font-mono uppercase" style={{
            padding: '8px 16px 8px 12px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(61,224,255,0.25)', borderRadius: 100, fontSize: 10.5, letterSpacing: '0.18em',
            color: T.text, fontWeight: 600, boxShadow: '0 4px 24px rgba(61,224,255,0.15)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: T.cyan, boxShadow: `0 0 12px ${T.cyan}`, animation: 'glass-pulse 2s ease-in-out infinite' }} />
            <span style={{ color: T.cyan }}>OBSERVING</span>
            <span style={{ color: T.faint }}>·</span>
            <span style={{ color: T.body }}>actualización continua</span>
          </div>

          <h1 className="font-serif-display" style={{ margin: '32px 0 0', fontSize: 'clamp(56px, 9vw, 112px)', lineHeight: 0.94, letterSpacing: '-0.04em', fontWeight: 500, color: T.text }}>
            La gran ilusión<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400,
              background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 50%, ${T.violet} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: `drop-shadow(0 0 40px ${T.cyan}55)` }}>artificial del estado</span>
          </h1>

          <p className="font-serif-display" style={{ margin: '32px 0 0', fontSize: 'clamp(17px,2.2vw,20px)', lineHeight: 1.45, color: T.body, maxWidth: 560 }}>
            Inteligencia continua sobre el despliegue de IA en el aparato estatal mexicano —
            <span style={{ color: T.text }}> sintetizada, verificada y siempre encendida.</span>
          </p>

          <div className="mt-10 flex flex-wrap gap-3.5 items-center">
            <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="font-sans-tech inline-flex items-center gap-3 cursor-pointer" style={{
                fontSize: 14, letterSpacing: '0.04em', fontWeight: 600, color: T.void, padding: '16px 28px', borderRadius: 100,
                border: 'none', background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 100%)`, boxShadow: `0 12px 48px ${T.cyan}40, inset 0 1px 0 rgba(255,255,255,0.4)` }}>
              Entrar al observatorio
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <a href="#metodologia" className="font-sans-tech" style={{
              fontSize: 14, letterSpacing: '0.04em', fontWeight: 500, color: T.text, padding: '15px 26px', borderRadius: 100,
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              Ver metodología
            </a>
            <Link href="/grafo" className="font-sans-tech inline-flex items-center gap-2" style={{
              fontSize: 14, letterSpacing: '0.04em', fontWeight: 500, color: T.cyan, padding: '15px 26px', borderRadius: 100,
              background: 'rgba(61,224,255,0.06)', backdropFilter: 'blur(20px)', border: `1px solid ${T.cyan}44` }}>
              Explorar el mapa
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <MetricPill n={nAnuncios} l="Anuncios" c={T.cyan} href="/" />
            <MetricPill n={nProductos} l="Productos" c={T.blue} href="/" />
            <MetricPill n={nIniciativas} l="Iniciativas" c={T.green} href="/legislacion" />
            <MetricPill n={nCasos} l="Casos" c={T.violet} href="/casos-ia" />
          </div>
        </div>

        {/* Columna derecha: despejada — el mapa vivo ES el visual del hero.
            Clic en cualquier nodo lleva a /grafo (modo ambiente). */}
        <div className="hidden lg:block" aria-hidden="true" />
      </div>

      {/* Modal de suscripción (preservado) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => formStatus !== 'loading' && setShowModal(false)} />
          <div
            ref={dialogRef}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-title"
          >
            <button aria-label="Cerrar suscripción" onClick={() => formStatus !== 'loading' && setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" disabled={formStatus === 'loading'}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {formStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 id="subscription-title" className="font-serif-display text-2xl text-gray-900 mb-2">¡Gracias!</h3>
                <p className="text-gray-600 font-sans-tech">{formMessage}</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Eye size={24} className="text-blue-500" /></div>
                  <h3 id="subscription-title" className="font-serif-display text-2xl text-gray-900 mb-2">Únete al Observatorio</h3>
                  <p className="text-gray-600 font-sans-tech text-sm">Recibe actualizaciones sobre IA en México: nuevos anuncios, legislación y casos judiciales.</p>
                </div>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <label htmlFor="subscription-email" className="block text-xs font-sans-tech font-medium text-gray-700 mb-1.5">Correo electrónico *</label>
                    <input id="subscription-email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tu@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required disabled={formStatus === 'loading'} />
                  </div>
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-gray-600">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.consentimientoEmail}
                      onChange={(e) => setFormData({ ...formData, consentimientoEmail: e.target.checked })}
                      required
                      disabled={formStatus === 'loading'}
                    />
                    <span>Acepto recibir por correo actualizaciones del Observatorio y poder darme de baja en cualquier momento.</span>
                  </label>
                  <div className="absolute -left-[10000px]" aria-hidden="true">
                    <label htmlFor="subscription-website">Sitio web</label>
                    <input
                      id="subscription-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                  {formStatus === 'error' && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600 font-sans-tech">{formMessage}</p></div>}
                  <button type="submit" disabled={formStatus === 'loading'} className="w-full py-3 bg-blue-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {formStatus === 'loading' ? 'Registrando…' : 'Suscribirme'}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center">Sólo pedimos tu correo. No solicitamos WhatsApp ni nombre para esta suscripción.</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IrisMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs><linearGradient id="heroIris" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#3DE0FF" /><stop offset="1" stopColor="#4D7BFF" /></linearGradient></defs>
      <path d="M6 50 Q50 24 94 50 Q50 76 6 50 Z" stroke="#48556F" strokeWidth="4" />
      <circle cx="50" cy="50" r="21" stroke="url(#heroIris)" strokeWidth="6" strokeDasharray="11 8" />
      <circle cx="50" cy="50" r="9" fill="url(#heroIris)" />
    </svg>
  );
}

function MetricPill({ n, l, c, href }: { n: number | string; l: string; c: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 transition-transform hover:scale-[1.03]" style={{
      padding: '10px 16px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: c, boxShadow: `0 0 10px ${c}` }} />
      <span className="font-serif-display" style={{ fontSize: 22, fontWeight: 500, color: T.text, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
      <span className="font-mono uppercase" style={{ fontSize: 10.5, color: T.body, letterSpacing: '0.16em', fontWeight: 500 }}>{l}</span>
    </Link>
  );
}
