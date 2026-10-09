import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import demo from '../strapi/data/seed.json';
import { fetchCollection, hasStrapi, toImage, type StrapiMedia } from './lib/strapi';

type Item = Record<string, unknown> & { slug: string; content?: string };

/**
 * Content Layer loader for a Strapi 5 collection type.
 * Without STRAPI_URL it loads the bundled demo content (the same data the Strapi
 * seed script imports), so the theme also builds and deploys without a CMS.
 * Entries are keyed by slug and the Markdown `content` field is rendered at build
 * time, so pages can use Astro's `render(entry)` like any local collection.
 */
function strapiLoader(pluralName: string, sort: string, demoItems: () => Item[]): Loader {
  return {
    name: `strapi-${pluralName}`,
    load: async ({ store, parseData, renderMarkdown, generateDigest, logger }) => {
      const items = hasStrapi ? await fetchCollection<Item>(pluralName, { sort }) : demoItems();
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
      logger.info(`Loaded ${items.length} ${pluralName} from ${hasStrapi ? 'Strapi' : 'the demo content (STRAPI_URL is not set)'}`);
    },
  };
}

/** Demo images live in public/images/demo. */
const demoImage = ({ file, alt }: { file: string; alt: string }) => ({ src: `/images/demo/${file}`, alt });

const strapiMedia = z
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

const image = z.union([strapiMedia, z.object({ src: z.string(), alt: z.string(), srcset: z.string().optional() })]);

/** Newest first, the same order as the original Webflow collection lists. */
const services = defineCollection({
  loader: strapiLoader('services', 'createdAt:desc', () =>
    demo.services.map((s) => ({
      title: s.title,
      slug: s.slug,
      imageOne: demoImage(s.images[0]),
      imageTwo: demoImage(s.images[1]),
      imageThree: demoImage(s.images[2]),
      content: s.content,
      metaDescription: s.metaDescription,
      createdAt: s.createdOn,
    })),
  ),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    imageOne: image,
    imageTwo: image,
    imageThree: image,
    metaDescription: z.string().nullish(),
    createdAt: z.coerce.date(),
  }),
});

const blogPosts = defineCollection({
  loader: strapiLoader('blog-posts', 'date:desc', () =>
    demo.blogPosts.map((p) => ({
      title: p.title,
      slug: p.slug,
      date: p.date,
      readTime: p.readTime,
      thumbnail: demoImage(p.thumbnail),
      content: p.content,
      metaDescription: p.metaDescription,
    })),
  ),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    readTime: z.string(),
    thumbnail: image,
    metaDescription: z.string().nullish(),
  }),
});

export const collections = { services, blogPosts };
