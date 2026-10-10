/**
 * Static site generation.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (renderer). For every
 * route it renders the React app to HTML at build time and writes a real file,
 * so each URL works on GitHub Pages with full content and <head> metadata,
 * even before JavaScript loads:
 *
 *   /                          → dist/index.html
 *   /garden                    → dist/garden.html  (+ dist/garden/index.html)
 *   /garden/mulch-calculator   → dist/garden/mulch-calculator.html
 *   unknown URLs               → dist/404.html (served by GitHub Pages with status 404)
 *
 * It also writes sitemap.xml and robots.txt from the same route list.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(path.join(dist, 'index.html')))
  fail('dist/index.html not found. Run `vite build` first.');
const entry = path.join(ssrDir, 'entry-server.js');
if (!fs.existsSync(entry))
  fail('dist-ssr/entry-server.js not found. Run `npm run build:ssr` first.');

const { render, getAllRoutePaths, buildSitemap, buildRobots, siteConfig, isPlaceholderDomain } =
  await import(pathToFileURL(entry).href);

// --- Domain consistency check ------------------------------------------------
const cnamePath = path.join(root, 'public', 'CNAME');
const cname = fs.existsSync(cnamePath) ? fs.readFileSync(cnamePath, 'utf8').trim() : '';
if (cname.toLowerCase() !== String(siteConfig.domain).toLowerCase()) {
  fail(
    `public/CNAME ("${cname}") does not match DOMAIN in src/config/site.ts ("${siteConfig.domain}").\n` +
      '  Run: npm run set-domain your-domain.com',
  );
}

// --- Template ------------------------------------------------------------------
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const HEAD_PATTERN = /<!--head:start-->[\s\S]*<!--head:end-->/;
const ROOT_PATTERN = '<div id="root"><!--app-html--></div>';
if (!HEAD_PATTERN.test(template) || !template.includes(ROOT_PATTERN)) {
  fail('index.html is missing the <!--head:start-->/<!--head:end--> or <!--app-html--> markers.');
}

// Vite manifest: maps source files to built chunks, so each tool page can preload its calculator.
const manifestPath = path.join(dist, '.vite', 'manifest.json');
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');

function preloadTags(source) {
  if (!source || !manifest[source]) return '';
  const files = new Set();
  const visit = (key) => {
    const chunk = manifest[key];
    if (!chunk || files.has(chunk.file)) return;
    files.add(chunk.file);
    (chunk.imports ?? []).forEach(visit);
  };
  visit(source);
  return [...files]
    .map((file) => `<link rel="modulepreload" crossorigin href="${base}${file}">`)
    .join('\n    ');
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function toDocument(result) {
  return template
    .replace(HEAD_PATTERN, () =>
      [result.head, preloadTags(result.moduleSource)].filter(Boolean).join('\n    '),
    )
    .replace(
      ROOT_PATTERN,
      () =>
        `<div id="root" data-route="${escapeAttr(result.routePath)}" data-today="${escapeAttr(result.renderDate)}">${result.html}</div>`,
    );
}

function outputFile(routePath) {
  if (routePath === '/') return path.join(dist, 'index.html');
  return path.join(dist, `${routePath.slice(1)}.html`);
}

function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

// --- Render every route ----------------------------------------------------------
const routes = getAllRoutePaths();
const rendered = new Map();
for (const routePath of routes) {
  const result = await render(routePath);
  if (result.status !== 200) fail(`Route ${routePath} rendered with status ${result.status}.`);
  const html = toDocument(result);
  rendered.set(routePath, html);
  write(outputFile(routePath), html);
}

// Single-segment pages that share a name with a folder (/garden and /garden/…) also get
// <folder>/index.html, so "/garden/" resolves on hosts that prefer directory indexes.
for (const routePath of routes) {
  const segments = routePath.split('/').filter(Boolean);
  if (segments.length !== 1) continue;
  const folder = path.join(dist, segments[0]);
  if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
    write(path.join(folder, 'index.html'), rendered.get(routePath));
  }
}

const notFound = await render('/404-not-found');
if (notFound.status !== 404) fail('The not-found route did not render as a 404.');
write(path.join(dist, '404.html'), toDocument(notFound));

// --- Sitemap, robots, CNAME -----------------------------------------------------
write(path.join(dist, 'sitemap.xml'), buildSitemap());
write(path.join(dist, 'robots.txt'), buildRobots());
write(path.join(dist, 'CNAME'), `${cname}\n`);
write(path.join(dist, '.nojekyll'), '');

fs.rmSync(ssrDir, { recursive: true, force: true });
fs.rmSync(path.join(dist, '.vite'), { recursive: true, force: true });

console.log(`✔ Prerendered ${routes.length} pages + 404.html, sitemap.xml and robots.txt`);
if (isPlaceholderDomain) {
  console.warn(
    '⚠ The domain is still the placeholder YOURDOMAIN.COM. Canonical URLs and the sitemap\n' +
      '  point to it until you run: npm run set-domain your-domain.com',
  );
}
