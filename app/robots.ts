import type { MetadataRoute } from 'next';

const BASE = 'https://www.observatorio-ia-mexico.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Zonas internas / no indexables
        disallow: ['/admin', '/api', '/dashboard', '/demo-expandible', '/ia-pi'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
