'use client';

// MapaVivo3D v2 — el campo de estrellas del Observatorio, a la manera del
// codemap: ~1,500 puntos FINOS (1–2.5px) donde cada punto es un objeto
// público real (registro, fuente citada o evento de bitácora). Los satélites
// (fuentes) orbitan pegados a su ficha madre — eso produce los enjambres
// orgánicos de la referencia — y la bitácora forma un disco de polvo tenue.
// Canvas 2D con proyección en perspectiva; sin dependencias; posiciones
// deterministas por hash (sin Math.random). Respeta prefers-reduced-motion.

import { useEffect, useMemo, useRef } from 'react';
import type { PuntoVivo } from '@/lib/mapa-vivo-datos';

interface Props {
  puntos: PuntoVivo[];
  enlaces: [number, number][];
  locale?: 'es' | 'en';
}

const L = {
  es: {
    clusters: {
      ejecutivo: 'Ejecutivo', legislativo: 'Legislativo', judicial: 'Judicial',
      academia: 'Academia', privado: 'Sector privado', temas: 'Temas puente',
      personas: 'Personas clave', bitacora: 'Bitácora del monitoreo',
    } as Record<string, string>,
    unidad: 'registros',
    abrir: 'clic para abrir la ficha',
  },
  en: {
    clusters: {
      ejecutivo: 'Executive', legislativo: 'Legislative', judicial: 'Judicial',
      academia: 'Academia', privado: 'Private sector', temas: 'Bridge topics',
      personas: 'Key people', bitacora: 'Monitoring log',
    } as Record<string, string>,
    unidad: 'records',
    abrir: 'click to open the record',
  },
} as const;

const COLOR: Record<string, string> = {
  ejecutivo: '#3DE0FF', legislativo: '#34E59C', judicial: '#A47CFF',
  academia: '#FFC24D', privado: '#4D7BFF', temas: '#8E9BD9',
  personas: '#5E6F92', bitacora: '#3A4763',
};

// +Y proyecta hacia ABAJO en canvas; los centroides ya lo asumen.
const CENTRO: Record<string, [number, number, number]> = {
  legislativo: [-0.52, 0.02, 0.1],
  ejecutivo: [0.52, -0.14, 0.16],
  judicial: [0.42, 0.44, -0.14],
  academia: [-0.34, 0.46, 0.26],
  privado: [-0.04, 0.28, -0.52],
  temas: [0.06, -0.5, -0.04],
  personas: [0, 0, 0],
  bitacora: [0, 0, 0],
};
const SIGMA: Record<string, number> = {
  legislativo: 0.3, ejecutivo: 0.26, judicial: 0.15, academia: 0.15, privado: 0.13, temas: 0.2, personas: 0.05, bitacora: 0.06,
};

function h01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
function g(s: string, salt: number): number {
  return (h01(s, salt) + h01(s, salt + 7) + h01(s, salt + 13)) / 1.5 - 1;
}

