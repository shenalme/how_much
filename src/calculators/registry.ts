/**
 * Tool registry.
 *
 * Each tool lives in src/calculators/<category>/<slug>/ with two files:
 *   meta.ts        small metadata, bundled eagerly (search, navigation, SEO)
 *   calculator.ts  fields, formulas and content, loaded only when the page opens
 *
 * Dropping a new folder in is enough to register a tool; nothing here needs editing.
 */
import type { CategoryId } from '../data/categories';
import type { CalculatorDefinition, ToolMeta } from './types';

const metaModules = import.meta.glob<{ meta: ToolMeta }>('./*/*/meta.ts', { eager: true });
const calculatorLoaders = import.meta.glob<{ calculator: CalculatorDefinition }>(
  './*/*/calculator.ts',
);

export interface RegisteredTool extends ToolMeta {
  /** Folder path, e.g. "./garden/mulch-calculator". */
  folder: string;
}

function folderOf(path: string): string {
  return path.slice(0, path.lastIndexOf('/'));
}

const tools: RegisteredTool[] = Object.entries(metaModules)
  .map(([path, mod]) => ({ ...mod.meta, folder: folderOf(path) }))
  .sort((a, b) => a.title.localeCompare(b.title));

const bySlug = new Map(tools.map((t) => [t.slug, t]));

export const allTools: readonly RegisteredTool[] = tools;

export function getTool(slug: string): RegisteredTool | undefined {
  return bySlug.get(slug);
}

/** The tool at /<category>/<slug>, only if that is its primary URL. */
export function getToolAt(category: string, slug: string): RegisteredTool | undefined {
  const tool = bySlug.get(slug);
  return tool && tool.category === category ? tool : undefined;
}

export function toolPath(tool: Pick<ToolMeta, 'category' | 'slug'>): string {
  return `/${tool.category}/${tool.slug}`;
}

/** Tools whose primary category is `category`, followed by tools cross-listed there. */
export function toolsInCategory(category: CategoryId): RegisteredTool[] {
  const primary = tools.filter((t) => t.category === category);
  const crossListed = tools.filter((t) => t.category !== category && t.alsoIn?.includes(category));
  return [...primary, ...crossListed];
}

export function popularTools(limit = 8): RegisteredTool[] {
  return tools
    .filter((t) => t.popularity !== undefined)
    .sort((a, b) => (a.popularity ?? 0) - (b.popularity ?? 0))
    .slice(0, limit);
}

export function recentTools(limit = 6): RegisteredTool[] {
  return [...tools]
    .sort((a, b) => b.added.localeCompare(a.added) || (a.popularity ?? 999) - (b.popularity ?? 999))
    .slice(0, limit);
}

export function relatedTools(tool: ToolMeta, limit = 6): RegisteredTool[] {
  const listed = tool.related
    .map((slug) => bySlug.get(slug))
    .filter((t): t is RegisteredTool => t !== undefined);
  if (listed.length >= limit) return listed.slice(0, limit);
  // Top up with other tools from the same category.
  const seen = new Set([tool.slug, ...listed.map((t) => t.slug)]);
  const fill = tools.filter((t) => t.category === tool.category && !seen.has(t.slug));
  return [...listed, ...fill].slice(0, limit);
}

/* ---------------------------------------------------------------------------
 * Lazy calculator loading
 * ------------------------------------------------------------------------- */
const loaded = new Map<string, CalculatorDefinition>();

export function getLoadedCalculator(slug: string): CalculatorDefinition | undefined {
  return loaded.get(slug);
}

export async function loadCalculator(slug: string): Promise<CalculatorDefinition> {
  const cached = loaded.get(slug);
  if (cached) return cached;
  const tool = bySlug.get(slug);
  if (!tool) throw new Error(`Unknown tool "${slug}"`);
  const loader = calculatorLoaders[`${tool.folder}/calculator.ts`];
  if (!loader) throw new Error(`Missing calculator.ts for "${slug}"`);
  const { calculator } = await loader();
  loaded.set(slug, calculator);
  return calculator;
}

/** Load every calculator (used by tests and the prerender step). */
export async function loadAllCalculators(): Promise<CalculatorDefinition[]> {
  return Promise.all(tools.map((t) => loadCalculator(t.slug)));
}
