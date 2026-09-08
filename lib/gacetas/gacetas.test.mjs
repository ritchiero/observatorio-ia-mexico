import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAnexoVII, urlAnexoVII, limpiarHtml } from './diputados.ts';
import { esRelevanteIA, tematicasDe, tipoDe, partidoDe, claveTitulo, relevanciaConCuerpo, conteoIA, evidenciaIA } from './keywords.ts';

const FIX = new URL('./__fixtures__/diputados-20260902-VII.html', import.meta.url);
const html = new TextDecoder('iso-8859-1').decode(readFileSync(FIX));

test('urlAnexoVII sigue el patrón real de la Gaceta (mes abreviado, sin acentos)', () => {
  assert.equal(urlAnexoVII(new Date('2026-09-02T12:00:00Z')), 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-VII.html');
  assert.equal(urlAnexoVII(new Date('2026-01-15T12:00:00Z')), 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/ene/20260115-VII.html');
});

test('el Anexo VII real del 2-sep-2026 trae 64 entradas y exactamente las relevantes a IA', () => {
  const { entradas, hallazgos } = parseAnexoVII(html, '2026-09-02', 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-VII.html');
  assert.equal(entradas, 64);
  assert.ok(hallazgos.length >= 1, 'debe hallar al menos la Ley Federal para el Uso Responsable por Menores de la IA');
  const ley = hallazgos.find((h) => /Uso Responsable por Menores/.test(h.titulo));
  assert.ok(ley, 'falta la iniciativa de Rodríguez Torres');
  assert.equal(ley.numeroEnGaceta, 6);
  assert.match(ley.proponente, /Luis Agustín Rodríguez Torres/);
  assert.match(ley.grupo, /Acción Nacional/);
  assert.match(ley.turno, /Ciencia, Tecnología e Innovación/);
  assert.equal(ley.clase, 'iniciativa');
  assert.equal(ley.fecha, '2026-09-02');
  assert.match(ley.url, /20260902-VII\.html#6$/);
});

test('ninguna entrada irrelevante se cuela (nacionalidad, derechos federales, movilidad)', () => {
  const { hallazgos } = parseAnexoVII(html, '2026-09-02', 'u');
  for (const h of hallazgos) assert.ok(esRelevanteIA(h.textoCompleto), `entrada ${h.numeroEnGaceta} no es de IA: ${h.titulo.slice(0, 60)}`);
  assert.ok(!hallazgos.some((h) => /nacionalidad mexicana exclusiva/.test(h.titulo)));
});

test('limpiarHtml decodifica entidades latin-1 de la Gaceta', () => {
  assert.equal(limpiarHtml('Inteligencia<br>Artificial &aacute; &ntilde; &#147;x&#148;'), 'Inteligencia Artificial á ñ “x”');
});

test('esRelevanteIA: acierta y no sobre-dispara', () => {
  assert.ok(esRelevanteIA('regular la inteligencia artificial'));
  assert.ok(esRelevanteIA('sistemas de IA generativa'));
  assert.ok(esRelevanteIA('deepfakes sexuales'));
  assert.ok(!esRelevanteIA('media docena de artículos sobre la industria'), 'MEDIA no debe disparar \\bIA\\b');
  assert.ok(!esRelevanteIA('tecnologías de la información'));
});

test('tematicasDe / tipoDe / partidoDe derivan el catálogo del corpus', () => {
  const t = 'Que expide la Ley Federal para el Uso Responsable por Menores de Edad de la Inteligencia Artificial';
  assert.ok(tematicasDe(t).includes('inteligencia_artificial'));
  assert.ok(tematicasDe(t).includes('proteccion_menores'));
  assert.ok(tematicasDe(t).includes('regulacion_general'));
  assert.equal(tipoDe(t), 'ley_federal');
  assert.equal(tipoDe('Que reforma la fracción XVII del artículo 73 de la Constitución Política de los Estados Unidos Mexicanos'), 'reforma_constitucional');
  assert.equal(partidoDe('Partido Acción Nacional'), 'PAN');
  assert.equal(partidoDe('Morena'), 'MORENA');
  assert.equal(partidoDe('Partido Verde Ecologista de México'), 'PVEM');
});

test('claveTitulo iguala variantes del mismo asunto', () => {
  const a = claveTitulo('Iniciativa con proyecto de decreto por el que se reforma la fracción XVII del artículo 73 de la Constitución Política de los Estados Unidos Mexicanos');
  const b = claveTitulo('Que reforma la fracción XVII del artículo 73 de la Constitución Política de los Estados Unidos Mexicanos');
  assert.equal(a, b);
});

import { parseSesionSenado, esCandidato, tituloDe, rastrearSesionSenado, urlSesionSenado, esMuroAntiBots } from './senado.ts';
import { rastrearGacetas, fechasVentana, resumenRastreo } from './rastreo.ts';

const SEN = readFileSync(new URL('./__fixtures__/senado-20260902.html', import.meta.url), 'utf8');
const DOC = readFileSync(new URL('./__fixtures__/senado-doc-162679.html', import.meta.url), 'utf8');

test('urlSesionSenado sigue el patrón YYYY_MM_DD', () => {
  assert.equal(urlSesionSenado(new Date('2026-09-02T12:00:00Z')), 'https://www.senado.gob.mx/66/gaceta_del_senado/2026_09_02');
});

test('parseSesionSenado extrae número, proponente, grupo y clase de cada ancla', () => {
  const a = parseSesionSenado(SEN);
  assert.equal(a.length, 7);
  const barreda = a.find((x) => x.url.endsWith('/162679'));
  assert.ok(barreda);
  assert.equal(barreda.numero, 6);
  assert.match(barreda.proponente, /Barreda Pav[oó]n/);
  assert.match(barreda.grupo, /Movimiento Ciudadano/);
  assert.equal(barreda.clase, 'iniciativa');
  const pa = a.find((x) => x.url.endsWith('/162659'));
  assert.equal(pa.clase, 'punto_acuerdo');
});

test('nivel 1: el Código Penal es candidato aunque el título no diga IA; Movilidad no', () => {
  const a = parseSesionSenado(SEN);
  const cpf = a.find((x) => x.url.endsWith('/162500'));
  const mov = a.find((x) => x.url.endsWith('/162508'));
  assert.equal(esCandidato(cpf), true);
  assert.equal(esCandidato(mov), false);
});

test('nivel 2: sólo se confirma con el cuerpo; Monreal sin IA en el cuerpo NO entra', async () => {
  const pedidos = [];
  const r = await rastrearSesionSenado(SEN, '2026-09-02', 'senado', {
    maxDescargas: 10,
    fetchTexto: async (u) => { pedidos.push(u); return u.endsWith('/162679') ? DOC : '<html><body><p>Sinopsis: reforma sin tecnología.</p></body></html>'; },
  });
  assert.ok(r.candidatos >= 3);
  assert.ok(r.hallazgos.some((h) => h.url.endsWith('/162679')), 'Barreda (199 Octies, contenido generado con IA) debe entrar por el cuerpo');
  assert.ok(!r.hallazgos.some((h) => h.url.endsWith('/162500')), 'Monreal 419 BIS sin IA no debe entrar');
  assert.ok(!pedidos.some((u) => u.endsWith('/162508')), 'Movilidad ni siquiera se descarga');
  const b = r.hallazgos.find((h) => h.url.endsWith('/162679'));
  assert.match(b.titulo, /199 Octies|Código Penal Federal/);
  assert.equal(b.camara, 'senadores');
});

test('tituloDe recorta el preámbulo del ancla', () => {
  const [a] = parseSesionSenado(SEN).filter((x) => x.url.endsWith('/162500'));
  assert.match(tituloDe(a), /^Por el que se reforma el artículo 419 BIS/);
});

test('fechasVentana produce N días hacia atrás en UTC', () => {
  const f = fechasVentana(new Date('2026-09-08T03:00:00Z'), 3).map((d) => d.toISOString().slice(0, 10));
  assert.deepEqual(f, ['2026-09-08', '2026-09-07', '2026-09-06']);
});

test('rastrearGacetas: 404 en Diputados y sesión vacía en Senado no son errores; dedup entre cámaras', async () => {
  const r = await rastrearGacetas(async (u) => {
    if (u.includes('gaceta.diputados.gob.mx') && u.includes('20260902-VII')) return { status: 200, texto: html };
    if (u.includes('gaceta.diputados.gob.mx')) return { status: 404, texto: 'x' };
    if (u.includes('gaceta_del_senado/2026_09_02')) return { status: 200, texto: SEN };
    if (u.includes('/documento/162679')) return { status: 200, texto: DOC };
    if (u.includes('/documento/')) return { status: 200, texto: '<p>sin tecnología</p>' };
    return { status: 200, texto: '<html></html>' };
  }, new Date('2026-09-03T12:00:00Z'), 5, 10);
  assert.equal(r.diputados.diasConsultados, 5);
  assert.equal(r.diputados.sesionesConDatos, 1);
  assert.equal(r.diputados.asuntosLeidos, 64);
  assert.equal(r.senado.sesionesConDatos, 1);
  assert.deepEqual(r.diputados.errores, []);
  assert.ok(r.hallazgos.some((h) => h.fuente === 'diputados'));
  assert.ok(r.hallazgos.some((h) => h.fuente === 'senado'));
  const res = resumenRastreo(r, 2, 1);
  assert.match(res, /Diputados 1 sesión/);
  assert.match(res, /64 asuntos leídos/);
  assert.match(res, /Nuevas en el corpus: 2; ya registradas: 1/);
});

import { urlIndiceDia, urlAnexoIIDesdeIndice, partesAnexoII, parseParteAnexoII } from './diputados.ts';
const PARTE = new TextDecoder('iso-8859-1').decode(readFileSync(new URL('./__fixtures__/diputados-20260902-II-2-1.html', import.meta.url)));

test('Anexo II: URL del índice del día y del subíndice de iniciativas', () => {
  assert.equal(urlIndiceDia(new Date('2026-09-02T12:00:00Z')), 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902.html');
  const idx = '<a href="/Gaceta/66/2026/sep/20260902-O.html">Anexo O</a> <a href="/Gaceta/66/2026/sep/20260902-II.html">Anexo II</a>';
  assert.equal(urlAnexoIIDesdeIndice(idx), 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-II.html');
  const sub = '<a href="/Gaceta/66/2026/sep/20260902-II-1-1.html">x</a><a href="/PDF/66/2026/sep/20260902-II-1-4.pdf">y</a><a href="/Gaceta/66/2026/sep/20260902-II-3.html">z</a>';
  const p = partesAnexoII(sub);
  assert.deepEqual(p.html, ['https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-II-1-1.html', 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-II-3.html']);
  assert.equal(p.pdf.length, 1);
});

test('Anexo II: una parte real (PAN, 2-sep-2026) se separa por bloques Versales y sólo pasan los de IA', () => {
  const { bloques, incidentales, hallazgos } = parseParteAnexoII(PARTE, '2026-09-02', 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-II-2-1.html');
  assert.equal(bloques, 3);
  // Rodríguez Torres (IA en el título) pasa; la del 248 Bis CPF (Hernández Cerón) menciona
  // la IA UNA vez en 13 mil caracteres: es incidental, se cuenta pero no se registra.
  assert.equal(hallazgos.length, 1);
  assert.equal(incidentales, 1);
  const [h] = hallazgos;
  assert.match(h.titulo, /^Que expide la Ley Federal para el Uso Responsable por Menores/);
  assert.match(h.proponente, /Rodríguez Torres/);
  assert.match(h.grupo, /PAN|Acción Nacional/);
  assert.equal(h.turno, '');
  assert.equal(h.camara, 'diputados');
  assert.equal(h.relevancia, 'titulo');
  assert.ok(h.menciones >= 1 && h.evidencia.length > 40, 'debe traer conteo y fragmento de evidencia');
});

test('relevanciaConCuerpo: título manda; sin título, hacen falta ≥3 menciones en el cuerpo', () => {
  const relleno = 'La presente iniciativa tiene por objeto fortalecer el marco jurídico vigente. '.repeat(120);
  assert.equal(relevanciaConCuerpo('Que expide la Ley de Inteligencia Artificial', relleno), 'titulo');
  assert.equal(relevanciaConCuerpo('Que reforma la Ley Federal del Trabajo, en materia de licencia menstrual', relleno + ' incluso mediante inteligencia artificial. ' + relleno), null);
  assert.equal(relevanciaConCuerpo('Que reforma la Ley de Aviación Civil, en materia de tarifas', relleno + ' Mediante algoritmos y sistemas automatizados las tarifas cambian; el algoritmo decide. ' + relleno), 'cuerpo');
  assert.equal(conteoIA('sin nada'), 0);
  assert.match(evidenciaIA(relleno + 'usa inteligencia artificial para decidir' + relleno), /^…[\s\S]*inteligencia artificial[\s\S]*…$/);
});

test('Senado: el muro anti-bots se detecta, corta las descargas y queda contado, no disfrazado de "sin novedad"', async () => {
  const MURO = '<html><head><META NAME="robots" CONTENT="noindex,nofollow"></head><body><iframe src="/_Incapsula_Resource?CWUDNSAI=9"></iframe>Request unsuccessful. Incapsula incident ID: 123-456</body></html>';
  assert.equal(esMuroAntiBots(MURO), true);
  assert.equal(esMuroAntiBots(SEN), false);
  let pedidos = 0;
  const r = await rastrearSesionSenado(SEN, '2026-09-02', 'senado', {
    concurrencia: 2, pausaMs: 0, maxDescargas: 50,
    fetchTexto: async () => { pedidos++; return MURO; },
  });
  assert.ok(r.candidatos >= 3, 'la sesión de prueba tiene varios candidatos');
  assert.equal(r.cortado, true, 'un lote entero de muro debe cortar');
  assert.equal(pedidos, 2, 'sólo se gasta el primer lote');
  assert.equal(r.bloqueados, 2);
  assert.ok(r.sinEvaluar >= r.candidatos - r.hallazgos.length - 0, 'los no abiertos quedan sin evaluar');
  assert.equal(r.hallazgos.filter((h) => h.textoCompleto.length > 0).length, r.hallazgos.length);

  // Si la propia gaceta del día es el muro, el rastreo lo registra como error explícito.
  const g = await rastrearGacetas(async (u) => (/senado\.gob\.mx/.test(u) ? { status: 200, texto: MURO } : null), new Date('2026-09-03T12:00:00Z'), 2, 10);
  assert.equal(g.senado.sesionesBloqueadas, 2);
  assert.equal(g.senado.sesionesConDatos, 0);
  assert.ok(g.senado.errores.every((e) => /muro anti-bots/.test(e)));
  assert.match(resumenRastreo(g, 0, 0), /2 día\(s\) en que la gaceta misma quedó bloqueada/);
});

// ── Partes del Anexo II en PDF (texto extraído con unpdf) ─────────────────────
import { parseTextoPdfAnexoII, entradasDePortada, pareceEscaneo, normalizarLineas } from './pdf.ts';

const PDF_TXT = readFileSync(new URL('./__fixtures__/diputados-20260902-II-5-3.unpdf.txt', import.meta.url), 'utf8');

test('PDF: la portada (CONTENIDO) da las entradas con guiones de línea unidos', () => {
  const e = entradasDePortada(PDF_TXT);
  assert.equal(e.length, 3);
  assert.match(e[0], /^Que reforma y adiciona diversas disposiciones de la Ley General de Protección Civil/);
  assert.match(e[1], /^Que adiciona un artículo 386 Bis al Código Penal Federal, en materia de delito de fraude digital/);
  assert.match(e[2], /^Que adiciona el artículo 132 de la Ley Federal del Trabajo/);
  assert.equal(normalizarLineas('Ley Fe-\nderal de Jue-\n  gos'), 'Ley Federal de Juegos');
});

test('PDF real (MC, 2-sep-2026): 3 asuntos separados por encabezado; «fraude por IA generativa» + URLs IA-ENE-JUN es incidental, no ficha', () => {
  // El fixture es un recorte (9 mil caracteres) del PDF real de 66 páginas: se pasan 6 páginas para conservar la densidad real.
  const r = parseTextoPdfAnexoII(PDF_TXT, 6, '2026-09-02', 'https://gaceta.diputados.gob.mx/PDF/66/2026/sep/20260902-II-5-3.pdf');
  assert.equal(r.sinCapaTexto, false);
  assert.equal(r.bloques, 3);
  assert.equal(r.separacion, 'encabezado');
  assert.equal(r.hallazgos.length, 0, 'ninguna es de IA como tema');
  assert.equal(r.incidentales, 1, 'la de fraude digital menciona la IA de paso (las URL de CONDUSEF no cuentan)');
});

test('PDF: título con IA pasa aunque el cuerpo sea corto; el escaneo sin texto se reconoce', () => {
  const sintetico = [
    'Gaceta\nParlamentaria\nAño XXIX Palacio Legislativo de San Lázaro, martes 8 de septiembre de 2026 Número 7130-II-9\nCONTENIDO\nIniciativas',
    'Que expide la Ley General de Inteligencia Artificial, a cargo de la diputada Ejemplo Pérez, del Grupo Parlamentario de Morena',
    'Que reforma el artículo 5 de la Ley de Caminos, suscrita por el diputado Otro Ruiz, del Grupo Parlamentario del PAN',
    'Anexo II-9\n1\nINICIATIVA CON PROYECTO DE DECRETO POR EL QUE SE EXPIDE LA LEY GENERAL DE INTELIGENCIA ARTIFICIAL; A CARGO DE LA DIPUTADA EJEMPLO PÉREZ, DEL GRUPO PARLAMENTARIO DE MORENA.\nExposición de Motivos\n' + 'La inteligencia artificial requiere un marco. '.repeat(30),
    'INICIATIVA CON PROYECTO DE DECRETO POR EL QUE SE REFORMA EL ARTÍCULO 5 DE LA LEY DE CAMINOS; SUSCRITA POR EL DIPUTADO OTRO RUIZ, DEL GRUPO PARLAMENTARIO DEL PAN.\nExposición de Motivos\n' + 'Los caminos rurales necesitan mantenimiento. '.repeat(30),
  ].join('\n');
  const r = parseTextoPdfAnexoII(sintetico, 4, '2026-09-08', 'https://gaceta.diputados.gob.mx/PDF/66/2026/sep/20260908-II-9.pdf');
  assert.equal(r.bloques, 2);
  assert.equal(r.hallazgos.length, 1);
  assert.equal(r.hallazgos[0].relevancia, 'titulo');
  assert.match(r.hallazgos[0].titulo, /^Que expide la Ley General de Inteligencia Artificial$/);
  assert.match(r.hallazgos[0].proponente, /Ejemplo Pérez/);
  assert.match(r.hallazgos[0].grupo, /Morena/);
  assert.ok(r.hallazgos[0].menciones >= 30);
  assert.equal(pareceEscaneo('Gaceta Parlamentaria 7117-II-1-4 ' + 'x'.repeat(2000), 210), true);
  assert.equal(pareceEscaneo(PDF_TXT, 6), false);
  const esc = parseTextoPdfAnexoII('Gaceta\nParlamentaria\n', 210, '2026-09-02', 'u');
  assert.equal(esc.sinCapaTexto, true);
  assert.equal(esc.hallazgos.length, 0);
});

test('rastrearGacetas: las partes en PDF se leen con los ganchos; los pesados se cuentan como omitidos', async () => {
  const IDX = '<html><body><a href="/Gaceta/66/2026/sep/20260902-II.html">Anexo II</a></body></html>';
  const SUB = '<html><body><a href="/Gaceta/66/2026/sep/20260902-II-1.html">Anexo II-1</a><a href="/PDF/66/2026/sep/20260902-II-5-3.pdf">Anexo II-5-3</a><a href="/PDF/66/2026/sep/20260902-II-1-4.pdf">Anexo II-1-4</a></body></html>';
  const pedidos = [];
  const g = await rastrearGacetas(async (u) => {
    pedidos.push(u);
    if (/20260902\.html$/.test(u)) return { status: 200, texto: IDX };
    if (/20260902-II\.html$/.test(u)) return { status: 200, texto: SUB };
    if (/20260902-II-1\.html$/.test(u)) return { status: 200, texto: '<html><body></body></html>' };
    if (/senado/.test(u)) return { status: 200, texto: '<html><body>sin asuntos</body></html>' };
    return { status: 404, texto: '' };
  }, new Date('2026-09-02T12:00:00Z'), 1, 10, {
    maxPdfBytes: 1000,
    fetchBinario: async (u, max) => (/II-1-4/.test(u) ? { status: 200, bytes: null, tamano: 20_000_000 } : { status: 200, bytes: new Uint8Array([1]), tamano: 500 }),
    extraerTextoPdf: async () => ({ texto: PDF_TXT, paginas: 6 }),
  });
  assert.equal(g.diputados.partesPdfLeidas, 1);
  assert.equal(g.diputados.partesPdfOmitidas, 1);
  assert.equal(g.diputados.asuntosLeidos, 3);
  assert.equal(g.diputados.relevantes, 0);
  assert.match(resumenRastreo(g, 0, 0), /1 en PDF; 1 PDF pesados sin leer/);
});
