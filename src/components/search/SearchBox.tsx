import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { analytics } from '../../analytics';
import { toolPath } from '../../calculators/registry';
import { getCategory } from '../../data/categories';
import { withBase } from '../../router/base';
import { useRouter } from '../../router/Router';
import { extractNumber, searchTools, type SearchResult } from '../../search/search';
import { Icon } from '../ui/Icon';

interface SearchBoxProps {
  /** Prefix for element ids; must be unique on the page. */
  id: string;
  variant?: 'header' | 'hero' | 'dialog';
  label?: string;
  placeholder?: string;
  /** Focus the input when it mounts (used in the mobile search dialog). */
  focusOnMount?: boolean;
  /** Example queries shown as buttons under the input. */
  examples?: string[];
  /** Called after navigating to a result (e.g. to close a dialog). */
  onNavigate?: () => void;
}

/** Link target for a result; converters are prefilled with a number from the query. */
export function resultHref(result: SearchResult, query: string): string {
  const path = toolPath(result.tool);
  if (result.tool.category === 'converters' && !result.related) {
    const value = extractNumber(query);
    if (value !== null) return `${path}?value=${value}`;
  }
  return path;
}

/**
 * Accessible combobox (WAI-ARIA 1.2 pattern) that searches every tool.
 * Arrow keys move through results, Enter opens one, Escape closes the list.
 * Without JavaScript the form still submits to /calculators?q=…
 */
export function SearchBox({
  id,
  variant = 'header',
  label = 'Search calculators',
  placeholder = 'What do you need to calculate?',
  focusOnMount = false,
  examples,
  onNavigate,
}: SearchBoxProps) {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = `${id}-results`;
  const inputId = `${id}-input`;

  const results = useMemo(() => searchTools(query, 8), [query]);
  const showList = open && query.trim().length > 0;

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return undefined;
    const timer = window.setTimeout(() => analytics.trackSearch(trimmed, results.length), 1200);
    return () => window.clearTimeout(timer);
  }, [query, results.length]);

  const go = (href: string) => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery('');
    navigate(href);
    onNavigate?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const active = results[activeIndex];
    if (active) {
      go(resultHref(active, query));
      return;
    }
    const trimmed = query.trim();
    const top = results[0];
    if (top && results.filter((r) => !r.related).length === 1) {
      go(resultHref(top, query));
    } else if (trimmed) {
      go(`/calculators?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (results.length === 0 ? -1 : (i + 1) % results.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (results.length === 0 ? -1 : i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === 'Escape') {
      if (showList) {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      } else if (query) {
        event.preventDefault();
        setQuery('');
      }
    }
  };

  const activeId = showList && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  return (
    <div
      ref={containerRef}
      className={`search search--${variant}`}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form role="search" action={withBase('/calculators')} method="get" onSubmit={handleSubmit}>
        <label
          htmlFor={inputId}
          className={variant === 'hero' ? 'search__label' : 'visually-hidden'}
        >
          {label}
        </label>
        <div className="search__field">
          <Icon name="search" size={variant === 'hero' ? 22 : 18} className="search__icon" />
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            className="search__input"
            type="search"
            role="combobox"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={activeId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {variant === 'hero' && (
            <button type="submit" className="button button--primary search__submit">
              Search
            </button>
          )}
        </div>
      </form>

      <p className="visually-hidden" aria-live="polite">
        {showList
          ? results.length === 0
            ? 'No matching tools.'
            : `${results.length} ${results.length === 1 ? 'tool' : 'tools'} found. Use the up and down arrows to choose.`
          : ''}
      </p>

      <ul
        id={listId}
        role="listbox"
        aria-label="Search results"
        className="search__results"
        hidden={!showList}
      >
        {showList &&
          results.map((result, index) => (
            // Keyboard users operate options from the input (arrow keys + Enter) via
            // aria-activedescendant, per the WAI-ARIA combobox pattern.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={result.tool.slug}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`search__option${index === activeIndex ? ' is-active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => go(resultHref(result, query))}
            >
              <span className="search__option-title">{result.tool.title}</span>
              <span className="search__option-meta">
                {result.related
                  ? `Related, ${getCategory(result.tool.category)?.name ?? ''}`
                  : getCategory(result.tool.category)?.name}
              </span>
              <span className="search__option-description">{result.tool.description}</span>
            </li>
          ))}
        {showList && results.length === 0 && (
          <li className="search__empty" role="option" aria-selected={false} aria-disabled="true">
            No tools match “{query.trim()}”. Try a simpler word such as “mulch” or “kg”.
          </li>
        )}
      </ul>

      {examples && examples.length > 0 && (
        <div className="search__examples">
          <span className="search__examples-label">Try:</span>
          <ul>
            {examples.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => {
                    setQuery(example);
                    setOpen(true);
                    setActiveIndex(-1);
                    inputRef.current?.focus();
                  }}
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
