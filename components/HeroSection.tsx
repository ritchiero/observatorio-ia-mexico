'use client';

import { useState, useEffect } from 'react';
import { Activity, Eye, FileText, ChevronDown, Scale } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  stats: {
    total: number;
    operando: number;
    enDesarrollo: number;
    incumplido: number;
    prometido: number;
  };
  legStats?: {
    total: number;
    activas: number;
  };
  loading?: boolean;
  loadingLeg?: boolean;
}

export default function HeroSection({ stats, legStats, loading, loadingLeg }: HeroSectionProps) {
  const isLoading = loading || stats.total === 0;
  const isLoadingLeg = loadingLeg !== false && (!legStats || legStats.total === 0);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full min-h-screen bg-white text-gray-900 overflow-hidden font-sans selection:bg-blue-50/500 selection:text-blue-700">
      {/* Textura de ruido */}
      <div className="noise-bg"></div>
      
      {/* Radar / Grid Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Grid estático de fondo */}
        <div className="absolute inset-0 radar-grid transform perspective-1000 rotate-x-12 scale-110 opacity-60"></div>
        
        {/* "Ojo" del radar giratorio */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border border-gray-300/5 rounded-full opacity-20 animate-[rotate-radar_20s_linear_infinite]">
          <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-t from-blue-500/70 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] origin-bottom"></div>
        </div>

        {/* Gradientes atmosféricos */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px]"></div>
      </div>

      {/* Linea de escaneo vertical (Vigilancia) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-[scanline_8s_linear_infinite] z-10 pointer-events-none"></div>

      {/* UI LAYER */}
      <div className="relative z-20 flex flex-col min-h-screen px-6 md:px-12 lg:px-24 pt-8 pb-12 justify-between">
        
        {/* NAV MINIMALISTA */}
        <nav className={`flex justify-between items-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 border border-gray-300/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-blue-500/50 transition-colors">
              <Eye size={16} className="text-gray-900/80 group-hover:text-blue-500 transition-colors" />
              <div className="absolute inset-0 bg-gray-100 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans-tech text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
              <span className="font-serif-display text-lg leading-none text-gray-900 font-bold">IA México</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-sans-tech text-sm tracking-wide text-gray-900/70">
            <a href="#tracker" className="hover:text-blue-400 transition-colors">Tracker</a>
            <a href="/legislacion" className="hover:text-blue-400 transition-colors">Legislación</a>
            <a href="#metodologia" className="hover:text-blue-400 transition-colors">Metodología</a>
            <a href="/actividad" className="hover:text-blue-400 transition-colors">Actividad</a>
          </div>

          <button className="hidden md:flex items-center gap-2 px-5 py-2 border border-gray-300/20 text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 group">
            Suscribirse
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:bg-gray-50 transition-colors"></div>
          </button>
        </nav>

        {/* MAIN CONTENT */}
        <div className="flex flex-col justify-center flex-grow mt-12 md:mt-0">
          
          {/* Status Badge */}
          <div className={`w-fit mb-8 animate-reveal`}>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-100 border border-gray-300/10 rounded-full backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-[pulse-blue_2s_infinite] absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </div>
              <span className="font-sans-tech text-xs uppercase tracking-widest text-gray-600/80">
                Monitoreo Activo · Actualizado Hoy
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="relative max-w-4xl">
            <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-8">
              <div className="overflow-hidden">
                <span className="block animate-reveal delay-100 text-gray-900/90">La gran ilusión</span>
              </div>
              <div className="overflow-hidden">
                <span className="block animate-reveal delay-200 italic text-blue-500 blue-glow-text">
                  artificial del estado
                </span>
              </div>
            </h1>

            {/* Subheadline */}
            <p className="font-sans-tech text-lg md:text-xl text-gray-900/60 max-w-2xl leading-relaxed animate-reveal delay-300 border-l border-blue-500/30 pl-6 ml-1">
              Documentamos la brecha sistémica entre la narrativa gubernamental de innovación y la realidad operativa. <span className="text-gray-900/90">{isLoading ? 'Cargando datos...' : `${stats.total} anuncios en 2025. ${stats.operando} implementaciones verificadas.`}</span>
            </p>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 mt-16 border-t border-gray-300/10 pt-8 max-w-3xl animate-reveal delay-400">
            <div className="group cursor-default">
              <div className={`font-serif-display text-3xl md:text-5xl text-gray-900 group-hover:text-blue-400 transition-colors duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '—' : stats.total}
              </div>
              <div className="font-sans-tech text-[10px] md:text-xs text-gray-900/40 uppercase tracking-widest mt-1 group-hover:translate-x-1 transition-transform">Anuncios Oficiales</div>
            </div>
            <div className="group cursor-default">
              <div className={`font-serif-display text-3xl md:text-5xl text-blue-500 group-hover:text-gray-900 transition-colors duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '—' : stats.operando}
              </div>
              <div className="font-sans-tech text-[10px] md:text-xs text-gray-900/40 uppercase tracking-widest mt-1 group-hover:translate-x-1 transition-transform">Productos Operativos</div>
            </div>
            <Link href="/legislacion" className="group cursor-pointer">
              <div className={`font-serif-display text-3xl md:text-5xl text-emerald-600 group-hover:text-gray-900 transition-colors duration-300 ${isLoadingLeg ? 'animate-pulse' : ''}`}>
                {isLoadingLeg ? '—' : legStats?.total}
              </div>
              <div className="font-sans-tech text-[10px] md:text-xs text-gray-900/40 uppercase tracking-widest mt-1 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <Scale size={10} className="hidden md:inline" />
                Iniciativas de Ley
              </div>
            </Link>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 mt-12 animate-reveal delay-500">
            <button 
              onClick={scrollToContent}
              className="group relative px-8 py-4 bg-blue-600 text-white font-sans-tech text-sm uppercase tracking-widest overflow-hidden hover:bg-blue-700 transition-colors duration-300"
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                Ver Dashboard
                <Activity size={16} className="group-hover:animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
            
            <a 
              href="#metodologia"
              className="group px-8 py-4 border border-gray-300/20 text-gray-900 font-sans-tech text-sm uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FileText size={16} className="text-gray-900/50 group-hover:text-gray-900 transition-colors" />
              Metodología
            </a>
          </div>
        </div>

        {/* FOOTER HERO */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mt-12 pt-6 border-t border-gray-300/5 text-xs font-sans-tech text-gray-900/30 animate-reveal delay-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse"></div>
            <span>Sistema operativo · Nivel de amenaza: BAJO</span>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col md:items-end">
            <span>Última actualización: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-blue-500/40">Powered by Citizen Agents</span>
          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div 
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-[float_3s_ease-in-out_infinite] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-900/40 font-sans-tech">Scroll</span>
          <ChevronDown className="text-blue-500" size={20} />
        </div>
      </div>
    </div>
  );
}
