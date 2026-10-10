import { allTools, toolPath, toolsInCategory } from '../calculators/registry';
import { categories } from '../data/categories';
import { getAllRoutePaths } from '../router/routes';
import { absoluteUrl } from './urls';

function latest(dates: string[]): string | undefined {
  return dates.filter(Boolean).sort().at(-1);
}

/** Last-modified date per path, from tool metadata. Pages without a meaningful date get none. */
function lastModifiedByPath(): Map<string, string> {
  const map = new Map<string, string>();
  const toolDate = (t: (typeof allTools)[number]) => t.updated ?? t.added;
  for (const tool of allTools) map.set(toolPath(tool), toolDate(tool));
  for (const category of categories) {
    const date = latest(toolsInCategory(category.id).map(toolDate));
    if (date) map.set(`/${category.id}`, date);
  }
  const overall = latest(allTools.map(toolDate));
  if (overall) {
    map.set('/', overall);
    map.set('/calculators', overall);
  }
  return map;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** sitemap.xml generated from the route list, so it can never drift from the site. */
export function buildSitemap(): string {
  const dates = lastModifiedByPath();
  const urls = getAllRoutePaths().map((path) => {
    const lastmod = dates.get(path);
    return [
      '  <url>',
      `    <loc>${escapeXml(absoluteUrl(path))}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n');
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
}
