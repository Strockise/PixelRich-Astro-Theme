import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { fetchCollection, toImage, type StrapiMedia } from './lib/strapi';

/**
 * Content Layer loader for a Strapi 5 collection type.
 * Entries are keyed by slug and the Markdown `content` field is rendered at
 * build time, so pages can use Astro's `render(entry)` like any local collection.
 */
function strapiLoader(pluralName: string, sort: string): Loader {
  return {
    name: `strapi-${pluralName}`,
    load: async ({ store, parseData, renderMarkdown, generateDigest, logger }) => {
      const items = await fetchCollection<Record<string, unknown> & { slug: string; content?: string }>(pluralName, {
        sort,
      });
      store.clear();
      for (const item of items) {
        const data = await parseData({ id: item.slug, data: item });
        store.set({
          id: item.slug,
          data,
          digest: generateDigest(item),
          rendered: item.content ? await renderMarkdown(item.content) : undefined,
        });
      }
      logger.info(`Loaded ${items.length} ${pluralName} from Strapi`);
    },
  };
}

const media = z
  .object({
    id: z.number(),
    documentId: z.string(),
    url: z.string(),
    alternativeText: z.string().nullable(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    mime: z.string(),
    formats: z.record(z.string(), z.object({ url: z.string(), width: z.number(), height: z.number() })).nullable(),
  })
  .transform((m) => toImage(m as StrapiMedia)!);

/** Newest first, the same order as the original Webflow collection lists. */
const services = defineCollection({
  loader: strapiLoader('services', 'createdAt:desc'),
  schema: z.object({
    documentId: z.string(),
    title: z.string(),
    slug: z.string(),
    imageOne: media,
    imageTwo: media,
    imageThree: media,
    metaDescription: z.string().nullish(),
    createdAt: z.coerce.date(),
  }),
});

const blogPosts = defineCollection({
  loader: strapiLoader('blog-posts', 'date:desc'),
  schema: z.object({
    documentId: z.string(),
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    readTime: z.string(),
    thumbnail: media,
    metaDescription: z.string().nullish(),
  }),
});

export const collections = { services, blogPosts };
