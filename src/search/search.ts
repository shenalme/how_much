/**
 * Client-side tool search.
 *
 * Scores every tool against the query using its title, aliases, keywords,
 * category and description, with synonyms and prefix matching. When the best
 * match has related tools, they are added after the direct matches so a search
 * for "mulch" also suggests soil and compost.
 */
import { getCategory } from '../data/categories';
import { allTools, getTool, type RegisteredTool } from '../calculators/registry';
import { expandWord } from './synonyms';

/** Words that carry no meaning for finding a tool. */
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'calculate',
  'calculator',
  'calculators',
  'can',
  'do',
  'does',
  'for',
  'how',
  'i',
  'is',
  'it',
  'many',
  'much',
  'my',
  'need',
  'of',
  'on',
  'or',
  'the',
  'to',
  'tool',
  'what',
  'whats',
  'will',
  'with',
  'into',
  'per',
  'you',
  'get',
  'find',
  'work',
  'out',
  'buy',
]);

export interface SearchResult {
  tool: RegisteredTool;
  score: number;
  /** True for suggestions added because they are related to a direct match. */
  related: boolean;
}

interface IndexedTool {
  tool: RegisteredTool;
  titleWords: string[];
  aliasWords: string[];
  keywordWords: string[];
  categoryWords: string[];
  descriptionWords: string[];
  slugWords: string[];
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[²³]/g, '')
    .split(/[^a-z0-9.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t !== '');
}

/** Meaningful query terms: no stopwords, no bare numbers. */
export function queryTerms(query: string): string[] {
  return tokenize(query).filter((t) => !STOPWORDS.has(t) && !/^\d+(\.\d+)?$/.test(t));
}

/** First number in a query ("convert 50 lbs to kg" → 50), used to prefill converters. */
export function extractNumber(query: string): number | null {
  const match = /(-?\d+(?:\.\d+)?)/.exec(query);
  return match ? Number(match[1]) : null;
}

function buildIndex(tools: readonly RegisteredTool[]): IndexedTool[] {
  return tools.map((tool) => {
    const category = getCategory(tool.category);
    return {
      tool,
      titleWords: tokenize(tool.title),
      aliasWords: tokenize((tool.aliases ?? []).join(' ')),
      keywordWords: tokenize(tool.keywords.join(' ')),
      categoryWords: tokenize(
        [category?.name ?? '', tool.category, ...(tool.alsoIn ?? [])].join(' '),
      ),
      descriptionWords: tokenize(tool.description),
      slugWords: tokenize(tool.slug.replace(/-/g, ' ')),
    };
  });
}

let index: IndexedTool[] | null = null;

function matchStrength(words: string[], term: string, variants: string[]): number {
  let best = 0;
  for (const word of words) {
    if (word === term) return 1;
    if (variants.includes(word)) best = Math.max(best, 0.6);
    else if (term.length >= 2 && word.startsWith(term)) best = Math.max(best, 0.75);
    else if (term.length >= 4 && word.includes(term)) best = Math.max(best, 0.4);
  }
  return best;
}

const WEIGHTS = {
  title: 10,
  alias: 8,
  slug: 6,
  keyword: 5,
  category: 3,
  description: 1.5,
};

function scoreTool(entry: IndexedTool, terms: string[]): number {
  let total = 0;
  let matchedTerms = 0;
  for (const term of terms) {
    const variants = expandWord(term);
    const termScore = Math.max(
      matchStrength(entry.titleWords, term, variants) * WEIGHTS.title,
      matchStrength(entry.aliasWords, term, variants) * WEIGHTS.alias,
      matchStrength(entry.slugWords, term, variants) * WEIGHTS.slug,
      matchStrength(entry.keywordWords, term, variants) * WEIGHTS.keyword,
      matchStrength(entry.categoryWords, term, variants) * WEIGHTS.category,
      matchStrength(entry.descriptionWords, term, variants) * WEIGHTS.description,
    );
    if (termScore > 0) matchedTerms += 1;
    total += termScore;
  }
  if (matchedTerms === 0) return 0;
  // Strongly prefer tools that match every term.
  const coverage = matchedTerms / terms.length;
  return total * coverage * coverage + (coverage === 1 ? 5 : 0);
}

/** Direction-aware boost: "lbs to kg" prefers pounds-to-kilograms over kilograms-to-pounds. */
function orderBonus(entry: IndexedTool, terms: string[]): number {
  if (terms.length < 2) return 0;
  const positions = terms.map((term) => {
    const variants = expandWord(term);
    return entry.slugWords.findIndex((w) => w === term || variants.includes(w));
  });
  const found = positions.filter((p) => p >= 0);
  if (found.length < 2) return 0;
  const ascending = found.every((p, i) => i === 0 || p > (found[i - 1] ?? -1));
  return ascending ? 2 : 0;
}

export function searchTools(query: string, limit = 8): SearchResult[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  index ??= buildIndex(allTools);

  const direct = index
    .map((entry) => ({ entry, score: scoreTool(entry, terms) }))
    .filter((r) => r.score > 0)
    .map((r) => ({ ...r, score: r.score + orderBonus(r.entry, terms) }))
    .sort((a, b) => b.score - a.score || a.entry.tool.title.localeCompare(b.entry.tool.title));

  // Drop weak matches (e.g. a word that only appears in a description) once strong ones exist.
  const best = direct[0]?.score ?? 0;
  const relevant = direct.filter((r) => r.score >= best * 0.3);

  const results: SearchResult[] = relevant.map((r) => ({
    tool: r.entry.tool,
    score: r.score,
    related: false,
  }));
  const top = results[0];
  if (top && results.length < limit) {
    const seen = new Set(results.map((r) => r.tool.slug));
    for (const slug of top.tool.related) {
      const tool = getTool(slug);
      if (tool && !seen.has(slug)) {
        results.push({ tool, score: 0, related: true });
        seen.add(slug);
      }
    }
  }
  return results.slice(0, limit);
}
