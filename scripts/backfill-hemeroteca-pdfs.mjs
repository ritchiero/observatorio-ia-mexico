#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const DEFAULT_SERVICE_ACCOUNT =
  '/Users/ritchie/.config/firebase-service-accounts/observatorio-ia-mexico.json';
const DEFAULT_BUCKET = 'observatorio-ia-mexico.firebasestorage.app';
const OBS_ROOT = '/Users/ritchie/Downloads/Observatorio IA Mexico';
const P3_ROOT = path.join(OBS_ROOT, 'P3/Iniciativas Gaceta Publica');
const P3_MANIFEST = path.join(P3_ROOT, 'manifest_iniciativas_gaceta.csv');
const P1_P2_MANIFEST = path.join(OBS_ROOT, 'manifest.csv');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function obsPath(relativePath) {
  return path.join(OBS_ROOT, relativePath);
}

const SOURCE_OVERRIDES = {
  '17gGZKUthBCGsfxE8Pf5': {
    kind: 'local_html',
    path: obsPath('P3/Legislativo IA/PAN_Senado_Michel_Gonzalez_paquete_10_IA_2026-03-24.html'),
    sourceUrl: 'https://www.pan.senado.gob.mx/2026/03/presenta-michel-gonzalez-paquete-de-10-iniciativas-en-materia-de-inteligencia-artificial-y-proteccion-a-mujeres-y-ninas/',
  },
  '4wBtabyuztWfnOrhZv1o': {
    kind: 'local_html',
    path: obsPath('P3/Legislativo IA/Pablo_Angulo_SIL_popup_5086367.html'),
    sourceUrl: 'http://sil.gobernacion.gob.mx/Librerias/pp_ContenidoAsuntos.php?SID=&Clave=5086367',
  },
  'rDbmoWNNTCufdOO3cY7c': {
    kind: 'local_html',
    path: obsPath('P3/Legislativo IA/Pablo_Angulo_SIL_popup_5086367.html'),
    sourceUrl: 'http://sil.gobernacion.gob.mx/Librerias/pp_ContenidoAsuntos.php?SID=&Clave=5086367',
  },
  '6NR8qlVcA80WJ96bwSbz': {
    kind: 'local_markdown_note',
    path: obsPath('_no_localizados/P3_CDMX_Clara_Brugada_usurpacion_IA.md'),
  },
  L8bjv1nEsQH301jxvAg0: {
    kind: 'local_pdf',
    path: obsPath('P3/Iniciativas Gaceta Publica/archivos/090_Santiago_Gonzalez_doblaje_IA_SIL.pdf'),
    sourceUrl: 'https://sil.gobernacion.gob.mx/Archivos/Documentos/2025/04/asun_4896201_20250430_1745528888.pdf',
  },
  '6RwDxidx8USKthd93wZM': {
    kind: 'local_pdf',
    path: obsPath('P3/Legislativo IA/Rolando_Zapata_Comision_IA_LGIA_v1_Drive_publico_2026.pdf'),
    sourceUrl: 'https://comisiones.senado.gob.mx/inteligencia_artificial/',
  },
  'YYNLxUtdx0Q0nAccndML': {
    kind: 'local_pdf',
    path: obsPath('P3/Legislativo IA/Rolando_Zapata_Comision_IA_LGIA_v1_Drive_publico_2026.pdf'),
    sourceUrl: 'https://comisiones.senado.gob.mx/inteligencia_artificial/',
  },
  H7LKKPoDqAPEMMgtCScH: {
    kind: 'local_pdf',
    path: obsPath('P3/Legislativo IA/Karina_Ruiz_Ley_Nacional_Regular_Uso_IA_SIL_2026-02-11.pdf'),
    sourceUrl: 'http://sil.gobernacion.gob.mx/Archivos/Documentos/2026/02/asun_5010406_20260211_1770836392.pdf',
  },
  Ufi5VXVdFB1IHQBjrz1L: {
    kind: 'local_html',
    path: obsPath('P3/Legislativo IA/INFO_CDMX_Boletin_DCS_184_2024_iniciativa_IA.html'),
    sourceUrl: 'https://infocdmx.org.mx/',
  },
  LMfGhHDUUH6Zz5Q44FK8: {
    kind: 'remote_pdf',
    url: 'https://legislacion.congresoedomex.gob.mx/storage/documentos/asuntos/iniciativas/487-INIC-EDUCAC-URBINA-PRI.pdf',
    notePath: obsPath('P3/Iniciativas Gaceta Publica/_no_descargados/141_146_Edomex_educacion_IA_timeout.md'),
  },
  ecisQvm191ue63BllS1h: {
    kind: 'remote_pdf',
    url: 'https://legislacion.congresoedomex.gob.mx/storage/documentos/asuntos/iniciativas/487-INIC-EDUCAC-URBINA-PRI.pdf',
    notePath: obsPath('P3/Iniciativas Gaceta Publica/_no_descargados/141_146_Edomex_educacion_IA_timeout.md'),
  },
  kKC71HzDUKSCpydgAO8v: {
    kind: 'local_pdf',
    path: obsPath('P3/Legislativo IA/Rolando_Zapata_Comision_IA_LGIA_v1_Drive_publico_2026.pdf'),
    sourceUrl: 'https://comisiones.senado.gob.mx/inteligencia_artificial/',
  },
};

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const FORCE = args.has('--force');
const INCLUDE_ARTICLE_FALLBACK = !args.has('--no-article-fallback');
const LIMIT = Number.parseInt(readArg('--limit') ?? '', 10);
const ONLY_ID = readArg('--id');

