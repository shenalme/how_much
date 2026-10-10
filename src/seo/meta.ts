import { siteConfig } from '../config/site';
import type { CalculatorDefinition } from '../calculators/types';
import type { Route, StaticPageId } from '../router/routes';
import {
  breadcrumbLd,
  collectionLd,
  faqLd,
  toolLd,
  websiteLd,
  type Crumb,
  type JsonLd,
} from './structuredData';
import { absoluteUrl } from './urls';

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL, or null for pages that should not be indexed. */
  canonical: string | null;
  robots: string;
  ogType: 'website';
  jsonLd: JsonLd[];
}

const brand = siteConfig.name;

export const STATIC_PAGE_META: Record<
  StaticPageId,
  { title: string; heading: string; description: string }
> = {
  about: {
    title: `About ${brand}`,
    heading: `About ${brand}`,
    description: `What ${brand} is, how our calculators are built and checked, and how to report a problem with a result.`,
  },
  contact: {
    title: `Contact ${brand}`,
    heading: 'Contact us',
    description: `Report a calculation problem, suggest a new tool or get in touch with the ${brand} team.`,
  },
  privacy: {
    title: `Privacy policy | ${brand}`,
    heading: 'Privacy policy',
    description: `How ${brand} handles information. Calculations run in your browser and the numbers you enter are not sent to us.`,
  },
  terms: {
    title: `Terms of use | ${brand}`,
    heading: 'Terms of use',
    description: `The terms that apply when you use the ${brand} calculators, converters and tools.`,
  },
};

export function breadcrumbsFor(route: Route): Crumb[] {
  const home: Crumb = { name: 'Home', path: '/' };
  switch (route.type) {
    case 'directory':
      return [home, { name: 'All tools', path: '/calculators' }];
    case 'category':
      return [home, { name: route.category.name, path: route.path }];
    case 'tool':
      return [
        home,
        { name: route.category.name, path: `/${route.category.id}` },
        { name: route.tool.title, path: route.path },
      ];
    case 'page':
      return [home, { name: STATIC_PAGE_META[route.page].heading, path: route.path }];
    default:
      return [home];
  }
}

/** Build the <head> metadata for a route. Pass the calculator on tool pages to enable optional FAQ markup. */
export function buildPageMeta(route: Route, calculator?: CalculatorDefinition): PageMeta {
  const base = { robots: 'index,follow', ogType: 'website' as const };
  switch (route.type) {
    case 'home':
      return {
        ...base,
        title: `${brand}: ${siteConfig.tagline.replace(/\.$/, '')}`,
        description: siteConfig.description,
        canonical: absoluteUrl('/'),
        jsonLd: [websiteLd()],
      };
    case 'directory':
      return {
        ...base,
        title: `All calculators and tools | ${brand}`,
        description: `Browse every ${brand} calculator and converter by category: garden, home, construction, animals, math, dates, driving, cooking and more.`,
        canonical: absoluteUrl(route.path),
        jsonLd: [breadcrumbLd(breadcrumbsFor(route))],
      };
    case 'category':
      return {
        ...base,
        title: `${route.category.heading} | ${brand}`,
        description: route.category.metaDescription,
        canonical: absoluteUrl(route.path),
        jsonLd: [collectionLd(route.category, route.path), breadcrumbLd(breadcrumbsFor(route))],
      };
    case 'tool': {
      const jsonLd = [toolLd(route.tool, route.path), breadcrumbLd(breadcrumbsFor(route))];
      if (siteConfig.structuredData.faqPage && calculator) {
        const faq = faqLd(calculator);
        if (faq) jsonLd.push(faq);
      }
      return {
        ...base,
        title: `${route.tool.seoTitle ?? route.tool.title} | ${brand}`,
        description: route.tool.description,
        canonical: absoluteUrl(route.path),
        jsonLd,
      };
    }
    case 'page': {
      const page = STATIC_PAGE_META[route.page];
      return {
        ...base,
        title: page.title,
        description: page.description,
        canonical: absoluteUrl(route.path),
        jsonLd: [breadcrumbLd(breadcrumbsFor(route))],
      };
    }
    case 'notFound':
      return {
        ...base,
        robots: 'noindex,follow',
        title: `Page not found | ${brand}`,
        description: `We couldn't find that page. Search ${brand} or browse calculators by category.`,
        canonical: null,
        jsonLd: [],
      };
  }
}
