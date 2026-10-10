/** The deploy base path from Vite ("/" with a custom domain, "/PROJECTNAME/" otherwise). */
export const BASE_PATH: string = import.meta.env.BASE_URL || '/';

/** "/garden" → "/PROJECTNAME/garden" when deployed under a sub-path. */
export function withBase(path: string): string {
  if (BASE_PATH === '/') return path;
  return `${BASE_PATH.replace(/\/$/, '')}${path === '/' ? '/' : path}`;
}

/** Remove the base path from a browser pathname. */
export function stripBase(pathname: string, base: string = BASE_PATH): string {
  if (base === '/' || !base) return pathname;
  const trimmed = base.replace(/\/$/, '');
  if (pathname === trimmed) return '/';
  return pathname.startsWith(`${trimmed}/`) ? pathname.slice(trimmed.length) : pathname;
}