function readArg(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function isPdfUrl(value) {
  return isHttpUrl(value) && /\.pdf(?:[?#]|$)/i.test(value.trim());
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function csvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim()));
}

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const rows = csvRows(fs.readFileSync(file, 'utf8'));
  const headers = rows.shift();
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  );
}

function fileSha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function assertPdf(file) {
  const fd = fs.openSync(file, 'r');
  const header = Buffer.alloc(4);
  fs.readSync(fd, header, 0, 4, 0);
  fs.closeSync(fd);
  if (header.toString('utf8') !== '%PDF') {
    throw new Error(`Archivo generado no es PDF: ${file}`);
  }
}

async function printUrlToPdf(url, outFile, tmpRoot) {
  if (!fs.existsSync(CHROME)) {
    throw new Error(`No encontré Google Chrome en ${CHROME}`);
  }
  const userDataDir = path.join(tmpRoot, `chrome-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await fsp.mkdir(userDataDir, { recursive: true });
  const result = spawnSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      '--blink-settings=imagesEnabled=false',
      '--virtual-time-budget=3000',
      `--user-data-dir=${userDataDir}`,
      `--print-to-pdf=${outFile}`,
      url,
    ],
    { encoding: 'utf8', timeout: 90_000 },
  );
  if (result.status !== 0) {
    throw new Error(`Chrome no pudo generar PDF: ${result.stderr || result.stdout}`);
  }
  assertPdf(outFile);
}

async function markdownFileToPdf(sourceFile, outFile, title) {
  const markdown = await fsp.readFile(sourceFile, 'utf8');
  await readableTextToPdf(outFile, title, markdownToPlainText(markdown), `Nota local: ${sourceFile}`);
}

function cleanedHtmlBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const rawBody = bodyMatch ? bodyMatch[1] : html;
  return rawBody
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\s(?:src|srcset)=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/\son[a-z]+='[^']*'/gi, '');
}

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (_, name) => named[name.toLowerCase()] ?? `&${name};`);
}

function htmlToPlainText(html) {
  return decodeHtmlEntities(
    cleanedHtmlBody(html)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li\b[^>]*>/gi, '\n- ')
      .replace(/<\/(?:p|div|section|article|header|footer|li|tr|table|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function markdownToPlainText(markdown) {
  return decodeHtmlEntities(markdown)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
}

function toWinAnsi(value) {
  return String(value)
    .normalize('NFC')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[…]/g, '...')
    .replace(/[•]/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, ' ');
}

function pdfText(value) {
  return `<${Buffer.from(toWinAnsi(value), 'latin1').toString('hex')}>`;
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function readableTextToPdf(outFile, title, bodyText, sourceNote = '') {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const pages = [];
  let commands = [];
  let y = pageHeight - margin;

  function newPage() {
    if (commands.length) pages.push(commands.join('\n'));
    commands = [];
    y = pageHeight - margin;
  }

  function line(text, size = 10.5, font = 'F1', leading = size * 1.42) {
    if (y < margin + leading) newPage();
    commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${margin} ${y.toFixed(2)} Tm ${pdfText(text)} Tj ET`);
    y -= leading;
  }

  function paragraph(text, size = 10.5, font = 'F1', gap = 7) {
    const maxChars = Math.max(42, Math.floor(maxWidth / (size * 0.48)));
    for (const wrapped of wrapText(text, maxChars)) {
      line(wrapped, size, font);
    }
    y -= gap;
  }

  line('Observatorio IA Mexico - Respaldo documental', 8, 'F2', 13);
  y -= 4;
  for (const titleLine of wrapText(title, 62)) line(titleLine, 17, 'F2', 21);
  y -= 12;

  const paragraphs = String(bodyText)
    .split(/\n{1,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  for (const block of paragraphs) {
    paragraph(block);
  }

  if (sourceNote) {
    y -= 10;
    paragraph(sourceNote, 8.5, 'F1', 0);
  }
  if (commands.length) pages.push(commands.join('\n'));

  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  const pageIds = [];
  pages.forEach((content, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    const stream = Buffer.from(content, 'ascii');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${content}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  const chunks = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'binary')];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(`${index + 1} 0 obj\n${object}\nendobj\n`, 'binary'));
  });
  const xrefOffset = Buffer.concat(chunks).length;
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, 'ascii'));
  for (let i = 1; i < offsets.length; i += 1) {
    chunks.push(Buffer.from(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`, 'ascii'));
  }
  chunks.push(Buffer.from(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`, 'ascii'));
  await fsp.writeFile(outFile, Buffer.concat(chunks));
  assertPdf(outFile);
}

