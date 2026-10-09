import { getCollection } from 'astro:content';
import menu from '@/config/menu.json';

/** Services, newest first (Strapi `createdAt`), as the original Webflow lists. */
export async function getServices() {
  const services = await getCollection('services');
  return services.sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime());
}

/** Blog posts, newest first. */
export async function getPosts() {
  const posts = await getCollection('blogPosts');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const serviceUrl = (slug: string) => `/service/${slug}/`;
export const postUrl = (slug: string) => `/blog/${slug}/`;

/**
 * Resolves menu URLs. `cms:service` / `cms:blog` point to a sample detail page:
 * the slug set in menu.json `cms_samples` when it exists, otherwise the first entry.
 */
export async function resolveMenuUrl(url: string): Promise<string> {
  if (url === 'cms:service') {
    const services = await getServices();
    const slug = services.find((s) => s.id === menu.cms_samples.service)?.id ?? services[0]?.id;
    return slug ? serviceUrl(slug) : '/service/';
  }
  if (url === 'cms:blog') {
    const posts = await getPosts();
    const slug = posts.find((p) => p.id === menu.cms_samples.blog)?.id ?? posts[0]?.id;
    return slug ? postUrl(slug) : '/blog/';
  }
  return url;
}

/** True when `url` is the page being rendered (Webflow's `w--current` state). */
export function isCurrent(url: string, pathname: string): boolean {
  const normalize = (p: string) => (p.endsWith('/') ? p : `${p}/`);
  return normalize(url) === normalize(pathname);
}

/** "October 17, 2025", the Webflow date format used on the blog cards. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
