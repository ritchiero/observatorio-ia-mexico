import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { request as httpsRequest, type RequestOptions } from 'node:https';
import { isIP } from 'node:net';
import { Readable } from 'node:stream';

export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export const DEFAULT_FETCH_TIMEOUT_MS = 15_000;
export const MAX_REDIRECTS = 4;

const DEFAULT_ALLOWED_HOSTS = [
  'dof.gob.mx',
  'www.dof.gob.mx',
  'diputados.gob.mx',
  'www.diputados.gob.mx',
  'gaceta.diputados.gob.mx',
  'senado.gob.mx',
  'www.senado.gob.mx',
  'infosen.senado.gob.mx',
  'sil.gobernacion.gob.mx',
];

export class PdfBackupValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'PdfBackupValidationError';
  }
}

export type HostRule = {
  hostname: string;
  includeSubdomains: boolean;
};

export type ResolveHost = (hostname: string) => Promise<readonly string[]>;

export type ValidatedPdf = {
  buffer: Buffer;
  sourceUrl: string;
  finalUrl: string;
  redirectCount: number;
  declaredMime: string;
  detectedMime: 'application/pdf';
  byteLength: number;
  sha256: string;
};

type FetchValidatedPdfOptions = {
  allowedHosts: readonly HostRule[];
  fetchImpl?: typeof fetch;
  resolveHost?: ResolveHost;
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
};

type ResolvedSafeRemoteUrl = {
  url: URL;
  addresses: readonly string[];
};

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
}

function parseHostRule(value: string): HostRule | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  const includeSubdomains = trimmed.startsWith('*.');
  const hostname = normalizeHostname(includeSubdomains ? trimmed.slice(2) : trimmed);

  if (
    !hostname ||
    hostname.includes('/') ||
    hostname.includes(':') ||
    hostname.includes('*') ||
    !/^[a-z0-9.-]+$/.test(hostname) ||
    hostname.startsWith('.') ||
    hostname.endsWith('.') ||
    hostname.includes('..')
  ) {
    throw new PdfBackupValidationError(
      'invalid_allowlist',
      `Host inválido en PDF_BACKUP_ALLOWED_HOSTS: ${value}`,
    );
  }

  return { hostname, includeSubdomains };
}

/**
 * PDF_BACKUP_ALLOWED_HOSTS accepts comma-separated exact hosts. A rule may use
 * "*.example.gob.mx" when subdomains are intentionally required. An explicitly
 * empty environment variable disables all hosts; an absent variable uses the
 * conservative list of federal document repositories above.
 */
export function parseAllowedHostRules(raw: string | undefined): HostRule[] {
  const values = raw === undefined ? DEFAULT_ALLOWED_HOSTS : raw.split(',');
  const unique = new Map<string, HostRule>();

  for (const value of values) {
    const rule = parseHostRule(value);
    if (!rule) continue;
    unique.set(`${rule.includeSubdomains ? '*.' : ''}${rule.hostname}`, rule);
  }

  return [...unique.values()];
}

export function isHostnameAllowed(
  hostname: string,
  rules: readonly HostRule[],
): boolean {
  const normalized = normalizeHostname(hostname);

  return rules.some((rule) => {
    if (normalized === rule.hostname) return !rule.includeSubdomains;
    return rule.includeSubdomains && normalized.endsWith(`.${rule.hostname}`);
  });
}

function ipv4Octets(address: string): number[] | null {
  if (isIP(address) !== 4) return null;
  const octets = address.split('.').map(Number);
  return octets.length === 4 && octets.every((octet) => octet >= 0 && octet <= 255)
    ? octets
    : null;
}

function ipv6Bytes(address: string): number[] | null {
  const normalized = normalizeHostname(address);
  if (isIP(normalized) !== 6) return null;

  const halves = normalized.split('::');
  if (halves.length > 2) return null;

  const parseGroups = (part: string): number[] => {
    if (!part) return [];
    return part.split(':').flatMap((group) => {
      if (group.includes('.')) {
        const octets = ipv4Octets(group);
        if (!octets) return [];
        return [(octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]];
      }
      return [Number.parseInt(group, 16)];
    });
  };

  const left = parseGroups(halves[0]);
  const right = parseGroups(halves[1] ?? '');
  const missing = 8 - left.length - right.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;

  const groups = [...left, ...Array(missing).fill(0), ...right];
  if (groups.length !== 8 || groups.some((group) => !Number.isFinite(group))) return null;

  return groups.flatMap((group) => [(group >> 8) & 0xff, group & 0xff]);
}

