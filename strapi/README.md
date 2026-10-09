# PixelRich CMS (Strapi 5)

Content backend for the PixelRich Astro theme. It holds the theme's two CMS collections:

| Collection | Used by | Fields |
| --- | --- | --- |
| **Service** (`api::service.service`) | Home (4 newest), Service page (all), `/service/[slug]/` | `title`, `slug`, `imageOne`, `imageTwo`, `imageThree`, `content` (rich text), `metaDescription` |
| **Blog Post** (`api::blog-post.blog-post`) | Blog page, `/blog/[slug]/`, "Related Blog" (2 newest other posts) | `title`, `slug`, `date`, `readTime`, `thumbnail`, `content` (rich text), `metaDescription` |

Services are listed newest first (by creation date). Blog posts are sorted by `date`, newest first. `imageOne` is also the hero image of the service page.

## Getting started

```bash
cp .env.example .env   # then replace every "tobemodified" secret
npm install
npm run develop        # http://localhost:1337/admin
```

On startup the Public role gets read-only access (`find`, `findOne`) to both collections, so the Astro site can build without a token. Set `PUBLIC_READ_ACCESS=false` to turn this off and give the theme a read-only API token instead (`STRAPI_API_TOKEN` in the Astro `.env`).

## Strapi MCP server

The [Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server) is enabled in `config/server.ts` (`MCP_ENABLED=false` turns it off). It's served at `POST /mcp` and authenticated with an **Admin token**.

1. In the admin panel, open **Settings > Admin tokens** and create a token with these permissions:
   - Content Manager, **Service** and **Blog Post**: Create, Read, Update, Delete, Publish
   - Media Library: Access the Media Library, Create (upload), Update
2. Connect an MCP client, for example Claude Code:

   ```bash
   claude mcp add strapi-mcp --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

The client can then list, create, update, publish and unpublish services and blog posts, and manage the Media Library.

## Demo content

`data/seed.json` and the images in `../public/images/demo/` contain the theme's demo services and blog posts (the Astro site also shows them when no `STRAPI_URL` is set). Load them with the Admin token from above, while Strapi is running:

```bash
STRAPI_ADMIN_TOKEN=<token> npm run seed
```

On Windows PowerShell, use `$env:STRAPI_ADMIN_TOKEN="<token>"; npm run seed`.

The script uploads the images through the upload endpoint (the MCP server cannot upload files), then creates and publishes every entry with the MCP tools (`create_service`, `publish_service`, ...). Entries whose slug already exists are skipped, so it is safe to run again. Set `STRAPI_URL` if Strapi doesn't run on `http://localhost:${PORT}`.

## Rebuilding the site on content changes

The Astro theme is static: it reads Strapi at build time. To publish content changes automatically, add a webhook (**Settings > Webhooks**) on `entry.publish`, `entry.unpublish`, `entry.update` and `entry.delete` that calls your host's build hook (Netlify, Vercel, Cloudflare Pages, ...).

## Deployment

Any Node host that supports Strapi works, as does [Strapi Cloud](https://cloud.strapi.io). For production, use PostgreSQL or MySQL (`DATABASE_CLIENT` and related variables in `.env.example`) and an upload provider such as S3 or Cloudinary if the server's disk is not persistent. The Astro theme handles absolute media URLs from cloud providers.
