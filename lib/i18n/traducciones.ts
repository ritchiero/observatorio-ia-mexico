import fs from 'node:fs';
import path from 'node:path';

// Overlay de traducciones ES->EN generado por el pipeline de backfill (ver
// tools/ingest — traducción con agentes Haiku, ver memoria de la sesión que lo
// creó). Los archivos viven en data/i18n/en/*.json, keyed por el id real del
// documento en Firestore. Si un id no tiene traducción todavía, se cae al
// español — nunca se rompe la página EN por un backfill incompleto.

export interface TraduccionAnuncio { titulo?: string; descripcion?: string; resumenAgente?: string; }
export interface TraduccionIniciativa { titulo?: string; descripcion?: string; }
export interface TraduccionArticulo { articuloMD?: string; articuloResumen?: string; }
export interface TraduccionCaso { nombre?: string; resumen?: string; hechos?: string; elementoIA?: string; }

type Coleccion = 'anuncios' | 'iniciativas' | 'hemeroteca' | 'casos';

const cache = new Map<Coleccion, Record<string, unknown>>();

function cargar<T>(coleccion: Coleccion): Record<string, T> {
  if (cache.has(coleccion)) return cache.get(coleccion) as Record<string, T>;
  let data: Record<string, T> = {};
  try {
    const p = path.join(process.cwd(), 'data', 'i18n', 'en', `${coleccion}.json`);
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    data = {};
  }
  cache.set(coleccion, data);
  return data;
}

export function traduccionAnuncio(id: string): TraduccionAnuncio | undefined {
  return cargar<TraduccionAnuncio>('anuncios')[id];
}
export function traduccionIniciativa(id: string): TraduccionIniciativa | undefined {
  return cargar<TraduccionIniciativa>('iniciativas')[id];
}
export function traduccionArticulo(id: string): TraduccionArticulo | undefined {
  return cargar<TraduccionArticulo>('hemeroteca')[id];
}
export function traduccionCaso(id: string): TraduccionCaso | undefined {
  return cargar<TraduccionCaso>('casos')[id];
}

/** Cuántos ids tienen traducción — para un badge honesto de cobertura si hace falta. */
export function coberturaEn() {
  return {
    anuncios: Object.keys(cargar('anuncios')).length,
    iniciativas: Object.keys(cargar('iniciativas')).length,
    hemeroteca: Object.keys(cargar('hemeroteca')).length,
    casos: Object.keys(cargar('casos')).length,
  };
}