async function htmlFileToPdf(sourceFile, outFile, title, sourceUrl) {
  const html = await fsp.readFile(sourceFile, 'utf8');
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const sourceTitle = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || title;
  await readableTextToPdf(
    outFile,
    sourceTitle,
    htmlToPlainText(html),
    sourceUrl ? `Fuente original: ${sourceUrl}` : `Fuente local: ${sourceFile}`,
  );
}

async function articleToPdf(doc, outFile) {
  await readableTextToPdf(
    outFile,
    doc.data.titulo,
    markdownToPlainText(doc.data.articuloMD || doc.data.resumen || doc.data.titulo),
    'PDF generado desde la ficha pública porque no existe fuente PDF local/directa.',
  );
}

async function downloadPdf(url, outFile) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ObservatorioIAMexico/1.0 PDF backup' },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al descargar ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fsp.writeFile(outFile, buffer);
  assertPdf(outFile);
}

function matchManifest(doc, rows) {
  const numero = String(doc.data.numero ?? '');
  const title = normalize(doc.data.titulo);
  const sourceUrls = [
    doc.data.urlPDFOriginal,
    doc.data.urlPDF,
    doc.data.urlGaceta,
    doc.data.fuenteOriginal,
  ].filter(Boolean).map(String);

  const scored = rows
    .filter((row) => String(row.numero ?? '') === numero || sourceUrls.includes(row.url))
    .map((row) => {
      const rowTitle = normalize(row.titulo);
      let score = 0;
      if (String(row.numero ?? '') === numero) score += 30;
      if (row.url && sourceUrls.includes(row.url)) score += 60;
      if (title && rowTitle === title) score += 100;
      if (title && rowTitle && (title.includes(rowTitle) || rowTitle.includes(title))) score += 45;
      if (row.archivo && /\.pdf$/i.test(row.archivo)) score += 5;
      return { row, score };
    })
    .filter(({ score }) => score >= 35)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.row ?? null;
}