export default function MapaVivo3D({ puntos, enlaces, locale = 'es' }: Props) {
  const t = L[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const pos = useMemo(() => {
    const arr = new Float32Array(puntos.length * 3);
    puntos.forEach((n, i) => {
      if (n.p != null) {
        // satélite: orbita pegado a su ficha madre (enjambre orgánico)
        const r = 0.028 + h01(n.id, 31) * 0.05;
        const a1 = h01(n.id, 37) * Math.PI * 2, a2 = h01(n.id, 41) * Math.PI;
        arr[i * 3] = arr[n.p * 3] + Math.cos(a1) * Math.sin(a2) * r;
        arr[i * 3 + 1] = arr[n.p * 3 + 1] + Math.cos(a2) * r;
        arr[i * 3 + 2] = arr[n.p * 3 + 2] + Math.sin(a1) * Math.sin(a2) * r;
      } else if (n.k === 'personas') {
        const a = h01(n.id, 3) * Math.PI * 2;
        const r = 0.86 + g(n.id, 17) * 0.05;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = g(n.id, 23) * 0.4;
        arr[i * 3 + 2] = Math.sin(a) * r;
      } else if (n.k === 'bitacora') {
        // disco de polvo ecuatorial, amplio y plano
        const a = h01(n.id, 5) * Math.PI * 2;
        const r = 0.42 + h01(n.id, 11) * 0.62;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = 0.12 + g(n.id, 29) * 0.09;
        arr[i * 3 + 2] = Math.sin(a) * r;
      } else {
        const [cx, cy, cz] = CENTRO[n.k] ?? CENTRO.temas;
        const s = SIGMA[n.k] ?? 0.2;
        arr[i * 3] = cx + g(n.id, 1) * s;
        arr[i * 3 + 1] = cy + g(n.id, 2) * s;
        arr[i * 3 + 2] = cz + g(n.id, 3) * s;
      }
    });
    return arr;
  }, [puntos]);

  const clusters = useMemo(() => {
    const m = new Map<string, { n: number; cx: number; cy: number; cz: number }>();
    puntos.forEach((p, i) => {
      if (p.k === 'bitacora' || p.k === 'personas') return; // sin rótulo central
      const e = m.get(p.k) ?? { n: 0, cx: 0, cy: 0, cz: 0 };
      e.n++; e.cx += pos[i * 3]; e.cy += pos[i * 3 + 1]; e.cz += pos[i * 3 + 2];
      m.set(p.k, e);
    });
    return [...m.entries()].map(([k, e]) => ({ key: k, n: e.n, x: e.cx / e.n, y: e.cy / e.n, z: e.cz / e.n }));
  }, [puntos, pos]);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rotY = 0.5, rotX = -0.16, zoom = 1, auto = !reduce;
    let dragging = false, px = 0, py = 0, moved = 0, pinchD = 0;
    let mx = -1, my = -1, hover = -1;
    const proj = new Float32Array(puntos.length * 3);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const F = 2.7;
    const draw = () => {
      if (auto && !dragging) rotY += 0.00075;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cy0 = Math.cos(rotY), sy0 = Math.sin(rotY), cx0 = Math.cos(rotX), sx0 = Math.sin(rotX);
      const R = Math.min(W, H) * 0.55 * zoom;
      const cxm = W * 0.57, cym = H * 0.5;

      for (let i = 0; i < puntos.length; i++) {
        const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        const x1 = x * cy0 + z * sy0, z1 = -x * sy0 + z * cy0;
        const y1 = y * cx0 - z1 * sx0, z2 = y * sx0 + z1 * cx0;
        const s = F / (F + z2);
        proj[i * 3] = cxm + x1 * R * s;
        proj[i * 3 + 1] = cym + y1 * R * s;
        proj[i * 3 + 2] = s;
      }

      // relaciones: hilos muy tenues entre registros
      ctx.lineWidth = 0.6;
      for (let k = 0; k < enlaces.length; k++) {
        const [a, b] = enlaces[k];
        const alpha = Math.max(0, (proj[a * 3 + 2] + proj[b * 3 + 2]) / 2 - 0.66) * 0.22;
        if (alpha <= 0.008) continue;
        ctx.strokeStyle = `rgba(130,160,215,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(proj[a * 3], proj[a * 3 + 1]);
        ctx.lineTo(proj[b * 3], proj[b * 3 + 1]);
        ctx.stroke();
      }

      // puntos: núcleos finos, estilo campo de estrellas
      let best = -1, bestD = 13 * 13;
      for (let i = 0; i < puntos.length; i++) {
        const X = proj[i * 3], Y = proj[i * 3 + 1], s = proj[i * 3 + 2];
        if (X < -8 || X > W + 8 || Y < -8 || Y > H + 8) continue;
        const p = puntos[i];
        const col = COLOR[p.k] ?? '#8E9BD9';
        const depth = Math.max(0, Math.min(1, (s - 0.52) * 2.1));
        let r: number, alpha: number;
        if (p.c === 'evento') { r = 0.7 * s; alpha = 0.32 * depth; }
        else if (p.c === 'fuente') { r = 0.9 * s; alpha = 0.5 * depth; }
        else if (p.c === 'puente') { r = (1 + Math.min(p.v ?? 1, 3) * 0.35) * s; alpha = (p.k === 'personas' ? 0.5 : 0.75) * depth; }
        else { r = (1.3 + Math.min(p.v ?? 1, 3) * 0.45) * s; alpha = 0.95 * depth; }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(X, Y, Math.max(0.5, r), 0, 6.2832);
        ctx.fill();
        // halo sutil solo para registros (y anillo para recientes)
        if (p.c === 'registro') {
          ctx.globalAlpha = alpha * 0.16;
          ctx.beginPath();
          ctx.arc(X, Y, r * 3.2, 0, 6.2832);
          ctx.fill();
          if (p.n) {
            ctx.globalAlpha = alpha * 0.8;
            ctx.strokeStyle = col;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(X, Y, r * 2.4, 0, 6.2832);
            ctx.stroke();
            ctx.lineWidth = 0.6;
          }
        }
        if (mx >= 0 && p.l) {
          const dx = X - mx, dy = Y - my, d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = i; }
        }
      }
      ctx.globalAlpha = 1;
      hover = best;

      // rótulos de clúster con anticolisión
      ctx.textAlign = 'left';
      const puestas: [number, number][] = [];
      for (const c of clusters) {
        const x1 = c.x * cy0 + c.z * sy0, z1 = -c.x * sy0 + c.z * cy0;
        const y1 = c.y * cx0 - z1 * sx0, z2 = c.y * sx0 + z1 * cx0;
        const s = F / (F + z2);
        if (s < 0.82) continue;
        const X = cxm + x1 * R * s, Y = cym + y1 * R * s;
        if (puestas.some(([qx, qy]) => Math.abs(qx - X) < 140 && Math.abs(qy - Y) < 36)) continue;
        puestas.push([X, Y]);
        ctx.font = `600 ${Math.round(12.5 * s)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(231,236,247,0.95)';
        ctx.fillText(t.clusters[c.key] ?? c.key, X + 10, Y - 4);
        ctx.font = `${Math.round(10.5 * s)}px ui-monospace, monospace`;
        ctx.fillStyle = 'rgba(143,163,200,0.8)';
        ctx.fillText(`${c.n} ${t.unidad}`, X + 10, Y + 11);
      }

      // tooltip
      if (hover >= 0) {
        const p = puntos[hover];
        const X = proj[hover * 3], Y = proj[hover * 3 + 1];
        const label = (p.l ?? '').length > 64 ? (p.l as string).slice(0, 63) + '…' : p.l ?? '';
        ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
        const w = ctx.measureText(label).width + 18;
        const bx = Math.min(Math.max(8, X + 12), W - w - 8), by = Math.max(30, Y - 14);
        ctx.fillStyle = 'rgba(7,10,20,0.93)';
        ctx.strokeStyle = 'rgba(61,224,255,0.35)';
        ctx.beginPath();
        ctx.roundRect(bx, by - 16, w, p.h ? 36 : 24, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E7ECF7';
        ctx.fillText(label, bx + 9, by);
        if (p.h) {
          ctx.font = '10px ui-monospace, monospace';
          ctx.fillStyle = 'rgba(61,224,255,0.9)';
          ctx.fillText(t.abrir, bx + 9, by + 14);
        }
        canvas.style.cursor = p.h ? 'pointer' : 'default';
      } else {
        canvas.style.cursor = dragging ? 'grabbing' : 'grab';
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const pointers = new Map<number, [number, number]>();
    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.size === 1) { dragging = true; moved = 0; px = e.clientX; py = e.clientY; }
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left; my = e.clientY - rect.top;
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const d = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
        if (pinchD > 0) zoom = Math.min(2.6, Math.max(0.55, zoom * (d / pinchD)));
        pinchD = d;
      } else if (dragging) {
        const dx = e.clientX - px, dy = e.clientY - py;
        moved += Math.abs(dx) + Math.abs(dy);
        rotY += dx * 0.005; rotX += dy * 0.003;
        rotX = Math.max(-1.2, Math.min(1.2, rotX));
        px = e.clientX; py = e.clientY;
      }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchD = 0;
      if (pointers.size === 0) {
        if (dragging && moved < 6 && hover >= 0) {
          const p = puntos[hover];
          // solo paths internos; el prefijo /en se detecta por segmento (no confundir /entidad)
          if (p.h && p.h.startsWith('/') && !p.h.startsWith('//')) {
            const yaEn = /^\/en(\/|$|\?)/.test(p.h);
            const href = locale === 'en' && !yaEn ? `/en${p.h}` : p.h;
            window.location.href = href;
          }
        }
        dragging = false;
      }
    };
    const leave = () => { mx = -1; my = -1; };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom = Math.min(2.6, Math.max(0.55, zoom * (e.deltaY < 0 ? 1.08 : 0.925)));
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('wheel', wheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('wheel', wheel);
    };
  }, [puntos, enlaces, pos, clusters, locale, t]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
