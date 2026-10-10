/**
 * Build-time renderer used by scripts/prerender.mjs.
 * This never runs on a server in production: it produces static HTML files.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { loadCalculator } from './calculators/registry';
import { resolveRoute } from './router/routes';
import { RouterProvider } from './router/Router';
import { renderHeadTags } from './seo/head';
import { buildPageMeta } from './seo/meta';
import { todayISO } from './utils/dates';
import { setRenderDate } from './utils/renderDate';

export { getAllRoutePaths } from './router/routes';
export { buildSitemap, buildRobots } from './seo/sitemap';
export { siteConfig, isPlaceholderDomain } from './config/site';

export interface RenderResult {
  html: string;
  head: string;
  routePath: string;
  status: number;
  /** Build date used for "today" defaults, written to #root as data-today. */
  renderDate: string;
  /** Source path of the page's calculator module, used to add a <link rel="modulepreload">. */
  moduleSource: string | null;
}

export async function render(url: string): Promise<RenderResult> {
  const renderDate = todayISO();
  setRenderDate(renderDate);
  const route = resolveRoute(url, '/');
  const calculator = route.type === 'tool' ? await loadCalculator(route.tool.slug) : undefined;
  const html = renderToString(
    <StrictMode>
      <RouterProvider url={url}>
        <App />
      </RouterProvider>
    </StrictMode>,
  );
  return {
    html,
    head: renderHeadTags(buildPageMeta(route, calculator)),
    routePath: route.path,
    renderDate,
    status: route.type === 'notFound' ? 404 : 200,
    moduleSource:
      route.type === 'tool' ? `src/calculators/${route.tool.folder.slice(2)}/calculator.ts` : null,
  };
}
