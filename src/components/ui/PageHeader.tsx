import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

/**
 * Page H1 block. The heading is focusable (tabIndex -1) so the app can move
 * focus to it after client-side navigation, as a full page load would.
 */
export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <h1 tabIndex={-1} className="page-header__title">
        {title}
      </h1>
      {children}
    </header>
  );
}
