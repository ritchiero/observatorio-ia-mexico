'use client';

// MapaVivo3D v3 — pase quisquilloso contra la referencia (codemap.lexsuite.app):
// · El campo llena TODO el lienzo (mundo elíptico: estirado 1.45x en X) y los
//   puntos pasan por detrás del texto (la página pone un velo para legibilidad).
// · Sub-clústeres REALES con etiqueta fina: cámaras (Diputados/Senado/locales)
//   y dependencias del Ejecutivo (SEP, ATDT, …) + los temas más conectados.
// · Puntos sólidos de 0.6–2.2px con brillo variable por hash (nada de anillos);
//   bloom solo en registros nuevos o de alto peso.
// · Solo los ~400 hilos más cortos (adiós hairball de líneas cruzadas).
// · La bitácora es polvo profundo por todo el volumen, no un disco denso.
// Sin dependencias; posiciones deterministas por hash; prefers-reduced-motion.

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
    } as Record<string, string>,
    unidad: 'registros',
    abrir: 'clic para abrir la ficha',
  },
  en: {
    clusters: {
      ejecutivo: 'Executive', legislativo: 'Legislative', judicial: 'Judicial',
      academia: 'Academia', privado: 'Private sector', temas: 'Bridge topics',
    } as Record<string, string>,
    unidad: 'records',
    abrir: 'click to open the record',
  },
} as const;

const COLOR: Record<string, string> = {
  ejecutivo: '#3DE0FF', legislativo: '#34E59C', judicial: '#A47CFF',
  academia: '#FFC24D', privado: '#4D7BFF', temas: '#8E9BD9',
  personas: '#66779E', bitacora: '#46536F',
};

// +Y proyecta hacia ABAJO en canvas; los centroides ya lo asumen.
const CENTRO: Record<string, [number, number, number]> = {
  legislativo: [-0.44, 0.08, 0.1],
  ejecutivo: [0.46, -0.16, 0.16],
  judicial: [0.4, 0.42, -0.14],
  academia: [-0.36, 0.44, 0.26],
  privado: [-0.02, 0.28, -0.5],
  temas: [0.02, -0.44, -0.05],
  personas: [0, 0, 0],
  bitacora: [0, 0, 0],
};
const SIGMA: Record<string, number> = {
  legislativo: 0.34, ejecutivo: 0.3, judicial: 0.16, academia: 0.16, privado: 0.14, temas: 0.24, personas: 0.06, bitacora: 0.06,
};

function h01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
function g(s: string, salt: number): number {
  return (h01(s, salt) + h01(s, salt + 7) + h01(s, salt + 13)) / 1.5 - 1;
}
// mezcla un hex hacia blanco (0..1) — para el centelleo por punto
function tint(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
  const m = (c: number) => Math.round(c + (255 - c) * f);
  return `rgb(${m(r)},${m(gg)},${m(b)})`;
}