function sourceFromManifest(doc, manifestRow) {
  if (!manifestRow?.archivo) return null;
  const sourcePath = path.join(P3_ROOT, manifestRow.archivo);
  const ext = path.extname(sourcePath).toLowerCase();
  if (fs.existsSync(sourcePath)) {
    if (ext === '.pdf') return { kind: 'local_pdf', path: sourcePath, sourceUrl: manifestRow.url };
    if (ext === '.html') return { kind: 'local_html', path: sourcePath, sourceUrl: manifestRow.url };
    if (ext === '.md' && isPdfUrl(manifestRow.url)) {
      return { kind: 'remote_pdf', url: manifestRow.url, notePath: sourcePath };
    }
    if (ext === '.md') return { kind: 'local_markdown_note', path: sourcePath, sourceUrl: manifestRow.url };
  }
  if (isPdfUrl(manifestRow.url)) {
    return { kind: 'remote_pdf', url: manifestRow.url };
  }
  return null;
}

function sourceFromOverride(doc) {
  const source = SOURCE_OVERRIDES[doc.id];
  if (!source) return null;
  if (source.path && !fs.existsSync(source.path)) {
    throw new Error(`Override apunta a archivo inexistente para ${doc.id}: ${source.path}`);
  }
  return source;
}

function sourceFromDoc(doc) {
  const urls = [doc.data.urlPDFOriginal, doc.data.urlPDF, doc.data.urlGaceta, doc.data.fuenteOriginal]
    .filter(isHttpUrl);
  const pdfUrl = urls.find(isPdfUrl);
  if (pdfUrl) return { kind: 'remote_pdf', url: pdfUrl };
  const htmlUrl = urls.find((url) => !isPdfUrl(url));
  if (htmlUrl) return { kind: 'remote_html', url: htmlUrl };
  return null;
}

async function preparePdf(doc, source, tmpRoot) {
  const outFile = path.join(tmpRoot, `${doc.id}.pdf`);
  if (source?.kind === 'local_pdf') {
    assertPdf(source.path);
    return { file: source.path, kind: 'local_pdf', sourceUrl: source.sourceUrl, sourcePath: source.path };
  }
  if (source?.kind === 'remote_pdf') {
    try {
      await downloadPdf(source.url, outFile);
      return { file: outFile, kind: 'downloaded_pdf', sourceUrl: source.url };
    } catch (error) {
      if (source.notePath && fs.existsSync(source.notePath)) {
        await markdownFileToPdf(source.notePath, outFile, doc.data.titulo);
        return {
          file: outFile,
          kind: 'rendered_local_note',
          sourceUrl: source.url,
          sourcePath: source.notePath,
          fallbackReason: error instanceof Error ? error.message : String(error),
        };
      }
      throw error;
    }
  }
  if (source?.kind === 'local_html') {
    await htmlFileToPdf(source.path, outFile, doc.data.titulo, source.sourceUrl);
    return { file: outFile, kind: 'rendered_local_html', sourceUrl: source.sourceUrl, sourcePath: source.path };
  }
  if (source?.kind === 'remote_html') {
    await printUrlToPdf(source.url, outFile, tmpRoot);
    return { file: outFile, kind: 'rendered_remote_html', sourceUrl: source.url };
  }
  if (source?.kind === 'local_markdown_note') {
    await markdownFileToPdf(source.path, outFile, doc.data.titulo);
    return { file: outFile, kind: 'rendered_local_note', sourceUrl: source.sourceUrl, sourcePath: source.path };
  }
  if (INCLUDE_ARTICLE_FALLBACK) {
    await articleToPdf(doc, outFile);
    return { file: outFile, kind: 'rendered_article_fallback' };
  }
  return null;
}

