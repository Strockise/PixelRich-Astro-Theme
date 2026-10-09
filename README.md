# PixelRich – Digital Marketing Agency Astro Theme

PixelRich is a bold digital marketing agency theme for Astro, with scroll animations, a sticky feature showcase, an animated testimonial cube and smooth scrolling. Services and blog posts can be managed in [Strapi](https://strapi.io) (included in [`strapi/`](strapi/)), and the theme also works out of the box with its demo content.

**Live demo:** https://pixelrich-astro-theme.vercel.app

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FStrockise%2FPixelRich-Astro-Theme)

## Features

- Astro 7, static output, no UI framework
- 7 pages plus service and blog detail pages
- Scroll and hover animations, background video, smooth scrolling (Lenis)
- Fully responsive (desktop, tablet, mobile)
- Services and blog posts from Strapi 5, or from the bundled demo content
- SEO meta tags, Open Graph, canonical URLs and sitemap

## Pages

| Route | Content |
| --- | --- |
| `/` | Hero, video reel, features, stats, services (4 newest), FAQ, testimonials |
| `/about/` | About hero, what we do, team, why choose us |
| `/service/` | All services |
| `/service/[slug]/` | Service details |
| `/blog/` | All blog posts |
| `/blog/[slug]/` | Article and two related posts |
| `/contact/` | Contact form and social links |
| `/style-guide/` | Colours, typography and icons |
| `/404` | Not found page |

## Getting started

Requires Node.js 22.12 or later.

Create a new project from this theme:

```bash
npm create astro@latest -- --template Strockise/PixelRich-Astro-Theme
```

Or clone the repository:

```bash
git clone https://github.com/Strockise/PixelRich-Astro-Theme.git my-site
cd my-site
npm install
```

Then:

| Command | Action |
| --- | --- |
| `npm run dev` | Start the dev server at `http://localhost:4321` |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Preview the build locally |
| `npm run check` | Type check the project |

## Content (Strapi or demo content)

Services and blog posts are loaded at build time by a Content Layer loader (`src/content.config.ts`):

- **Without `STRAPI_URL`**, the site uses the bundled demo content: `strapi/data/seed.json`, with images in `public/images/demo/`.
- **With `STRAPI_URL`**, everything comes from your Strapi CMS. Set it up with the guide in [`strapi/README.md`](strapi/README.md), then:

  ```bash
  cp .env.example .env    # then set STRAPI_URL, e.g. http://localhost:1337
  ```

| Variable | Description |
| --- | --- |
| `STRAPI_URL` | Strapi base URL. Leave it unset to use the demo content |
| `STRAPI_API_TOKEN` | Optional read-only API token, only needed when the Strapi Public role can't read the content |
| `SITE_URL` | Optional public URL for canonical links and the sitemap (defaults to the Vercel domain, then `site.base_url`) |

The site is static, so rebuild it after publishing content in Strapi, for example with a Strapi webhook that calls your host's deploy hook.

## Project structure

```text
├── public/
│   ├── images/             Theme images (images/demo/: demo service and blog images)
│   ├── videos/             Background video
│   └── js/                 Webflow interaction runtime, jQuery, GSAP
├── src/
│   ├── config/
│   │   ├── config.json     Site name, logos, SEO defaults, contact form endpoint, footer
│   │   ├── menu.json       Header, dropdown, section and footer navigation
│   │   └── social.json     Contact page social links
│   ├── layouts/
│   │   ├── Base.astro      HTML shell, fonts, scripts, smooth scroll
│   │   ├── partials/       Header, Footer, SeoMeta
│   │   └── components/     SectionNav, SponsorLogos, ServiceList, BlogList
│   ├── lib/
│   │   ├── strapi.ts       Strapi REST client and media helpers
│   │   ├── content.ts      Sorting, URLs, date format
│   │   └── ix.ts           Initial states of animated elements
│   ├── pages/              One file per route
│   ├── styles/             Theme stylesheets
│   └── content.config.ts   Services and blog posts (Strapi or demo content)
├── strapi/                 Strapi 5 CMS (content types, MCP server, seed script)
└── astro.config.mjs
```

## Customisation

- **Site settings and SEO:** `src/config/config.json`. Set `site.base_url` (or `SITE_URL`) to your domain for canonical URLs and the sitemap.
- **Navigation:** `src/config/menu.json`. `cms:service` and `cms:blog` link to a sample detail page (`cms_samples`, otherwise the newest entry).
- **Contact form:** set `contact_form.action` in `config.json` to a form endpoint (Formspree, Basin, Getform, your API). The form shows the theme's success or error message. Without an endpoint, the success message is shown without sending anything.
- **Styles:** `src/styles/pixelrich-astro-theme.webflow.css` holds the theme styles, with colours and fonts as CSS variables at the top.

### Animations

Scroll and hover animations run on the interaction engine in `public/js/webflow.js`. Animated elements carry a `data-w-id` attribute and an initial inline style, and each page passes its `wfPage` ID to `Base`. Keep these attributes when you edit markup, or that element's animation stops (and an element that starts hidden would stay hidden).

## Credits

- Images and video: [Freepik](https://www.freepik.com/legal/terms-of-use), [Pexels](https://www.pexels.com/terms-of-service/) and [Unsplash](https://unsplash.com/terms), free for commercial use.
- Fonts: [Anton and Geist](https://fonts.google.com/knowledge/glossary/licensing) from Google Fonts.
- Icons: [Hugeicons](https://hugeicons.com/license-agreement).

All names, email addresses and links in the demo content are examples. Replace them in `src/config/` and in Strapi.

## License

[MIT](LICENSE)
