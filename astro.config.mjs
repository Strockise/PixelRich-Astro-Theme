// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import config from './src/config/config.json' with { type: 'json' };

// Canonical URL and sitemap domain: SITE_URL, else the Vercel production domain, else config.json.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL || (vercelUrl ? `https://${vercelUrl}` : config.site.base_url);

// https://astro.build/config
export default defineConfig({
  site,
  // Webflow's runtime (public/js/webflow.js) marks the active link by comparing
  // each href with location.pathname, so every internal link ends with a slash.
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/$/.test(page),
    }),
  ],
  env: {
    schema: {
      // Unset: the site builds with the demo content in strapi/data/seed.json.
      STRAPI_URL: envField.string({
        context: 'server',
        access: 'public',
        url: true,
        optional: true,
      }),
      STRAPI_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
