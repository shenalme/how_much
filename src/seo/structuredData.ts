/**
 * Schema.org JSON-LD builders. Each one describes content that is visible on the page.
 */
import { siteConfig } from '../config/site';
import type { Category } from '../data/categories';
import type { CalculatorDefinition, ToolMeta } from '../calculators/types';
import { absoluteUrl } from './urls';

export type JsonLd = Record<string, unknown>;

export function websiteLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: absoluteUrl('/'),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** A free, in-browser calculator is accurately described as a WebApplication. */
export function toolLd(tool: ToolMeta, path: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    url: absoluteUrl(path),
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    inLanguage: siteConfig.language,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function collectionLd(category: Category, path: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.heading,
    description: category.metaDescription,
    url: absoluteUrl(path),
    isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: absoluteUrl('/') },
  };
}

/** Only emitted when siteConfig.structuredData.faqPage is true. */
export function faqLd(calculator: CalculatorDefinition): JsonLd | null {
  if (calculator.content.faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: calculator.content.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
