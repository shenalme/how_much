import { siteConfig } from '../config/site';
import type { Route } from '../router/routes';
import { StaticPageLayout } from './StaticPageLayout';

export function ContactPage({ route }: { route: Route }) {
  return (
    <StaticPageLayout route={route} page="contact">
      <p>We read every message. The most helpful reports include:</p>
      <ul>
        <li>the name or address of the tool you were using,</li>
        <li>the values and units you entered,</li>
        <li>the result you got, and what you expected instead.</li>
      </ul>
      <h2>Email</h2>
      <p>
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
      <p className="muted">
        Suggestions for new calculators are welcome too. We can't give professional engineering,
        veterinary, legal or financial advice about individual situations.
      </p>
    </StaticPageLayout>
  );
}
