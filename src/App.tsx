import { useEffect, useMemo } from 'react';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { AboutPage } from './pages/AboutPage';
import { CategoryPage } from './pages/CategoryPage';
import { ContactPage } from './pages/ContactPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ToolPage } from './pages/ToolPage';
import { resolveRoute, type Route } from './router/routes';
import { useRouter } from './router/Router';
import { applyHead } from './seo/head';
import { buildPageMeta } from './seo/meta';

function PageForRoute({ route }: { route: Route }) {
  switch (route.type) {
    case 'home':
      return <HomePage />;
    case 'directory':
      return <DirectoryPage route={route} />;
    case 'category':
      return <CategoryPage route={route} category={route.category} />;
    case 'tool':
      return (
        <ToolPage key={route.tool.slug} route={route} tool={route.tool} category={route.category} />
      );
    case 'page':
      switch (route.page) {
        case 'about':
          return <AboutPage route={route} />;
        case 'contact':
          return <ContactPage route={route} />;
        case 'privacy':
          return <PrivacyPage route={route} />;
        case 'terms':
          return <TermsPage route={route} />;
      }
      return null;
    case 'notFound':
      return <NotFoundPage />;
  }
}

export function App() {
  const { path, navigationCount } = useRouter();
  const route = useMemo(() => resolveRoute(path, '/'), [path]);

  useEffect(() => {
    applyHead(buildPageMeta(route));
  }, [route]);

  // After client-side navigation, move focus to the new page's heading, as a page load would.
  useEffect(() => {
    if (navigationCount === 0) return;
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [navigationCount, path]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="site-main">
        <PageForRoute route={route} />
      </main>
      <Footer />
    </>
  );
}
