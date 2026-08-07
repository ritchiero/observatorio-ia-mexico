// Diccionario de UI bilingüe (ES/EN). Fuente única para strings de navegación,
// botones y labels compartidos — igual que lib/entes.ts y lib/estados.ts para
// datos, esto evita que cada página EN reinvente sus propias traducciones.

export type Locale = 'es' | 'en';

export const DICT = {
  es: {
    nav: {
      tracker: 'Tracker',
      legislacion: 'Legislación',
      casos: 'Casos',
      hemeroteca: 'Hemeroteca',
      recap: 'Recap',
      actividad: 'Actividad',
      informe: 'Informe 2026',
      grafo: 'Mapa',
      metodologia: 'Metodología',
    },
    home: {
      badge: 'Observatorio ciudadano',
      title1: 'La IA en México,',
      title2: 'en un mapa vivo.',
    },
    common: {
      verMas: 'Ver más',
      verTodos: 'Ver todos',
      fuenteOficial: 'Fuente oficial',
      descargarPdf: 'Descargar copia (PDF)',
      versionMarkdown: 'Versión Markdown',
      inicio: 'Inicio',
      buscar: 'Buscar',
      total: 'Total',
      actualizacionMensual: 'Actualización mensual',
      datosAbiertos: 'Datos abiertos (CSV)',
      verificacionAutomatizada: 'Verificación automatizada (IA) · pendiente de auditoría humana',
      sinFechaLimite: 'Sin fecha límite',
      documentoNoDisponible: 'Documento no disponible',
    },
    hemeroteca: {
      badge: 'Archivo público',
      title: 'A living archive of AI in the Mexican state.',
      subtitle:
        'Official documents, bills, precedents and public announcements about artificial-intelligence regulation in Mexico — organized without losing the paper trail.',
      statFichas: 'Indexed records',
      statFichasDetail: 'with summary and source',
      statFederal: 'Federal',
      statFederalDetail: 'Chamber and Senate',
      statLocal: 'State-level',
      statLocalDetail: 'state congresses',
      statPdf: 'Backed by PDF',
      cobertura: 'Coverage',
      coberturaDetail: 'Verified documentary base',
      actualiza: 'Updates every 120 seconds from published sources.',
      vacio: 'No records published yet.',
      footer: 'Summaries by Observatorio IA México, verified against the official source.',
    },
  },
  en: {
    nav: {
      tracker: 'Tracker',
      legislacion: 'Legislation',
      casos: 'Cases',
      hemeroteca: 'Archive',
      recap: 'Recap',
      actividad: 'Activity',
      informe: '2026 Report',
      grafo: 'Map',
      metodologia: 'Methodology',
    },
    home: {
      badge: 'Citizen watchdog',
      title1: 'AI in Mexico,',
      title2: 'on a living map.',
    },
    common: {
      verMas: 'Read more',
      verTodos: 'View all',
      fuenteOficial: 'Official source',
      descargarPdf: 'Download copy (PDF)',
      versionMarkdown: 'Markdown version',
      inicio: 'Home',
      buscar: 'Search',
      total: 'Total',
      actualizacionMensual: 'Updated monthly',
      datosAbiertos: 'Open data (CSV)',
      verificacionAutomatizada: 'Automated verification (AI) · pending human review',
      sinFechaLimite: 'No deadline set',
      documentoNoDisponible: 'Document unavailable',
    },
    hemeroteca: {
      badge: 'Public archive',
      title: 'A living archive of AI in the Mexican state.',
      subtitle:
        'Official documents, bills, precedents and public announcements about artificial-intelligence regulation in Mexico — organized without losing the paper trail.',
      statFichas: 'Indexed records',
      statFichasDetail: 'with summary and source',
      statFederal: 'Federal',
      statFederalDetail: 'Chamber and Senate',
      statLocal: 'State-level',
      statLocalDetail: 'state congresses',
      statPdf: 'Backed by PDF',
      cobertura: 'Coverage',
      coberturaDetail: 'Verified documentary base',
      actualiza: 'Updates every 120 seconds from published sources.',
      vacio: 'No records published yet.',
      footer: 'Summaries by Observatorio IA México, verified against the official source.',
    },
  },
} as const;

export function dict(locale: Locale) {
  return DICT[locale];
}
