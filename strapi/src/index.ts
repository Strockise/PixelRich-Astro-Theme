import type { Core } from '@strapi/strapi';

/** Content types the Astro frontend reads. */
const PUBLIC_CONTENT_TYPES = ['api::blog-post.blog-post', 'api::service.service'];
const PUBLIC_ACTIONS = ['find', 'findOne'];

/**
 * Gives the Public role read-only access to the website content so the Astro
 * frontend can build without an API token. Set PUBLIC_READ_ACCESS=false to keep
 * the content private and use a read-only API token (STRAPI_API_TOKEN) instead.
 */
async function grantPublicReadAccess(strapi: Core.Strapi) {
  const publicRole = await strapi
    .documents('plugin::users-permissions.role')
    .findFirst({ filters: { type: 'public' } });
  if (!publicRole) return;

  for (const uid of PUBLIC_CONTENT_TYPES) {
    for (const action of PUBLIC_ACTIONS) {
      const permission = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: permission, role: publicRole.id } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action: permission, role: publicRole.id } });
      }
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.PUBLIC_READ_ACCESS !== 'false') {
      await grantPublicReadAccess(strapi);
    }
  },
};
