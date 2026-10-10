/**
 * Renders PageMeta into <head> tags.
 *
 * `renderHeadTags` produces HTML for the prerendered files (what search engines
 * and social previews read). `applyHead` keeps the live document in sync during
 * client-side navigation. Both emit the same tags, marked with data-hm.
 */
import { siteConfig } from '../config/site';
import type { PageMeta } from './meta';
import { absoluteUrl } from './urls';

interface TagSpec {
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  content?: string;
}

function tagsFor(meta: PageMeta): TagSpec[] {
  const image = absoluteUrl(siteConfig.ogImage);
  const tags: TagSpec[] = [
    { tag: 'title', attrs: {}, content: meta.title },
    { tag: 'meta', attrs: { name: 'description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'robots', content: meta.robots } },
  ];
  if (meta.canonical) {
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: meta.canonical } });
    tags.push({ tag: 'meta', attrs: { property: 'og:url', content: meta.canonical } });
  }
  tags.push(
    { tag: 'meta', attrs: { property: 'og:type', content: meta.ogType } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: siteConfig.name } },
    { tag: 'meta', attrs: { property: 'og:title', content: meta.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: meta.description } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { property: 'og:locale', content: siteConfig.locale } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: meta.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  );
  if (siteConfig.twitterHandle) {
    tags.push({ tag: 'meta', attrs: { name: 'twitter:site', content: siteConfig.twitterHandle } });
  }
  for (const data of meta.jsonLd) {
    tags.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      content: serializeJsonLd(data),
    });
  }
  return tags;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON safe to embed in a <script> element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function renderHeadTags(meta: PageMeta): string {
  return tagsFor(meta)
    .map(({ tag, attrs, content }) => {
      const attrText = Object.entries({ ...attrs, 'data-hm': '' })
        .map(([key, value]) => (value === '' ? key : `${key}="${escapeHtml(value)}"`))
        .join(' ');
      if (tag === 'meta' || tag === 'link') return `<${tag} ${attrText}>`;
      const body = tag === 'script' ? (content ?? '') : escapeHtml(content ?? '');
      return `<${tag} ${attrText}>${body}</${tag}>`;
    })
    .join('\n    ');
}

export function applyHead(meta: PageMeta): void {
  if (typeof document === 'undefined') return;
  document.title = meta.title;
  document.head.querySelectorAll('[data-hm]').forEach((node) => {
    if (node.tagName !== 'TITLE') node.remove();
  });
  const fragment = document.createDocumentFragment();
  for (const { tag, attrs, content } of tagsFor(meta)) {
    if (tag === 'title') continue;
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    element.setAttribute('data-hm', '');
    if (content !== undefined) element.textContent = content;
    fragment.appendChild(element);
  }
  document.head.appendChild(fragment);
}
