// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import config from './src/config/config.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url,
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
      STRAPI_URL: envField.string({
        context: 'server',
        access: 'public',
        url: true,
        default: 'http://localhost:1337',
      }),
      STRAPI_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