/** Returns true for non-routable, local, documentation and transition ranges. */
export function isPrivateOrReservedIp(address: string): boolean {
  const normalized = normalizeHostname(address);
  const ipv4 = ipv4Octets(normalized);

  if (ipv4) {
    const [a, b, c] = ipv4;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0 && c === 0) ||
      (a === 192 && b === 0 && c === 2) ||
      (a === 192 && b === 88 && c === 99) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      a >= 224
    );
  }

  const ipv6 = ipv6Bytes(normalized);
  if (!ipv6) return true;

  // Only global-unicast IPv6 (2000::/3) is eligible for an outbound fetch.
  if ((ipv6[0] & 0xe0) !== 0x20) return true;

  // Documentation, Teredo, ORCHID and 6to4 ranges are not valid destinations
  // for this job, even if a platform happens to route them.
  return (
    (ipv6[0] === 0x20 &&
      ipv6[1] === 0x01 &&
      ipv6[2] === 0x0d &&
      ipv6[3] === 0xb8) ||
    (ipv6[0] === 0x20 && ipv6[1] === 0x01 && ipv6[2] === 0x00 && ipv6[3] === 0x00) ||
    (ipv6[0] === 0x20 && ipv6[1] === 0x01 && ipv6[2] === 0x00 && ipv6[3] === 0x10) ||
    (ipv6[0] === 0x20 && ipv6[1] === 0x02)
  );
}

const defaultResolveHost: ResolveHost = async (hostname) => {
  if (isIP(hostname)) return [hostname];
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.map(({ address }) => address);
};

async function resolveSafeRemoteUrl(
  input: string | URL,
  allowedHosts: readonly HostRule[],
  resolveHost: ResolveHost = defaultResolveHost,
): Promise<ResolvedSafeRemoteUrl> {
  let url: URL;
  try {
    url = input instanceof URL ? new URL(input.href) : new URL(input);
  } catch {
    throw new PdfBackupValidationError('invalid_url', 'La URL del PDF no es válida.');
  }

  if (url.protocol !== 'https:') {
    throw new PdfBackupValidationError('https_required', 'La URL del PDF debe usar HTTPS.');
  }
  if (url.username || url.password) {
    throw new PdfBackupValidationError(
      'credentials_forbidden',
      'La URL del PDF no puede incluir credenciales.',
    );
  }
  if (url.port && url.port !== '443') {
    throw new PdfBackupValidationError(
      'port_forbidden',
      'La URL del PDF debe usar el puerto HTTPS estándar.',
    );
  }

  const hostname = normalizeHostname(url.hostname);
  if (!isHostnameAllowed(hostname, allowedHosts)) {
    throw new PdfBackupValidationError(
      'host_not_allowed',
      `El host ${hostname} no está autorizado para respaldos.`,
    );
  }

  let addresses: readonly string[];
  try {
    addresses = await resolveHost(hostname);
  } catch {
    throw new PdfBackupValidationError(
      'dns_failed',
      `No se pudo resolver el host autorizado ${hostname}.`,
    );
  }

  if (addresses.length === 0) {
    throw new PdfBackupValidationError('dns_empty', `El host ${hostname} no tiene direcciones IP.`);
  }
  if (addresses.some(isPrivateOrReservedIp)) {
    throw new PdfBackupValidationError(
      'private_address',
      `El host ${hostname} resuelve a una dirección privada o reservada.`,
    );
  }

  return { url, addresses };
}

export async function assertSafeRemoteUrl(
  input: string | URL,
  allowedHosts: readonly HostRule[],
  resolveHost: ResolveHost = defaultResolveHost,
): Promise<URL> {
  return (await resolveSafeRemoteUrl(input, allowedHosts, resolveHost)).url;
}

/**
 * Connect to the already-validated IP while retaining the original hostname
 * for HTTP Host and TLS SNI/certificate validation. This closes the gap where
 * a second DNS lookup during fetch could be rebound to a private address.
 */
export function buildPinnedHttpsRequestOptions(url: URL, address: string): RequestOptions {
  return {
    protocol: 'https:',
    hostname: address,
    port: 443,
    method: 'GET',
    path: `${url.pathname}${url.search}`,
    headers: {
      Accept: 'application/pdf',
      Host: url.host,
      'User-Agent': 'ObservatorioIAMexico-PdfPreserver/2.0',
    },
    ...(isIP(url.hostname) === 0 ? { servername: url.hostname } : {}),
    family: isIP(address),
    rejectUnauthorized: true,
    agent: false,
  };
}

