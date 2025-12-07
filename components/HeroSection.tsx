'use client';

import { useState, useEffect } from 'react';
import { Activity, Eye, FileText, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  stats: {
    total: number;
    operando: number;
    enDesarrollo: number;
    incumplido: number;
    prometido: number;
  };
}

export default function HeroSection({ stats }: HeroSectionProps) {
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
    <div className="relative w-full min-h-screen bg-[#030303] text-[#E5E5E5] overflow-hidden font-sans selection:bg-amber-900/50 selection:text-amber-200">
      {/* Textura de ruido */}
      <div className="noise-bg"></div>
      
      {/* Radar / Grid Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Grid estático de fondo */}
        <div className="absolute inset-0 radar-grid transform perspective-1000 rotate-x-12 scale-110 opacity-60"></div>
        
        {/* "Ojo" del radar giratorio */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border border-white/5 rounded-full opacity-20 animate-[rotate-radar_20s_linear_infinite]">
          <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-t from-amber-500/50 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.5)] origin-bottom"></div>
        </div>

        {/* Gradientes atmosféricos */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Linea de escaneo vertical (Vigilancia) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500/20 shadow-[0_0_20px_rgba(212,175,55,0.2)] animate-[scanline_8s_linear_infinite] z-10 pointer-events-none"></div>

      {/* UI LAYER */}
      <div className="relative z-20 flex flex-col min-h-screen px-6 md:px-12 lg:px-24 pt-8 pb-12 justify-between">
        
        {/* NAV MINIMALISTA */}
        <nav className={`flex justify-between items-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 border border-white/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-amber-500/50 transition-colors">
              <Eye size={16} className="text-white/80 group-hover:text-amber-500 transition-colors" />
              <div className="absolute inset-0 bg-white/5 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans-tech text-xs tracking-[0.2em] text-white/60 uppercase">Observatorio</span>
              <span className="font-serif-display text-lg leading-none text-white font-bold">IA México</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-sans-tech text-sm tracking-wide text-white/70">
            <a href="#tracker" className="hover:text-amber-400 transition-colors">Tracker</a>
            <a href="#metodologia" className="hover:text-amber-400 transition-colors">Metodología</a>
            <a href="/actividad" className="hover:text-amber-400 transition-colors">Actividad</a>
          </div>

          <button className="hidden md:flex items-center gap-2 px-5 py-2 border border-white/20 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 group">
            Suscribirse
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:bg-black transition-colors"></div>
          </button>
        </nav>

        {/* MAIN CONTENT */}
        <div className="flex flex-col justify-center flex-grow mt-12 md:mt-0">
          
          {/* Status Badge */}
          <div className={`w-fit mb-8 animate-reveal`}>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-[pulse-gold_2s_infinite] absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </div>
              <span className="font-sans-tech text-xs uppercase tracking-widest text-amber-100/80">
                Monitoreo Activo · Actualizado Hoy
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="relative max-w-4xl">
            <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-8">
              <div className="overflow-hidden">
                <span className="block animate-reveal delay-100 text-white/90">La gran ilusión</span>
              </div>
              <div className="overflow-hidden">
                <span className="block animate-reveal delay-200 italic text-amber-500 gold-glow-text">
                  artificial del estado
                </span>
              </div>
            </h1>

            {/* Subheadline */}
            <p className="font-sans-tech text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed animate-reveal delay-300 border-l border-amber-500/30 pl-6 ml-1">
              Documentamos la brecha sistémica entre la narrativa gubernamental de innovación y la realidad operativa. <span className="text-white/90">{stats.total} anuncios en 2025. {stats.operando} implementaciones verificadas.</span>
            </p>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 border-t border-white/10 pt-8 max-w-3xl animate-reveal delay-400">
            <div className="group cursor-default">
              <div className="font-serif-display text-4xl md:text-5xl text-white group-hover:text-amber-400 transition-colors duration-300">{stats.total}</div>
              <div className="font-sans-tech text-xs text-white/40 uppercase tracking-widest mt-1 group-hover:translate-x-1 transition-transform">Anuncios Oficiales</div>
            </div>
            <div className="group cursor-default">
              <div className="font-serif-display text-4xl md:text-5xl text-amber-500 group-hover:text-white transition-colors duration-300">{stats.operando}</div>
              <div className="font-sans-tech text-xs text-white/40 uppercase tracking-widest mt-1 group-hover:translate-x-1 transition-transform">Productos Operativos</div>
            </div>
            <div className="group cursor-default col-span-2 md:col-span-1">
              <div className="font-serif-display text-4xl md:text-5xl text-white/80 group-hover:text-amber-400 transition-colors duration-300">180m</div>
              <div className="font-sans-tech text-xs text-white/40 uppercase tracking-widest mt-1 group-hover:translate-x-1 transition-transform">Pesos sin auditar</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 mt-12 animate-reveal delay-500">
            <button 
              onClick={scrollToContent}
              className="group relative px-8 py-4 bg-amber-600/90 text-white font-sans-tech text-sm uppercase tracking-widest overflow-hidden hover:bg-amber-500 transition-colors duration-300"
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                Ver Dashboard
                <Activity size={16} className="group-hover:animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
            
            <a 
              href="#metodologia"
              className="group px-8 py-4 border border-white/20 text-white font-sans-tech text-sm uppercase tracking-widest hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FileText size={16} className="text-white/50 group-hover:text-white transition-colors" />
              Metodología
            </a>
          </div>
        </div>

        {/* FOOTER HERO */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mt-12 pt-6 border-t border-white/5 text-xs font-sans-tech text-white/30 animate-reveal delay-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse"></div>
            <span>Sistema operativo · Nivel de amenaza: BAJO</span>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col md:items-end">
            <span>Última actualización: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-amber-500/40">Powered by Citizen Agents</span>
          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div 
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-[float_3s_ease-in-out_infinite] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-sans-tech">Scroll</span>
          <ChevronDown className="text-amber-500" size={20} />
        </div>
      </div>
    </div>
  );
}
