/**
 * Build test: checks the generated static site is complete and SEO-ready.
 * Run after `npm run build`. Exits non-zero on any problem so CI fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const problems = [];
const fail = (message) => problems.push(message);
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

for (const file of [
  'index.html',
  '404.html',
  'sitemap.xml',
  'robots.txt',
  'CNAME',
  'favicon.svg',
  'og-default.png',
]) {
  if (!fs.existsSync(path.join(dist, file))) fail(`Missing dist/${file}`);
}
if (problems.length) finish();

const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length < 40) fail(`Sitemap lists only ${locs.length} URLs`);

const origin = new URL(locs[0]).origin;
if (!read('robots.txt').toLowerCase().includes(`sitemap: ${origin}/sitemap.xml`.toLowerCase())) {
  fail('robots.txt does not reference the sitemap');
}
if (read('CNAME').trim().toLowerCase() !== new URL(origin).host.toLowerCase())
  fail('CNAME does not match the canonical domain');

const titles = new Map();
let toolPages = 0;
for (const loc of locs) {
  const route = new URL(loc).pathname;
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  if (!fs.existsSync(path.join(dist, file))) {
    fail(`${route}: missing ${file}`);
    continue;
  }
  const html = read(file);
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/g) ?? [];
  if (title.length !== 1) fail(`${route}: expected exactly one <title>, found ${title.length}`);
  const titleText = title[0]?.replace(/<[^>]+>/g, '') ?? '';
  if (titles.has(titleText))
    fail(`${route}: duplicate title "${titleText}" (also ${titles.get(titleText)})`);
  titles.set(titleText, route);
  if (!html.includes(`<link rel="canonical" href="${loc}"`))
    fail(`${route}: canonical is not ${loc}`);
  if (!/<meta name="description" content="[^"]{50,}"/.test(html))
    fail(`${route}: missing or short meta description`);
  if (!html.includes('property="og:title"') || !html.includes('name="twitter:card"'))
    fail(`${route}: missing social tags`);
  if (!html.includes(`data-route="${route}"`)) fail(`${route}: not prerendered for this route`);
  if (html.includes('<!--app-html-->')) fail(`${route}: app HTML placeholder was not replaced`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(`${route}: expected exactly one <h1>`);
  if (route.split('/').length === 3) {
    toolPages += 1;
    if (!html.includes('class="result__summary"'))
      fail(`${route}: calculator result was not prerendered`);
    if (!html.includes('rel="modulepreload"')) fail(`${route}: calculator chunk is not preloaded`);
    if (!html.includes('"@type":"BreadcrumbList"'))
      fail(`${route}: missing breadcrumb structured data`);
  }
}

const notFound = read('404.html');
if (!notFound.includes('noindex')) fail('404.html is not marked noindex');
if (!notFound.includes('We couldn')) fail('404.html does not contain the not-found message');

// Bundle budget: the JavaScript every page loads.
const assets = fs.readdirSync(path.join(dist, 'assets'));
const entry = assets.find((f) => /^index-.*\.js$/.test(f));
if (entry) {
  const gz = zlib.gzipSync(fs.readFileSync(path.join(dist, 'assets', entry))).length;
  console.log(`  Main bundle: ${(gz / 1024).toFixed(1)} kB gzipped`);
  if (gz > 130 * 1024) fail(`Main bundle is ${(gz / 1024).toFixed(1)} kB gzipped (budget 130 kB)`);
}

finish();

function finish() {
  if (problems.length) {
    console.error(`✖ Build verification failed:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(
    `✔ Build verified: ${locs.length} pages (${toolPages} tools), sitemap, robots.txt, 404 and CNAME`,
  );
}
