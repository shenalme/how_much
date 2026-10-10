import { describe, expect, it } from 'vitest';
import { allTools, toolPath } from '../calculators/registry';
import { siteConfig } from '../config/site';
import { renderHeadTags, serializeJsonLd } from '../seo/head';
import { buildPageMeta } from '../seo/meta';
import { buildRobots, buildSitemap } from '../seo/sitemap';
import { getAllRoutePaths, resolveRoute } from '../router/routes';

describe('SEO metadata', () => {
  const metas = getAllRoutePaths().map((path) => ({
    path,
    meta: buildPageMeta(resolveRoute(path)),
  }));

  it('gives every page a unique title and description', () => {
    const titles = metas.map((m) => m.meta.title);
    const descriptions = metas.map((m) => m.meta.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('builds canonical URLs from the configured domain', () => {
    for (const { path, meta } of metas) {
      expect(meta.canonical).toBe(`${siteConfig.url}${path}`);
    }
  });

  it('describes tools as free web applications with breadcrumbs', () => {
    const meta = buildPageMeta(resolveRoute('/garden/mulch-calculator'));
    const types = meta.jsonLd.map((ld) => ld['@type']);
    expect(types).toEqual(['WebApplication', 'BreadcrumbList']);
    const crumbs = meta.jsonLd[1] as { itemListElement: { name: string; item: string }[] };
    expect(crumbs.itemListElement.map((c) => c.name)).toEqual([
      'Home',
      'Garden',
      'Mulch Calculator',
    ]);
  });

  it('does not add FAQPage markup unless enabled', () => {
    for (const { meta } of metas) {
      expect(meta.jsonLd.some((ld) => ld['@type'] === 'FAQPage')).toBe(
        siteConfig.structuredData.faqPage,
      );
    }
  });

  it('marks the 404 page noindex with no canonical', () => {
    const meta = buildPageMeta(resolveRoute('/does-not-exist'));
    expect(meta.robots).toBe('noindex,follow');
    expect(meta.canonical).toBeNull();
  });

  it('renders escaped head tags', () => {
    const html = renderHeadTags({
      title: 'A & B <test>',
      description: 'Quote "here"',
      canonical: 'https://example.com/x',
      robots: 'index,follow',
      ogType: 'website',
      jsonLd: [{ name: '</script><script>alert(1)</script>' }],
    });
    expect(html).toContain('<title data-hm>A &amp; B &lt;test&gt;</title>');
    expect(html).toContain('content="Quote &quot;here&quot;"');
    expect(html).not.toContain('</script><script>');
    expect(html).toContain('<link rel="canonical" href="https://example.com/x" data-hm>');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(serializeJsonLd({ a: '<b>' })).toBe('{"a":"\\u003cb\\u003e"}');
  });
});

describe('sitemap and robots', () => {
  const sitemap = buildSitemap();

  it('lists every tool automatically', () => {
    for (const tool of allTools) {
      expect(sitemap).toContain(`<loc>${siteConfig.url}${toolPath(tool)}</loc>`);
    }
    expect(sitemap.match(/<url>/g)?.length).toBe(getAllRoutePaths().length);
    expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it('points robots.txt at the sitemap', () => {
    expect(buildRobots()).toContain(`Sitemap: ${siteConfig.url}/sitemap.xml`);
  });
});
