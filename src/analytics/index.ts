/**
 * Analytics abstraction.
 *
 * Components call `analytics.trackToolUsed(id)` etc. and never talk to a vendor
 * directly. By default the provider is "none": every call is a no-op and nothing
 * leaves the browser. To enable Google Analytics 4, set
 * siteConfig.analytics.provider = 'gtag' and gaMeasurementId in src/config/site.ts
 * (see README "Adding Google Analytics").
 */
import { siteConfig } from '../config/site';
import { getConsent, onConsentChange } from './consent';

export type EventParams = Record<string, string | number | boolean>;

export interface AnalyticsProvider {
  pageView(path: string): void;
  event(name: string, params: EventParams): void;
}

const noopProvider: AnalyticsProvider = {
  pageView() {},
  event() {},
};

const consoleProvider: AnalyticsProvider = {
  pageView(path) {
    console.info('[analytics] page_view', path);
  },
  event(name, params) {
    console.info('[analytics]', name, params);
  },
};

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function createGtagProvider(measurementId: string): AnalyticsProvider {
  let loaded = false;
  const load = () => {
    if (loaded || typeof document === 'undefined') return;
    loaded = true;
    const w = window as GtagWindow;
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag() {
      // gtag.js expects the arguments object itself.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer?.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', measurementId, { send_page_view: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  };
  return {
    pageView(path) {
      load();
      (window as GtagWindow).gtag?.('event', 'page_view', { page_path: path });
    },
    event(name, params) {
      load();
      (window as GtagWindow).gtag?.('event', name, params);
    },
  };
}

function configuredProvider(): AnalyticsProvider {
  const { provider, gaMeasurementId } = siteConfig.analytics;
  if (provider === 'console') return consoleProvider;
  if (provider === 'gtag' && gaMeasurementId) return createGtagProvider(gaMeasurementId);
  return noopProvider;
}

let activeProvider: AnalyticsProvider | null = null;

function provider(): AnalyticsProvider {
  activeProvider ??= configuredProvider();
  return activeProvider;
}

function allowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (siteConfig.analytics.provider === 'none') return false;
  return !siteConfig.analytics.requireConsent || getConsent() === 'granted';
}

function send(name: string, params: EventParams): void {
  if (allowed()) provider().event(name, params);
}

if (typeof window !== 'undefined') {
  onConsentChange((state) => {
    if (state === 'granted') provider().pageView(window.location.pathname);
  });
}

export const analytics = {
  /** Replace the provider, e.g. in tests or to plug in another vendor. */
  setProvider(next: AnalyticsProvider): void {
    activeProvider = next;
  },
  trackPageView(path: string): void {
    if (allowed()) provider().pageView(path);
  },
  trackToolUsed(toolId: string): void {
    send('tool_used', { tool_id: toolId });
  },
  trackCalculationCompleted(toolId: string): void {
    send('calculation_completed', { tool_id: toolId });
  },
  trackSearch(query: string, resultCount: number): void {
    const trimmed = query.trim().slice(0, 100);
    if (trimmed) send('search', { search_term: trimmed, result_count: resultCount });
  },
  trackCopyResult(toolId: string): void {
    send('copy_result', { tool_id: toolId });
  },
};
