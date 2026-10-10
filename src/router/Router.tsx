import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { analytics } from '../analytics';
import { withBase } from './base';
import { normalizePath } from './routes';

interface Location {
  /** Canonical route path without the base, e.g. "/garden/mulch-calculator". */
  path: string;
  /** Query string including "?", or "". */
  search: string;
}

interface RouterContextValue extends Location {
  navigate: (to: string, options?: { replace?: boolean }) => void;
  /** Increments on every client-side navigation (0 on first load). */
  navigationCount: number;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function readBrowserLocation(): Location {
  return { path: normalizePath(window.location.pathname), search: window.location.search };
}

function splitUrl(to: string): Location & { hash: string } {
  const hashIndex = to.indexOf('#');
  const hash = hashIndex >= 0 ? to.slice(hashIndex) : '';
  const beforeHash = hashIndex >= 0 ? to.slice(0, hashIndex) : to;
  const queryIndex = beforeHash.indexOf('?');
  const path = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const search = queryIndex >= 0 ? beforeHash.slice(queryIndex) : '';
  return { path: normalizePath(path || '/', '/'), search, hash };
}

interface RouterProviderProps {
  /** Used during prerendering and in tests, e.g. "/garden/mulch-calculator". */
  url?: string;
  children: ReactNode;
}

export function RouterProvider({ url, children }: RouterProviderProps) {
  const [location, setLocation] = useState<Location>(() => {
    if (url !== undefined) {
      const { path, search } = splitUrl(url);
      return { path, search };
    }
    return readBrowserLocation();
  });
  const [navigationCount, setNavigationCount] = useState(0);

  useEffect(() => {
    if (url !== undefined) return undefined;
    // Replace non-canonical variants ("/garden/", "/garden.html") with the clean URL.
    const canonical = withBase(location.path) + window.location.search + window.location.hash;
    if (window.location.pathname !== withBase(location.path)) {
      window.history.replaceState(null, '', canonical);
    }
    const onPopState = () => {
      setLocation(readBrowserLocation());
      setNavigationCount((n) => n + 1);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback((to: string, options: { replace?: boolean } = {}) => {
    const target = splitUrl(to);
    const href = withBase(target.path) + target.search + target.hash;
    if (typeof window !== 'undefined') {
      if (options.replace) window.history.replaceState(null, '', href);
      else window.history.pushState(null, '', href);
      if (!options.replace) {
        if (target.hash) {
          document.getElementById(target.hash.slice(1))?.scrollIntoView();
        } else {
          window.scrollTo(0, 0);
        }
      }
    }
    setLocation({ path: target.path, search: target.search });
    if (!options.replace) setNavigationCount((n) => n + 1);
    analytics.trackPageView(target.path);
  }, []);

  const value = useMemo(
    () => ({ ...location, navigate, navigationCount }),
    [location, navigate, navigationCount],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used inside <RouterProvider>');
  return context;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  children: ReactNode;
};

/** Internal link: a real <a href> (crawlable, works without JS) with client-side navigation. */
export function Link({ to, children, onClick, target, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target !== '_self')
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };
  const { path, search, hash } = splitUrl(to);
  return (
    <a href={withBase(path) + search + hash} onClick={handleClick} target={target} {...rest}>
      {children}
    </a>
  );
}
