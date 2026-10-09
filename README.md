# PixelRich – Digital Marketing Agency Astro Theme

PixelRich is a bold digital marketing agency theme for Astro, with scroll animations, a sticky feature showcase, an animated testimonial cube and smooth scrolling. Services and blog posts are managed in [Strapi](https://strapi.io) (see [`strapi/`](strapi/)).

**Live demo:** https://pixelrich-astro-theme.vercel.app

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FStrockise%2FPixelRich-Astro-Theme)

## Pages

| Route | Content |
| --- | --- |
| `/` | Hero, video reel, features, stats, services (4 newest from Strapi), FAQ, testimonials |
| `/about/` | About hero, what we do, team, why choose us |
| `/service/` | All services (Strapi) |
| `/service/[slug]/` | Service details (Strapi) |
| `/blog/` | All blog posts (Strapi) |
| `/blog/[slug]/` | Article and two related posts (Strapi) |
| `/contact/` | Contact form and social links |
| `/style-guide/`, `/404` | Utility pages |

## Getting started

Requires Node.js 22.12 or later.

```bash
npm install
npm run dev             # http://localhost:4321
npm run build           # static site in dist/
npm run preview
npm run check           # type check
```

The theme works straight away with its demo content. To manage services and blog posts in Strapi, start the CMS (see [`strapi/README.md`](strapi/README.md)), then:

```bash
cp .env.example .env    # set STRAPI_URL, e.g. http://localhost:1337
```

| Variable | Description |
| --- | --- |
| `STRAPI_URL` | Strapi base URL. When unset, the site uses the bundled demo content (`strapi/data/seed.json`, images in `public/images/demo/`) |
| `STRAPI_API_TOKEN` | Optional read-only API token, only needed when the Strapi Public role can't read the content |
| `SITE_URL` | Optional public URL for canonical links and the sitemap (defaults to the Vercel domain, then `site.base_url`) |

Content is fetched at build time with a Content Layer loader (`src/content.config.ts`). With `STRAPI_URL` set, the build fails with a clear message when Strapi is unreachable. Rebuild the site after publishing content, for example from a Strapi webhook calling your host's deploy hook.

## Project structure

```text
public/
  images/, videos/        Template assets (images/demo/: demo service and blog images)
  js/                     Webflow runtime (navbar, dropdowns, tabs, interactions), jQuery, GSAP
src/
  config/
    config.json           Site name, logos, SEO defaults, contact form endpoint, footer credits
    menu.json             Header, dropdown, section and footer navigation
    social.json           Contact page social links
  content.config.ts       Collections (services, blogPosts) from Strapi or the demo content
strapi/                   Strapi 5 CMS (content types, MCP server, seed script)
  layouts/
    Base.astro            HTML shell, fonts, scripts, smooth scroll
    partials/             Header, Footer, SeoMeta
    components/           SectionNav, SponsorLogos, ServiceList, BlogList
  lib/
    strapi.ts             Strapi REST client and media helpers
    content.ts            Sorting, URLs, date format
    ix.ts                 Initial states of animated elements
  pages/                  One file per route
  styles/                 Template stylesheets
```

## Customisation

- **Site settings and SEO:** `src/config/config.json`. Set `site.base_url` (or `SITE_URL`) to your domain for canonical URLs and the sitemap.
- **Navigation:** `src/config/menu.json`. `cms:service` and `cms:blog` link to a sample detail page (`cms_samples`, otherwise the newest entry).
- **Contact form:** set `contact_form.action` to a form endpoint (Formspree, Basin, Getform, your API). The form posts with `Accept: application/json` and shows the template's success or error message. Without an endpoint, the success message is shown without sending anything.
- **Styles:** `src/styles/pixelrich-astro-theme.webflow.css` holds the theme styles, with colours and fonts as CSS variables at the top.

### Animations

Scroll and hover animations run on the Webflow interaction engine in `public/js/webflow.js`. Animated elements carry a `data-w-id` attribute and an initial inline style, and each page keeps its `wfPage` ID in `Base`. Keep these attributes when you edit markup, or the animation of that element stops (an element that starts hidden would stay hidden).

## Credits

- Images and video: [Freepik](https://www.freepik.com/legal/terms-of-use), [Pexels](https://www.pexels.com/terms-of-service/) and [Unsplash](https://unsplash.com/terms), free for commercial use.
- Fonts: [Anton and Geist](https://fonts.google.com/knowledge/glossary/licensing) from Google Fonts.
- Icons: [Hugeicons](https://hugeicons.com/license-agreement).

All names, email addresses and links in the demo content are examples. Replace them in `src/config/` and in Strapi.
