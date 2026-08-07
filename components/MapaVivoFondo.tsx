'use client';

// MapaVivoFondo — la constelación (MapaVivo3D) como fondo del hero.
// Carga los datos client-side con rutas RELATIVAS (mismo origen) usando el
// mismo builder del /mapa-vivo, y renderiza en modo fondo: la rueda del mouse
// scrollea la página (Ctrl/Cmd + rueda hace zoom), arrastre rota, hover
// etiqueta y clic abre la ficha — igual que hacía el grafo del hero.

import { useEffect, useState } from 'react';
import MapaVivo3D from './MapaVivo3D';
import { datosMapaVivo, type DatosMapaVivo } from '@/lib/mapa-vivo-datos';

export default function MapaVivoFondo({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const [datos, setDatos] = useState<DatosMapaVivo | null>(null);

  useEffect(() => {
    let vivo = true;
    datosMapaVivo('').then((d) => { if (vivo && d.puntos.length) setDatos(d); });
    return () => { vivo = false; };
  }, []);

  if (!datos) return null; // el hero ya tiene su fondo de gradientes mientras carga
  return <MapaVivo3D puntos={datos.puntos} enlaces={datos.enlaces} locale={locale} modoFondo />;
}
