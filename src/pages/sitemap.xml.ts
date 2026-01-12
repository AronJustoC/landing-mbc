import { type APIRoute } from 'astro';
import { services } from '../consts/services';

export const prerender = true;

const SITE_URL = 'https://mbcpredictive.com';

// Static pages
const staticPages = [
  '',
  '/about',
  '/services',
  '/contact',
];

export const GET: APIRoute = () => {
  // Build sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static pages
  for (const page of staticPages) {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${SITE_URL}${page}</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    sitemap += `  </url>\n`;
  }

  // Add service pages
  for (const service of services) {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${SITE_URL}/servicios/${service.id}</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.9</priority>\n`;
    sitemap += `  </url>\n`;
  }

  sitemap += `</urlset>\n`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
