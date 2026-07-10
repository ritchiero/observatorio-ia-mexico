const DEFAULT_PUBLIC_DATA_ORIGIN = 'https://www.observatorio-ia-mexico.com';

type RuntimeEnv = {
  NODE_ENV?: string;
  FIREBASE_ADMIN_PROJECT_ID?: string;
  FIREBASE_ADMIN_CLIENT_EMAIL?: string;
  FIREBASE_ADMIN_PRIVATE_KEY?: string;
  OBSERVATORIO_PUBLIC_DATA_URL?: string;
};

type Fetcher = (input: string | URL, init?: RequestInit) => Promise<Response>;

type FallbackResult<T> =
  | { used: false }
  | { used: true; data: T };

export class PublicReadFallbackError extends Error {
  readonly status = 502;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PublicReadFallbackError';
  }
}

export function hasFirebaseAdminCredentials(env: RuntimeEnv = process.env): boolean {
  return Boolean(
    env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
    env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
    env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()
  );
}

export function shouldUsePublicReadFallback(env: RuntimeEnv = process.env): boolean {
  return env.NODE_ENV === 'development' && !hasFirebaseAdminCredentials(env);
}

export async function loadPublicReadFallback<T>(
  path: `/${string}`,
  isValidPayload: (value: unknown) => value is T,
  options: {
    env?: RuntimeEnv;
    fetcher?: Fetcher;
  } = {}
): Promise<FallbackResult<T>> {
  const env = options.env ?? process.env;
  if (!shouldUsePublicReadFallback(env)) {
    return { used: false };
  }

  const origin = env.OBSERVATORIO_PUBLIC_DATA_URL?.trim() || DEFAULT_PUBLIC_DATA_ORIGIN;
  const url = new URL(path, `${origin.replace(/\/$/, '')}/`);
  const fetcher = options.fetcher ?? fetch;

  let response: Response;
  try {
    response = await fetcher(url, { cache: 'no-store' });
  } catch (error) {
    throw new PublicReadFallbackError(`No se pudo consultar ${url.pathname}`, { cause: error });
  }

  if (!response.ok) {
    throw new PublicReadFallbackError(
      `La fuente pública respondió ${response.status} para ${url.pathname}`
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new PublicReadFallbackError(
      `La fuente pública devolvió JSON inválido para ${url.pathname}`,
      { cause: error }
    );
  }

  if (!isValidPayload(payload)) {
    throw new PublicReadFallbackError(
      `La fuente pública devolvió una estructura inválida para ${url.pathname}`
    );
  }

  return { used: true, data: payload };
}
