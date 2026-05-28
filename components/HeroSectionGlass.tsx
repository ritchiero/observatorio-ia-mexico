'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import Link from 'next/link';

// Tema dark (Holographic Glass)
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

type UltimoEvento = { titulo: string; dependencia: string; fecha: string } | null;

export default function HeroSectionGlass({ stats, legStats, casosStats, loading, loadingLeg, loadingCasos }: HeroGlassProps) {
  const [mounted, setMounted] = useState(false);
  const [ultimo, setUltimo] = useState<UltimoEvento>(null);

  // Modal de suscripción (preservado del hero original)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    // Último evento REAL: el anuncio más reciente
    fetch('/api/anuncios')
      .then((r) => r.json())
      .then((d) => {
        const a = (d.anuncios || [])[0];
        if (a) setUltimo({ titulo: a.titulo, dependencia: a.dependencia || '', fecha: a.fechaAnuncio || '' });
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setFormMessage('');
    try {
      const response = await fetch('/api/suscripciones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al suscribirse');
      setFormStatus('success');
      setFormMessage(data.message);
      setFormData({ nombre: '', email: '', telefono: '' });
      setTimeout(() => { setShowModal(false); setFormStatus('idle'); setFormMessage(''); }, 3000);
    } catch (error) {
      setFormStatus('error');
      setFormMessage(error instanceof Error ? error.message : 'Error al suscribirse');
    }
  };

  const nAnuncios = loading ? '—' : stats.total;
  const nProductos = loading ? '—' : stats.operando;
  const nIniciativas = loadingLeg !== false && !legStats?.total ? '—' : legStats?.total ?? '—';
  const nCasos = loadingCasos !== false && !casosStats?.total ? '—' : casosStats?.total ?? '—';
  const totalRastreado = (stats.total || 0) + (legStats?.total || 0) + (casosStats?.total || 0);

  const fechaCorta = (iso: string) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

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
      <ParticleField />

      {/* Header glass (propio del hero — el global se oculta en home) */}
      <header className={`relative z-30 flex items-center justify-between gap-4 mx-4 md:mx-8 mt-5 px-5 md:px-8 py-4 rounded-[100px] transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
        style={{ background: 'rgba(11,15,28,0.55)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <IrisMark />
          <div className="flex flex-col leading-none">
            <span className="font-mono uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: '0.28em', color: T.cyan }}>Observatorio · v.2026</span>
            <span className="font-sans-tech uppercase" style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: '0.04em' }}>IA México</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {[['Tracker', '/'], ['Legislación', '/legislacion'], ['Casos', '/casos-ia'], ['Recap', '/recap'], ['Actividad', '/actividad']].map(([t, h]) => (
            <Link key={t} href={h} className="font-sans-tech transition-opacity hover:opacity-100" style={{ fontSize: 13, color: T.body, opacity: 0.85, fontWeight: 500 }}>{t}</Link>
          ))}
        </nav>
        <button onClick={() => setShowModal(true)} className="shrink-0 font-sans-tech uppercase flex items-center gap-2.5 cursor-pointer"
          style={{ fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: T.void, padding: '10px 18px', borderRadius: 100, border: 'none', background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 100%)`, boxShadow: `0 8px 32px ${T.cyan}40, inset 0 1px 0 rgba(255,255,255,0.4)` }}>
          Suscribirse
          <span style={{ width: 6, height: 6, borderRadius: 999, background: T.void }} />
        </button>
      </header>

      {/* Contenido */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-8 px-6 md:px-12 lg:px-16 pt-12 lg:pt-14 pb-16">
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
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <MetricPill n={nAnuncios} l="Anuncios" c={T.cyan} href="/" />
            <MetricPill n={nProductos} l="Productos" c={T.blue} href="/" />
            <MetricPill n={nIniciativas} l="Iniciativas" c={T.green} href="/legislacion" />
            <MetricPill n={nCasos} l="Casos" c={T.violet} href="/casos-ia" />
          </div>
        </div>

        {/* Columna derecha — glass cards (stack en mobile, flotantes en desktop) */}
        <div className="relative flex flex-col gap-5 lg:block lg:min-h-[580px]">
          <GlassCard className="lg:absolute lg:top-0 lg:right-0 lg:w-[380px]" style={{ padding: 22 }}>
            <div className="flex items-center justify-between mb-3.5">
              <div className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.22em', color: T.cyan, fontWeight: 700 }}>Stream activo</div>
              <div className="flex items-center gap-1.5 font-mono" style={{ fontSize: 10, color: T.green, letterSpacing: '0.1em' }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: T.green, boxShadow: `0 0 8px ${T.green}`, animation: 'glass-pulse 2s ease-in-out infinite' }} />
                LIVE
              </div>
            </div>
            <div className="font-serif-display" style={{ fontSize: 60, fontWeight: 500, color: T.text, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
              {totalRastreado || '—'}
            </div>
            <div className="font-mono uppercase" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: T.mute, marginTop: 6 }}>Registros rastreados · 2026</div>
            <div style={{ marginTop: 16, height: 80, position: 'relative' }}><BigSpark /></div>
            <div className="flex justify-between font-mono" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 10.5, color: T.body, letterSpacing: '0.1em' }}>
              <span>Anuncios · <span style={{ color: T.green }}>{loading ? '—' : stats.total}</span></span>
              <span>Casos · {nCasos}</span>
            </div>
          </GlassCard>

          <GlassCard className="lg:absolute lg:top-[280px] lg:right-[60px] lg:w-[340px]" style={{ padding: 18 }}>
            <div className="font-mono uppercase" style={{ fontSize: 9.5, letterSpacing: '0.22em', color: T.violet, fontWeight: 700 }}>◇ Último anuncio oficial</div>
            <div className="font-serif-display" style={{ fontSize: 19, lineHeight: 1.35, color: T.text, marginTop: 8 }}>
              {ultimo ? ultimo.titulo : 'Cargando el evento más reciente…'}
            </div>
            <div className="flex items-center gap-2.5 font-mono" style={{ marginTop: 12, fontSize: 10.5, color: T.mute, letterSpacing: '0.08em' }}>
              <span>{ultimo ? (ultimo.dependencia || '').slice(0, 28) : ''}</span>
              {ultimo?.fecha && <span style={{ marginLeft: 'auto', color: T.cyan }}>{fechaCorta(ultimo.fecha)}</span>}
            </div>
          </GlassCard>

          <GlassCard className="lg:absolute lg:top-[480px] lg:right-[240px] lg:w-[200px]" style={{ padding: 14 }}>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center font-mono" style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${T.green}, ${T.cyan})`, fontSize: 11, color: T.void, fontWeight: 800, boxShadow: `0 4px 16px ${T.green}55` }}>OK</div>
              <div>
                <div className="font-sans-tech" style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{loading ? '—' : stats.operando} operando</div>
                <div className="font-mono uppercase" style={{ fontSize: 9.5, color: T.mute, letterSpacing: '0.12em' }}>{loading ? '' : `${stats.incumplido} incumplido`}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modal de suscripción (preservado) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => formStatus !== 'loading' && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <button onClick={() => formStatus !== 'loading' && setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" disabled={formStatus === 'loading'}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {formStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-serif-display text-2xl text-gray-900 mb-2">¡Gracias!</h3>
                <p className="text-gray-600 font-sans-tech">{formMessage}</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Eye size={24} className="text-blue-500" /></div>
                  <h3 className="font-serif-display text-2xl text-gray-900 mb-2">Únete al Observatorio</h3>
                  <p className="text-gray-600 font-sans-tech text-sm">Recibe actualizaciones sobre IA en México: nuevos anuncios, legislación y casos judiciales.</p>
                </div>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans-tech font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Tu nombre completo" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required disabled={formStatus === 'loading'} />
                  </div>
                  <div>
                    <label className="block text-xs font-sans-tech font-medium text-gray-700 mb-1.5">Correo electrónico *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="tu@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required disabled={formStatus === 'loading'} />
                  </div>
                  <div>
                    <label className="block text-xs font-sans-tech font-medium text-gray-700 mb-1.5">WhatsApp *</label>
                    <input type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} placeholder="55 1234 5678" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required disabled={formStatus === 'loading'} />
                    <p className="text-[10px] text-gray-400 mt-1">Para enviarte alertas importantes</p>
                  </div>
                  {formStatus === 'error' && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600 font-sans-tech">{formMessage}</p></div>}
                  <button type="submit" disabled={formStatus === 'loading'} className="w-full py-3 bg-blue-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {formStatus === 'loading' ? 'Registrando…' : 'Suscribirme'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">Al suscribirte aceptas recibir comunicaciones del Observatorio IA México.</p>
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

function GlassCard({ children, style = {}, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: 'rgba(20,28,48,0.45)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20,
      boxShadow: '0 16px 48px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)', ...style,
    }}>{children}</div>
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

function BigSpark() {
  const vals = [12, 18, 14, 22, 20, 28, 34, 30, 42, 38, 52, 60, 55, 70, 82, 78, 96, 110, 105, 130, 145, 152];
  const w = 332, h = 80, max = Math.max(...vals), min = Math.min(...vals);
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - min) / (max - min)) * (h - 8) - 4]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
      <defs><linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.cyan} stopOpacity="0.4" /><stop offset="100%" stopColor={T.cyan} stopOpacity="0" /></linearGradient></defs>
      <polygon points={area} fill="url(#sparkfill)" />
      <polyline points={line} fill="none" stroke={T.cyan} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${T.cyan})` }} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill={T.cyan} style={{ filter: `drop-shadow(0 0 8px ${T.cyan})` }} />
    </svg>
  );
}

function ParticleField() {
  const particles = Array.from({ length: 36 }).map((_, i) => ({
    left: (i * 7919) % 100, delay: (i * 0.3) % 8, duration: 8 + ((i * 13) % 6),
    size: 1 + (i % 3) * 0.6, color: [T.cyan, T.blue, T.violet][i % 3],
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${p.left}%`, top: 0, width: p.size, height: p.size, borderRadius: 999,
          background: p.color, boxShadow: `0 0 ${p.size * 6}px ${p.color}`,
          animation: `glass-stream ${p.duration}s linear infinite`, animationDelay: `${p.delay}s`, opacity: 0.6,
        }} />
      ))}
    </div>
  );
}
