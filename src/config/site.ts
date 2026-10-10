/**
 * ============================================================================
 *  CENTRAL SITE CONFIGURATION
 * ============================================================================
 *
 *  This is the ONE place to change the brand, domain and site-wide settings.
 *
 *  >>> REPLACE YOURDOMAIN.COM BELOW WITH YOUR REAL DOMAIN <<<
 *
 *  Use the bare host name only, e.g. "example.com" or "www.example.com"
 *  (whichever you choose as your primary domain; see README "Custom domain").
 *  No "https://", no trailing slash.
 *
 *  The same value must be in public/CNAME. The easiest way to change both:
 *
 *      npm run set-domain example.com
 *
 *  The build fails if this value and public/CNAME disagree.
 * ============================================================================
 */
export const DOMAIN = 'YOURDOMAIN.COM';

export const siteConfig = {
  /** Brand name shown in the header, titles and footer. */
  name: 'HOWMUCH',
  /** Short tagline used on the homepage hero and in the footer. */
  tagline: 'Calculators, converters & tools for everyday questions.',
  /** Default meta description for pages that don't define their own. */
  description:
    'Free calculators, unit converters and estimators for garden, home, construction, animals, math, dates and driving. Fast, accurate and easy to use on any device.',
  domain: DOMAIN,
  /** Canonical origin. Always https on GitHub Pages with a custom domain. */
  url: `https://${DOMAIN}`,
  locale: 'en_US',
  language: 'en',
  /**
   * Text logo. The header renders `logo.text`; swap for an image later by
   * editing src/components/layout/Logo.tsx.
   */
  logo: {
    text: 'HOWMUCH',
    /** Used for structured data and social previews (path inside /public). */
    image: '/og-default.png',
  },
  /** Default social share image (1200×630, inside /public). */
  ogImage: '/og-default.png',
  /** Contact address shown on the Contact page. Replace before launch. */
  contactEmail: `hello@${DOMAIN.toLowerCase()}`,
  /** Add profile URLs as you create them; empty entries are not rendered. */
  social: {
    x: '',
    facebook: '',
    github: '',
  },
  /** X/Twitter handle including "@", or empty string. */
  twitterHandle: '',
  /** Year shown in the footer copyright line. */
  copyrightStartYear: 2026,
  analytics: {
    /**
     * 'none' | 'console' | 'gtag'. Nothing is tracked unless this is changed.
     * See src/analytics/index.ts and README "Adding Google Analytics".
     */
    provider: 'none' as 'none' | 'console' | 'gtag',
    /** GA4 measurement ID, e.g. "G-XXXXXXXXXX". Only used when provider is 'gtag'. */
    gaMeasurementId: '',
    /** When true, no events are sent until consent is granted (see src/analytics/consent.ts). */
    requireConsent: true,
  },
  ads: {
    /** Ad slots render nothing while this is false. See README "Adding AdSense". */
    enabled: false,
    /** AdSense publisher ID, e.g. "ca-pub-1234567890123456". */
    adsenseClientId: '',
  },
  structuredData: {
    /**
     * Google limits FAQ rich results to well-known government and health sites,
     * so FAQPage markup is off by default. The visible FAQs are unaffected.
     */
    faqPage: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** True while the placeholder domain is still in place. */
export const isPlaceholderDomain = DOMAIN === 'YOURDOMAIN.COM';
