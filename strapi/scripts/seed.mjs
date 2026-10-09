/**
 * Seeds the PixelRich demo content (Services and Blog Posts) through the
 * Strapi MCP server: https://docs.strapi.io/cms/features/strapi-mcp-server
 *
 *   1. Start Strapi:            npm run develop
 *   2. Create an Admin token:   Settings > Admin tokens (see README.md for the permissions)
 *   3. Run:                     STRAPI_ADMIN_TOKEN=<token> npm run seed
 *
 * Images are uploaded with the Admin token through the upload endpoint (the MCP
 * server cannot upload files), then every entry is created and published with the
 * MCP content tools. Entries whose slug already exists are skipped, so the script
 * can be run again safely.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMcpClient } from './lib/mcp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Demo images are shared with the Astro theme, which shows them when no Strapi URL is set.
const demoImages = path.resolve(root, '..', 'public', 'images', 'demo');
try {
  process.loadEnvFile(path.join(root, '.env'));
} catch {
  // No .env file: rely on the shell environment.
}

const url = (process.env.STRAPI_URL || `http://localhost:${process.env.PORT || 1337}`).replace(/\/+$/, '');
const token = process.env.STRAPI_ADMIN_TOKEN;
if (!token) {
  console.error('Missing STRAPI_ADMIN_TOKEN. Create an Admin token in Strapi (Settings > Admin tokens) and run:');
  console.error('  STRAPI_ADMIN_TOKEN=<token> npm run seed');
  process.exit(1);
}

const seed = JSON.parse(await readFile(path.join(root, 'data', 'seed.json'), 'utf8'));
const mcp = createMcpClient({ url, token });

const REQUIRED_TOOLS = ['list_service', 'create_service', 'publish_service', 'list_blog-post', 'create_blog-post', 'publish_blog-post', 'media_list_assets'];

/** Returns the id of an uploaded asset, reusing a previous upload with the same file name. */
async function uploadImage({ file, alt }) {
  const existing = await mcp.callTool('media_list_assets', { name: file, pageSize: 100 });
  const match = existing.results.find((asset) => asset.name === file);
  if (match) return match.id;

  const form = new FormData();
  const buffer = await readFile(path.join(demoImages, file));
  form.append('files', new Blob([buffer], { type: 'image/jpeg' }), file);
  form.append('fileInfo', JSON.stringify({ name: file, alternativeText: alt }));
  const res = await fetch(`${url}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload of ${file} failed: ${res.status} ${await res.text()}`);
  const [asset] = await res.json();
  return asset.id;
}

/** Creates and publishes one entry unless an entry with the same slug exists. */
async function seedEntry(type, data) {
  const { results } = await mcp.callTool(`list_${type}`, { filters: { slug: { $eq: data.slug } }, pageSize: 1 });
  if (results.length > 0) {
    console.log(`  = ${type} "${data.slug}" already exists`);
    return;
  }
  const created = await mcp.callTool(`create_${type}`, { data });
  const documentId = created.documentId ?? created.data?.documentId;
  await mcp.callTool(`publish_${type}`, { documentId });
  console.log(`  + ${type} "${data.slug}" created and published`);
}

const server = await mcp.initialize();
console.log(`Connected to ${server.serverInfo.name} at ${url}/mcp`);
const tools = new Set((await mcp.listTools()).map((tool) => tool.name));
const missing = REQUIRED_TOOLS.filter((name) => !tools.has(name));
if (missing.length) {
  console.error(`The Admin token cannot use: ${missing.join(', ')}. Grant the permissions listed in README.md.`);
  process.exit(1);
}

// Entries are created oldest first: the site lists services newest first (createdAt).
console.log('Services');
for (const service of seed.services) {
  const [imageOne, imageTwo, imageThree] = [
    await uploadImage(service.images[0]),
    await uploadImage(service.images[1]),
    await uploadImage(service.images[2]),
  ];
  await seedEntry('service', {
    title: service.title,
    slug: service.slug,
    imageOne,
    imageTwo,
    imageThree,
    content: service.content,
    metaDescription: service.metaDescription,
  });
}

console.log('Blog posts');
for (const post of seed.blogPosts) {
  await seedEntry('blog-post', {
    title: post.title,
    slug: post.slug,
    date: post.date,
    readTime: post.readTime,
    thumbnail: await uploadImage(post.thumbnail),
    content: post.content,
    metaDescription: post.metaDescription,
  });
}

console.log('Done.');
