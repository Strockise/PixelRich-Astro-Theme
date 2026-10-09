import { STRAPI_API_TOKEN, STRAPI_URL } from 'astro:env/server';

/** A Strapi 5 media object as returned by the REST API (`populate`d media field). */
export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
  mime: string;
  formats: Record<string, { url: string; width: number; height: number }> | null;
}

/** Normalised image ready to be spread onto an `<img>`. */
export interface Image {
  src: string;
  alt: string;
  srcset?: string;
}

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageCount: number } };
}

const baseUrl = STRAPI_URL.replace(/\/+$/, '');

/** Resolves upload URLs: local uploads are relative, cloud providers return absolute URLs. */
export function mediaUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${baseUrl}${url}`;
}

/** Converts a Strapi media field into `<img>` attributes, including a responsive srcset. */
export function toImage(media: StrapiMedia | null | undefined): Image | undefined {
  if (!media) return undefined;
  const variants = Object.values(media.formats ?? {})
    .filter((f) => f.width && (!media.width || f.width < media.width))
    .sort((a, b) => a.width - b.width)
    .map((f) => `${mediaUrl(f.url)} ${f.width}w`);
  if (variants.length && media.width) variants.push(`${mediaUrl(media.url)} ${media.width}w`);
  return {
    src: mediaUrl(media.url),
    alt: media.alternativeText ?? '',
    srcset: variants.length > 1 ? variants.join(', ') : undefined,
  };
}

/**
 * Fetches every published entry of a Strapi collection type (all pages).
 * Throws with an actionable message when Strapi is unreachable or misconfigured.
 */
export async function fetchCollection<T>(pluralName: string, params: Record<string, string> = {}): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const query = new URLSearchParams({
      populate: '*',
      status: 'published',
      'pagination[page]': String(page),
      'pagination[pageSize]': '100',
      ...params,
    });
    const url = `${baseUrl}/api/${pluralName}?${query}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
      });
    } catch (error) {
      throw new Error(
        `Could not reach Strapi at ${baseUrl}. Start the CMS (cd Strapi && npm run develop) or set STRAPI_URL. ${String(error)}`,
      );
    }
    if (!res.ok) {
      const hint =
        res.status === 401 || res.status === 403
          ? ' Grant the Public role find/findOne access or set STRAPI_API_TOKEN to a read-only API token.'
          : '';
      throw new Error(`Strapi request failed (${res.status} ${res.statusText}) for ${url}.${hint}`);
    }
    const json = (await res.json()) as StrapiListResponse<T>;
    items.push(...json.data);
    pageCount = json.meta.pagination.pageCount;
    page += 1;
  } while (page <= pageCount);
  return items;
}