async function fetchPinnedHttps(
  url: URL,
  address: string,
  signal: AbortSignal,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      {
        ...buildPinnedHttpsRequestOptions(url, address),
        signal,
      },
      (response) => {
        try {
          const status = response.statusCode ?? 502;
          if (status < 200 || status > 599) {
            response.destroy();
            reject(
              new PdfBackupValidationError(
                'upstream_http_error',
                `La fuente respondió HTTP ${status}.`,
              ),
            );
            return;
          }

          const headers = new Headers();
          for (const [name, value] of Object.entries(response.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) headers.append(name, item);
            } else if (value !== undefined) {
              headers.set(name, String(value));
            }
          }

          const bodyForbidden = [204, 205, 304].includes(status);
          const body = bodyForbidden
            ? null
            : Readable.toWeb(response) as ReadableStream<Uint8Array>;
          if (bodyForbidden) response.resume();
          resolve(
            new Response(body, {
              status,
              statusText: response.statusMessage,
              headers,
            }),
          );
        } catch (error) {
          response.destroy();
          reject(error);
        }
      },
    );

    request.once('error', reject);
    request.end();
  });
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<Buffer> {
  if (!response.body) {
    throw new PdfBackupValidationError('empty_body', 'La respuesta no contiene un PDF.');
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel('PDF demasiado grande');
        throw new PdfBackupValidationError(
          'file_too_large',
          `El PDF excede el límite de ${MAX_PDF_BYTES} bytes.`,
        );
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, byteLength);
}

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

export async function fetchValidatedPdf(
  sourceUrl: string,
  options: FetchValidatedPdfOptions,
): Promise<ValidatedPdf> {
  const resolveHost = options.resolveHost ?? defaultResolveHost;
  const timeoutMs = Math.max(1, options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS);
  const maxBytes = Math.min(MAX_PDF_BYTES, Math.max(1, options.maxBytes ?? MAX_PDF_BYTES));
  const maxRedirects = Math.min(MAX_REDIRECTS, Math.max(0, options.maxRedirects ?? MAX_REDIRECTS));
  let currentUrl = sourceUrl;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const resolved = await resolveSafeRemoteUrl(currentUrl, options.allowedHosts, resolveHost);
    const safeUrl = resolved.url;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Tests may inject fetchImpl; production always uses the pinned HTTPS
      // transport so the connection cannot trigger an unvalidated DNS lookup.
      const response = options.fetchImpl
        ? await options.fetchImpl(safeUrl, {
            redirect: 'manual',
            signal: controller.signal,
            headers: {
              Accept: 'application/pdf',
              'User-Agent': 'ObservatorioIAMexico-PdfPreserver/2.0',
            },
          })
        : await fetchPinnedHttps(safeUrl, resolved.addresses[0], controller.signal);

      if (isRedirect(response.status)) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) {
          throw new PdfBackupValidationError(
            'redirect_without_location',
            'La fuente respondió con una redirección sin destino.',
          );
        }
        if (redirectCount === maxRedirects) {
          throw new PdfBackupValidationError(
            'too_many_redirects',
            `La descarga excedió ${maxRedirects} redirecciones.`,
          );
        }
        currentUrl = new URL(location, safeUrl).href;
        continue;
      }

      if (!response.ok) {
        await response.body?.cancel();
        throw new PdfBackupValidationError(
          'upstream_http_error',
          `La fuente respondió HTTP ${response.status}.`,
        );
      }

      const declaredMime = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
      if (declaredMime !== 'application/pdf') {
        await response.body?.cancel();
        throw new PdfBackupValidationError(
          'mime_mismatch',
          `La fuente declaró ${declaredMime || 'un MIME vacío'}, no application/pdf.`,
        );
      }

      const contentLength = Number(response.headers.get('content-length'));
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        await response.body?.cancel();
        throw new PdfBackupValidationError(
          'file_too_large',
          `El PDF excede el límite de ${MAX_PDF_BYTES} bytes.`,
        );
      }

      const buffer = await readBodyWithLimit(response, maxBytes);
      if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        throw new PdfBackupValidationError(
          'magic_mismatch',
          'El contenido recibido no comienza con la firma %PDF-.',
        );
      }

      return {
        buffer,
        sourceUrl,
        finalUrl: safeUrl.href,
        redirectCount,
        declaredMime,
        detectedMime: 'application/pdf',
        byteLength: buffer.length,
        sha256: createHash('sha256').update(buffer).digest('hex'),
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new PdfBackupValidationError(
          'fetch_timeout',
          `La descarga excedió el timeout de ${timeoutMs} ms.`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new PdfBackupValidationError('too_many_redirects', 'La descarga excedió las redirecciones.');
}
