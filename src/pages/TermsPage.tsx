import { siteConfig } from '../config/site';
import type { Route } from '../router/routes';
import { DraftNotice, StaticPageLayout } from './StaticPageLayout';

export function TermsPage({ route }: { route: Route }) {
  return (
    <StaticPageLayout route={route} page="terms">
      <DraftNotice />
      <p>By using {siteConfig.name} you agree to these terms.</p>
      <h2>Estimates, not professional advice</h2>
      <p>
        The calculators provide general estimates based on the values you enter and the assumptions
        described on each page. They are not a substitute for advice from a qualified professional
        such as an engineer, builder, veterinarian, accountant or financial adviser. Check important
        figures before you buy materials, sign contracts or make decisions that depend on them.
      </p>
      <h2>Accuracy</h2>
      <p>
        We work hard to keep every tool accurate and we test our formulas, but we cannot guarantee
        that every result is free of errors or suitable for your specific situation. Product
        coverage, local regulations and real-world conditions vary.
      </p>
      <h2>Use of the site</h2>
      <p>
        You may use the tools for personal and commercial purposes. Please do not attempt to disrupt
        the site or copy it wholesale.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. The current version is always available on this page.</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </StaticPageLayout>
  );
}