function publicUrlFor(bucketName, destination) {
  return `https://storage.googleapis.com/${bucketName}/${destination}`;
}

async function main() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT;
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_BUCKET;
  const serviceAccount = JSON.parse(await fsp.readFile(serviceAccountPath, 'utf8'));
  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketName,
  });
  const db = getFirestore(app);
  const bucket = getStorage(app).bucket(bucketName);
  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), 'hemeroteca-pdf-backfill-'));

  try {
    const p3Rows = readCsv(P3_MANIFEST);
    const p1p2Rows = readCsv(P1_P2_MANIFEST);
    const manifestRows = [...p3Rows, ...p1p2Rows];
    const snapshot = await db.collection('iniciativas').get();
    let docs = snapshot.docs
      .map((snap) => ({ id: snap.id, ref: snap.ref, data: snap.data() }))
      .filter((doc) => !doc.data.oculto)
      .filter((doc) => doc.data.articuloMD && doc.data.articuloSlug)
      .filter((doc) => FORCE || !isHttpUrl(doc.data.urlPDFBackup));

    if (ONLY_ID) docs = docs.filter((doc) => doc.id === ONLY_ID);
    if (Number.isFinite(LIMIT) && LIMIT > 0) docs = docs.slice(0, LIMIT);

    const plan = docs.map((doc) => {
      const manifest = matchManifest(doc, manifestRows);
      const source = sourceFromOverride(doc) || sourceFromManifest(doc, manifest) || sourceFromDoc(doc);
      return {
        doc,
        manifest,
        source,
        fallback: !source && INCLUDE_ARTICLE_FALLBACK,
      };
    });

    const summary = plan.reduce((acc, item) => {
      const kind = item.source?.kind ?? (item.fallback ? 'article_fallback' : 'missing');
      acc[kind] = (acc[kind] ?? 0) + 1;
      return acc;
    }, {});

    console.log(JSON.stringify({
      mode: APPLY ? 'apply' : 'dry-run',
      selected: docs.length,
      summary,
    }, null, 2));

    for (const item of plan) {
      const { doc, source } = item;
      console.log(`#${doc.data.numero ?? '?'} ${doc.id} | ${source?.kind ?? (item.fallback ? 'article_fallback' : 'missing')} | ${doc.data.titulo}`);
      if (!APPLY) continue;

      const prepared = await preparePdf(doc, source, tmpRoot);
      if (!prepared) {
        console.log(`  SKIP sin fuente y sin fallback: ${doc.id}`);
        continue;
      }

      const sha256 = fileSha256(prepared.file);
      const byteLength = fs.statSync(prepared.file).size;
      const destination = `pdfs/iniciativas/${doc.id}.pdf`;
      const file = bucket.file(destination);

      await bucket.upload(prepared.file, {
        destination,
        resumable: false,
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=31536000, immutable',
          metadata: {
            initiativeId: doc.id,
            sourceKind: prepared.kind,
            sourceUrl: prepared.sourceUrl || '',
            sha256,
          },
        },
      });
      await file.makePublic();

      const urlPDFBackup = publicUrlFor(bucket.name, destination);
      await doc.ref.update({
        urlPDFBackup,
        pdfBackedUpAt: FieldValue.serverTimestamp(),
        pdfBackupMetadata: {
          sourceKind: prepared.kind,
          sourceUrl: prepared.sourceUrl || null,
          sourcePath: prepared.sourcePath || null,
          fallbackReason: prepared.fallbackReason || null,
          storagePath: destination,
          sha256,
          byteLength,
          generatedBy: 'scripts/backfill-hemeroteca-pdfs.mjs',
          generatedAt: new Date().toISOString(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      });

      const verify = await fetch(urlPDFBackup, { cache: 'no-store' });
      console.log(`  OK ${verify.status} ${byteLength} bytes ${urlPDFBackup}`);
    }
  } finally {
    await fsp.rm(tmpRoot, { recursive: true, force: true });
    await deleteApp(app);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
