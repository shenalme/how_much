import { categories, getCategory, type Category } from '../data/categories';
import {
  allTools,
  getToolAt,
  toolPath,
  toolsInCategory,
  type RegisteredTool,
} from '../calculators/registry';
import { BASE_PATH, stripBase } from './base';

export type StaticPageId = 'about' | 'contact' | 'privacy' | 'terms';
export const STATIC_PAGES: StaticPageId[] = ['about', 'contact', 'privacy', 'terms'];

export type Route =
  | { type: 'home'; path: '/' }
  | { type: 'directory'; path: '/calculators' }
  | { type: 'category'; path: string; category: Category }
  | { type: 'tool'; path: string; tool: RegisteredTool; category: Category }
  | { type: 'page'; path: string; page: StaticPageId }
  | { type: 'notFound'; path: string };

/**
 * Normalise a browser pathname to a canonical route path:
 * strips the deploy base, duplicate and trailing slashes and ".html" / "/index.html".
 */
export function normalizePath(pathname: string, base: string = BASE_PATH): string {
  let path = pathname;
  try {
    path = decodeURI(path);
  } catch {
    // Leave malformed escapes as they are.
  }
  path = stripBase(path, base);
  path = path.replace(/\/{2,}/g, '/');
  path = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
}

/** Categories that have at least one tool get a page. */
export function hasTools(category: Category): boolean {
  return toolsInCategory(category.id).length > 0;
}

export function resolveRoute(pathname: string, base: string = BASE_PATH): Route {
  const path = normalizePath(pathname, base);
  if (path === '/') return { type: 'home', path: '/' };
  if (path === '/calculators') return { type: 'directory', path: '/calculators' };

  const segments = path.slice(1).split('/');
  if (segments.length === 1) {
    const [segment = ''] = segments;
    if ((STATIC_PAGES as string[]).includes(segment)) {
      return { type: 'page', path, page: segment as StaticPageId };
    }
    const category = getCategory(segment);
    if (category && hasTools(category)) return { type: 'category', path, category };
  }
  if (segments.length === 2) {
    const [categoryId = '', slug = ''] = segments;
    const tool = getToolAt(categoryId, slug);
    const category = getCategory(categoryId);
    if (tool && category) return { type: 'tool', path, tool, category };
  }
  return { type: 'notFound', path };
}

/** Every indexable path, in sitemap order. */
export function getAllRoutePaths(): string[] {
  return [
    '/',
    '/calculators',
    ...categories.filter(hasTools).map((c) => `/${c.id}`),
    ...allTools.map(toolPath),
    ...STATIC_PAGES.map((p) => `/${p}`),
  ];
}
