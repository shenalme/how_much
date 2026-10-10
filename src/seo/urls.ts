import { siteConfig } from '../config/site';

/** Absolute canonical URL for a route path, always on the configured domain. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
