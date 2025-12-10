'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        setLoading(false);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Textura de ruido */}
      <div className="noise-bg"></div>
      
      {/* Radar / Grid Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 radar-grid transform perspective-1000 rotate-x-12 scale-110 opacity-60"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border border-gray-300/5 rounded-full opacity-20 animate-[rotate-radar_20s_linear_infinite]">
          <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-t from-blue-500/70 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] origin-bottom"></div>
        </div>

        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px]"></div>
      </div>

      {/* Linea de escaneo */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-[scanline_8s_linear_infinite] z-10 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen px-6 md:px-12 lg:px-24 pt-8 pb-12">
        
        {/* Nav */}
        <nav className={`flex justify-between items-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 border border-gray-300/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-blue-500/50 transition-colors">
              <Eye size={16} className="text-gray-900/80 group-hover:text-blue-500 transition-colors" />
              <div className="absolute inset-0 bg-gray-100 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans-tech text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
              <span className="font-serif-display text-lg leading-none text-gray-900 font-bold">IA México</span>
            </div>
          </Link>

          <Link 
            href="/"
            className="hidden md:flex items-center gap-2 px-5 py-2 border border-gray-300/20 text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 font-sans-tech text-gray-900/70"
          >
            Volver al sitio
          </Link>
        </nav>

        {/* Login Form */}
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            
            {/* Badge */}
            <div className={`w-fit mx-auto mb-8 ${mounted ? 'animate-reveal' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-100 border border-gray-300/10 rounded-full backdrop-blur-sm">
                <Lock size={12} className="text-blue-500" />
                <span className="font-sans-tech text-xs uppercase tracking-widest text-gray-600/80">
                  Acceso Restringido
                </span>
              </div>
            </div>

            {/* Title */}
            <div className={`text-center mb-10 ${mounted ? 'animate-reveal delay-100' : 'opacity-0'}`}>
              <h1 className="font-serif-display text-4xl md:text-5xl font-light text-gray-900 mb-3">
                Panel de <span className="italic text-blue-500">Control</span>
              </h1>
              <p className="font-sans-tech text-sm text-gray-900/50">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Form Card */}
            <div className={`bg-gray-50 border border-gray-300/10 rounded-xl p-8 backdrop-blur-sm ${mounted ? 'animate-reveal delay-200' : 'opacity-0'}`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block font-sans-tech text-xs uppercase tracking-widest text-gray-900/50 mb-2">
                    Usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300/20 rounded-lg font-sans-tech text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block font-sans-tech text-xs uppercase tracking-widest text-gray-900/50 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300/20 rounded-lg font-sans-tech text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200/50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-sans-tech text-sm text-red-600">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full px-8 py-4 bg-blue-600 text-white font-sans-tech text-sm uppercase tracking-widest overflow-hidden hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verificando...
                      </>
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>
              </form>
            </div>

            {/* Footer note */}
            <div className={`mt-6 text-center ${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
              <p className="font-mono text-xs text-gray-900/30">
                Autenticación segura · NextAuth.js
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-between items-center text-xs font-sans-tech text-gray-900/30 border-t border-gray-300/5 pt-6 ${mounted ? 'animate-reveal delay-400' : 'opacity-0'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema operativo</span>
          </div>
          <span className="text-blue-500/40">Observatorio IA México</span>
        </div>
      </div>
    </div>
  );
}
