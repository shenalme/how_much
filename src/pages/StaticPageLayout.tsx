import type { ReactNode } from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/ui/PageHeader';
import { breadcrumbsFor, STATIC_PAGE_META } from '../seo/meta';
import type { Route, StaticPageId } from '../router/routes';

export function StaticPageLayout({
  route,
  page,
  children,
}: {
  route: Route;
  page: StaticPageId;
  children: ReactNode;
}) {
  return (
    <div className="container page">
      <Breadcrumbs crumbs={breadcrumbsFor(route)} />
      <PageHeader title={STATIC_PAGE_META[page].heading} />
      <div className="prose static-page">{children}</div>
    </div>
  );
}

/** Banner on placeholder legal text. Remove once the page has been reviewed. */
export function DraftNotice() {
  return (
    <div className="alert alert--warning" role="note">
      <p className="alert__title">Draft for review</p>
      <div className="alert__body">
        <p>
          This page is a starting template, not legal advice. Have it reviewed and completed for
          your jurisdiction before launch, and update it whenever you add analytics, advertising or
          other third-party services.
        </p>
      </div>
    </div>
  );
}
