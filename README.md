# PixelRich – Digital Marketing Agency Astro Theme

PixelRich is a bold digital marketing agency theme for Astro, with scroll animations, a sticky feature showcase, an animated testimonial cube and smooth scrolling. Services and blog posts are managed in [Strapi](https://strapi.io) (see [`strapi/`](strapi/)).

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

Requires Node.js 22.12 or later and a running Strapi instance with content (see [`strapi/README.md`](strapi/README.md)).

```bash
cp .env.example .env    # set STRAPI_URL
npm install
npm run dev             # http://localhost:4321
npm run build           # static site in dist/
npm run preview
npm run check           # type check
```

| Variable | Description |
| --- | --- |
| `STRAPI_URL` | Strapi base URL, default `http://localhost:1337` |
| `STRAPI_API_TOKEN` | Optional read-only API token, only needed when the Strapi Public role can't read the content |

Content is fetched at build time with a Content Layer loader (`src/content.config.ts`). The build fails with a clear message when Strapi is unreachable. Rebuild the site, for example from a Strapi webhook, after publishing content.

## Project structure

```text
public/
  images/, videos/        Template assets
  js/                     Webflow runtime (navbar, dropdowns, tabs, interactions), jQuery, GSAP
src/
  config/
    config.json           Site name, logos, SEO defaults, contact form endpoint, footer credits
    menu.json             Header, dropdown, section and footer navigation
    social.json           Contact page social links
  content.config.ts       Strapi collections (services, blogPosts)
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

- **Site settings and SEO:** `src/config/config.json`. Set `site.base_url` to your domain for canonical URLs and the sitemap.
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
