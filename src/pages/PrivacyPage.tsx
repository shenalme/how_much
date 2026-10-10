import { siteConfig } from '../config/site';
import type { Route } from '../router/routes';
import { DraftNotice, StaticPageLayout } from './StaticPageLayout';

export function PrivacyPage({ route }: { route: Route }) {
  return (
    <StaticPageLayout route={route} page="privacy">
      <DraftNotice />
      <p>
        This policy describes how {siteConfig.name} handles information when you use this website.
      </p>
      <h2>Calculations stay in your browser</h2>
      <p>
        All calculators run on your device. The values you enter are processed by your browser and
        are not sent to or stored by {siteConfig.name}.
      </p>
      <h2>No accounts, no tracking</h2>
      <p>
        The site does not offer accounts, does not ask for your name or email address, and does not
        currently use analytics, advertising or tracking cookies.
      </p>
      <h2>Hosting</h2>
      <p>
        The site is hosted on GitHub Pages. Like most web hosts, GitHub may record technical
        information such as IP addresses when pages are requested, for security and operational
        purposes. See GitHub's privacy statement for how GitHub handles that information.
      </p>
      <h2>If you contact us</h2>
      <p>
        If you email us, we receive your email address and the contents of your message and use them
        only to reply.
      </p>
      <h2>Changes to this policy</h2>
      <p>
        If we add analytics or advertising in the future, this page will be updated before those
        services are enabled, and where required we will ask for your consent first.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about privacy:{' '}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </StaticPageLayout>
  );
}
