import { useEffect, useRef, useState } from 'react';
import { categories } from '../../data/categories';
import { hasTools } from '../../router/routes';
import { Link, useRouter } from '../../router/Router';
import { SearchBox } from '../search/SearchBox';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';

const navCategories = categories.filter(hasTools);

function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { path } = useRouter();

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className="nav__link nav__button"
        aria-expanded={open}
        aria-controls="categories-menu"
        onClick={() => setOpen((v) => !v)}
      >
        Categories
        <Icon name="chevronDown" size={16} />
      </button>
      <div id="categories-menu" className="menu__panel" hidden={!open}>
        <ul className="menu__list">
          {navCategories.map((category) => (
            <li key={category.id}>
              <Link to={`/${category.id}`} className="menu__item">
                <Icon name={category.icon} size={18} />
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type Panel = 'none' | 'menu' | 'search';

function MobilePanel({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panel === 'none') return undefined;
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('no-scroll');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    if (panel === 'menu') dialogRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [panel, onClose]);

  if (panel === 'none') return null;
  return (
    <div
      ref={dialogRef}
      className="mobile-panel"
      role="dialog"
      aria-modal="true"
      aria-label={panel === 'search' ? 'Search' : 'Menu'}
    >
      <div className="mobile-panel__bar">
        <span className="mobile-panel__title">{panel === 'search' ? 'Search' : 'Menu'}</span>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      {panel === 'search' ? (
        <SearchBox id="mobile-search" variant="dialog" focusOnMount onNavigate={onClose} />
      ) : (
        <nav aria-label="Mobile">
          <ul className="mobile-panel__list">
            <li>
              <Link to="/calculators" className="mobile-panel__link" onClick={onClose}>
                All tools
              </Link>
            </li>
            {navCategories.map((category) => (
              <li key={category.id}>
                <Link to={`/${category.id}`} className="mobile-panel__link" onClick={onClose}>
                  <Icon name={category.icon} size={18} />
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/about" className="mobile-panel__link" onClick={onClose}>
                About
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export function Header() {
  const [panel, setPanel] = useState<Panel>('none');
  const { path } = useRouter();
  useEffect(() => setPanel('none'), [path]);
  const close = () => setPanel('none');

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Logo />
        <nav className="nav" aria-label="Main">
          <CategoriesMenu />
          <Link
            to="/calculators"
            className="nav__link"
            aria-current={path === '/calculators' ? 'page' : undefined}
          >
            All tools
          </Link>
        </nav>
        <div className="site-header__search">
          <SearchBox id="header-search" placeholder="Search tools" />
        </div>
        <div className="site-header__mobile">
          <button
            type="button"
            className="icon-button"
            aria-label="Search"
            onClick={() => setPanel('search')}
          >
            <Icon name="search" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Menu"
            aria-expanded={panel === 'menu'}
            onClick={() => setPanel('menu')}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <MobilePanel panel={panel} onClose={close} />
    </header>
  );
}