export default function MapaVivo3D({ puntos, enlaces, locale = 'es' }: Props) {
  const t = L[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Posiciones: clúster → sub-clúster (real) → punto; satélites orbitan a su padre
  const pos = useMemo(() => {
    const arr = new Float32Array(puntos.length * 3);
    const subC = new Map<string, [number, number, number]>();
    const subCentro = (k: string, s: string): [number, number, number] => {
      const key = `${k}|${s}`;
      let c = subC.get(key);
      if (!c) {
        const [cx, cy, cz] = CENTRO[k] ?? CENTRO.temas;
        const sig = SIGMA[k] ?? 0.2;
        const a1 = h01(key, 51) * Math.PI * 2, a2 = h01(key, 57) * Math.PI;
        const r = sig * (0.55 + h01(key, 61) * 0.75);
        c = [cx + Math.cos(a1) * Math.sin(a2) * r * 1.25, cy + Math.cos(a2) * r, cz + Math.sin(a1) * Math.sin(a2) * r];
        subC.set(key, c);
      }
      return c;
    };
    puntos.forEach((n, i) => {
      if (n.p != null) {
        const r = 0.05 + h01(n.id, 31) * 0.16;
        const a1 = h01(n.id, 37) * Math.PI * 2, a2 = h01(n.id, 41) * Math.PI;
        arr[i * 3] = arr[n.p * 3] + Math.cos(a1) * Math.sin(a2) * r;
        arr[i * 3 + 1] = arr[n.p * 3 + 1] + Math.cos(a2) * r;
        arr[i * 3 + 2] = arr[n.p * 3 + 2] + Math.sin(a1) * Math.sin(a2) * r;
      } else if (n.k === 'personas') {
        const a = h01(n.id, 3) * Math.PI * 2;
        const r = 1.0 + g(n.id, 17) * 0.14;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = g(n.id, 23) * 0.68;
        arr[i * 3 + 2] = Math.sin(a) * r;
      } else if (n.k === 'bitacora') {
        // polvo profundo por todo el volumen (atmósfera de datos reales)
        const a = h01(n.id, 5) * Math.PI * 2;
        const r = 0.2 + h01(n.id, 11) * 1.25;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = g(n.id, 29) * 0.78;
        arr[i * 3 + 2] = Math.sin(a) * r * (0.5 + h01(n.id, 43) * 0.85);
      } else if (n.s) {
        const [sx, sy, sz] = subCentro(n.k, n.s);
        const sig = (SIGMA[n.k] ?? 0.2) * 0.42;
        arr[i * 3] = sx + g(n.id, 1) * sig;
        arr[i * 3 + 1] = sy + g(n.id, 2) * sig;
        arr[i * 3 + 2] = sz + g(n.id, 3) * sig;
      } else {
        const [cx, cy, cz] = CENTRO[n.k] ?? CENTRO.temas;
        const sig = SIGMA[n.k] ?? 0.2;
        arr[i * 3] = cx + g(n.id, 1) * sig;
        arr[i * 3 + 1] = cy + g(n.id, 2) * sig;
        arr[i * 3 + 2] = cz + g(n.id, 3) * sig;
      }
    });
    return arr;
  }, [puntos]);

  // Solo los hilos más cortos (los largos cruzan todo y ensucian)
  const enlacesCortos = useMemo(() => {
    const conL = enlaces.map(([a, b]) => {
      const dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2];
      return { a, b, d: dx * dx + dy * dy + dz * dz };
    });
    conL.sort((x, y) => x.d - y.d);
    return conL.slice(0, 300).map(({ a, b }) => [a, b] as [number, number]);
  }, [enlaces, pos]);

  // Rótulos: entes (grandes) + sub-clústeres reales con ≥4 registros + temas top
  const rotulos = useMemo(() => {
    type Rot = { texto: string; sub?: string; x: number; y: number; z: number; peso: number };
    const out: Rot[] = [];
    const porEnte = new Map<string, { n: number; x: number; y: number; z: number }>();
    const porSub = new Map<string, { k: string; s: string; n: number; x: number; y: number; z: number }>();
    puntos.forEach((p, i) => {
      if (p.c !== 'registro') return;
      const e = porEnte.get(p.k) ?? { n: 0, x: 0, y: 0, z: 0 };
      e.n++; e.x += pos[i * 3]; e.y += pos[i * 3 + 1]; e.z += pos[i * 3 + 2];
      porEnte.set(p.k, e);
      if (p.s) {
        const key = `${p.k}|${p.s}`;
        const q = porSub.get(key) ?? { k: p.k, s: p.s, n: 0, x: 0, y: 0, z: 0 };
        q.n++; q.x += pos[i * 3]; q.y += pos[i * 3 + 1]; q.z += pos[i * 3 + 2];
        porSub.set(key, q);
      }
    });
    for (const [k, e] of porEnte) {
      out.push({ texto: t.clusters[k] ?? k, sub: `${e.n} ${t.unidad}`, x: e.x / e.n, y: e.y / e.n, z: e.z / e.n, peso: 2 });
    }
    for (const q of porSub.values()) {
      if (q.n >= 3) out.push({ texto: q.s, sub: `${q.n}`, x: q.x / q.n, y: q.y / q.n, z: q.z / q.n, peso: 1 });
    }
    // temas más conectados, con su nombre real
    const temasTop = puntos
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.k === 'temas' && p.c === 'puente' && (p.v ?? 0) >= 2 && p.l)
      .slice(0, 6);
    for (const { p, i } of temasTop) {
      const lbl = (p.l as string).charAt(0).toUpperCase() + (p.l as string).slice(1);
      out.push({ texto: lbl.length > 22 ? lbl.slice(0, 21) + '…' : lbl, x: pos[i * 3], y: pos[i * 3 + 1], z: pos[i * 3 + 2], peso: 1 });
    }
    return out;
  }, [puntos, pos, t]);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const auto = !reduce;
    let raf = 0, W = 0, H = 0;
    let rotY = 0.5, rotX = -0.14, zoom = 1;
    let dragging = false, px = 0, py = 0, moved = 0, pinchD = 0;
    let mx = -1, my = -1, hover = -1;
    const proj = new Float32Array(puntos.length * 3);

    // 3 tonos por clúster (centelleo determinista) + gama suave para el polvo
    const shades = new Map<string, [string, string, string]>();
    const suaves = new Map<string, [string, string, string]>();
    for (const [k, c] of Object.entries(COLOR)) {
      shades.set(k, [tint(c, 0), tint(c, 0.22), tint(c, 0.45)]);
      suaves.set(k, [tint(c, 0.4), tint(c, 0.55), tint(c, 0.7)]);
    }

    // sprite de bloom por clúster (solo héroes)
    const sprites = new Map<string, HTMLCanvasElement>();
    const sprite = (k: string) => {
      let s = sprites.get(k);
      if (!s) {
        s = document.createElement('canvas');
        s.width = s.height = 48;
        const c2 = s.getContext('2d')!;
        const grd = c2.createRadialGradient(24, 24, 0, 24, 24, 24);
        const col = COLOR[k] ?? '#8E9BD9';
        grd.addColorStop(0, col + 'E6');
        grd.addColorStop(0.3, col + '55');
        grd.addColorStop(1, col + '00');
        c2.fillStyle = grd;
        c2.fillRect(0, 0, 48, 48);
        sprites.set(k, s);
      }
      return s;
    };

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
      if (auto && !dragging) rotY += 0.0007;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cy0 = Math.cos(rotY), sy0 = Math.sin(rotY), cx0 = Math.cos(rotX), sx0 = Math.sin(rotX);
      const R = Math.min(W, H) * 0.64 * zoom;
      const RX = R * Math.min(1.5, Math.max(1, (W / H) * 0.82)); // mundo elíptico: llena lo ancho
      const cxm = W * 0.52, cym = H * 0.48;

      for (let i = 0; i < puntos.length; i++) {
        const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        const x1 = x * cy0 + z * sy0, z1 = -x * sy0 + z * cy0;
        const y1 = y * cx0 - z1 * sx0, z2 = y * sx0 + z1 * cx0;
        const s = F / (F + z2);
        proj[i * 3] = cxm + x1 * RX * s;
        proj[i * 3 + 1] = cym + y1 * R * s;
        proj[i * 3 + 2] = s;
      }

      // hilos cortos, apenas visibles
      ctx.lineWidth = 0.55;
      for (let k = 0; k < enlacesCortos.length; k++) {
        const [a, b] = enlacesCortos[k];
        const alpha = Math.max(0, (proj[a * 3 + 2] + proj[b * 3 + 2]) / 2 - 0.68) * 0.34;
        if (alpha <= 0.008) continue;
        ctx.strokeStyle = `rgba(140,168,220,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(proj[a * 3], proj[a * 3 + 1]);
        ctx.lineTo(proj[b * 3], proj[b * 3 + 1]);
        ctx.stroke();
      }

      // puntos sólidos con centelleo determinista; bloom solo en héroes
      let best = -1, bestD = 13 * 13;
      for (let i = 0; i < puntos.length; i++) {
        const X = proj[i * 3], Y = proj[i * 3 + 1], s = proj[i * 3 + 2];
        if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue;
        const p = puntos[i];
        const depth = Math.max(0, Math.min(1, (s - 0.5) * 2));
        const tono = (p.c === 'fuente' || p.c === 'evento' ? suaves : shades).get(p.k) ?? shades.get('temas')!;
        const brillo = h01(p.id, 71);
        let r: number, alpha: number;
        if (p.c === 'evento') { r = (0.65 + brillo * 0.4) * s; alpha = (0.3 + brillo * 0.2) * depth; }
        else if (p.c === 'fuente') { r = (0.85 + brillo * 0.45) * s; alpha = (0.48 + brillo * 0.3) * depth; }
        else if (p.c === 'puente') { r = (0.9 + Math.min(p.v ?? 1, 3) * 0.3) * s; alpha = (p.k === 'personas' ? 0.45 : 0.7) * depth; }
        else { r = (1.1 + Math.min(p.v ?? 1, 3) * 0.35) * s; alpha = (0.8 + brillo * 0.2) * depth; }
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = tono[brillo > 0.86 ? 2 : brillo > 0.55 ? 1 : 0];
        ctx.beginPath();
        ctx.arc(X, Y, Math.max(0.4, r), 0, 6.2832);
        ctx.fill();
        if (p.c === 'registro' && (p.n || (p.v ?? 0) >= 2.6)) {
          const gsz = r * 7;
          ctx.globalAlpha = Math.min(1, alpha) * 0.5;
          ctx.drawImage(sprite(p.k), X - gsz / 2, Y - gsz / 2, gsz, gsz);
        }
        if (mx >= 0 && p.l) {
          const dx = X - mx, dy = Y - my, d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = i; }
        }
      }
      ctx.globalAlpha = 1;
      hover = best;

      // rótulos con anticolisión (entes grandes, sub-clústeres finos)
      ctx.textAlign = 'left';
      const puestas: [number, number][] = [];
      for (const rot of rotulos) {
        const x1 = rot.x * cy0 + rot.z * sy0, z1 = -rot.x * sy0 + rot.z * cy0;
        const y1 = rot.y * cx0 - z1 * sx0, z2 = rot.y * sx0 + z1 * cx0;
        const s = F / (F + z2);
        if (s < (rot.peso === 2 ? 0.78 : 0.9)) continue;
        const X = cxm + x1 * RX * s, Y = cym + y1 * R * s;
        if (X < 8 || X > W - 90 || Y < 26 || Y > H - 14) continue;
        // zona del titular/párrafo: sin rótulos encima (los puntos sí pasan);
        // en pantallas angostas el texto ocupa casi todo el ancho
        const zonaTexto = W < 900 ? W * 0.96 : W * 0.44;
        if (X < zonaTexto && Y < H * (W < 900 ? 0.62 : 0.55)) continue;
        const ancho = rot.peso === 2 ? 150 : 110;
        if (puestas.some(([qx, qy]) => Math.abs(qx - X) < ancho && Math.abs(qy - Y) < 30)) continue;
        puestas.push([X, Y]);
        if (rot.peso === 2) {
          ctx.font = `600 ${Math.round(13.5 * s)}px ui-sans-serif, system-ui, sans-serif`;
          ctx.fillStyle = 'rgba(236,241,250,0.96)';
          ctx.fillText(rot.texto, X + 10, Y - 3);
          ctx.font = `${Math.round(10.5 * s)}px ui-monospace, monospace`;
          ctx.fillStyle = 'rgba(150,168,205,0.85)';
          if (rot.sub) ctx.fillText(rot.sub, X + 10, Y + 12);
        } else {
          ctx.font = `500 ${Math.round(11 * s)}px ui-sans-serif, system-ui, sans-serif`;
          ctx.fillStyle = 'rgba(214,222,240,0.78)';
          ctx.fillText(rot.texto + (rot.sub ? ` · ${rot.sub}` : ''), X + 8, Y + 3);
        }
      }

      // tooltip
      if (hover >= 0) {
        const p = puntos[hover];
        const X = proj[hover * 3], Y = proj[hover * 3 + 1];
        const label = (p.l ?? '').length > 64 ? (p.l as string).slice(0, 63) + '…' : p.l ?? '';
        ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
        const w = ctx.measureText(label).width + 18;
        const bx = Math.min(Math.max(8, X + 12), W - w - 8), by = Math.max(30, Y - 14);
        ctx.fillStyle = 'rgba(6,8,16,0.94)';
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
  }, [puntos, enlacesCortos, pos, rotulos, locale, t]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}
