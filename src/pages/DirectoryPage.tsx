import { useEffect, useMemo, useState } from 'react';
import { allTools, popularTools, recentTools } from '../calculators/registry';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Icon } from '../components/ui/Icon';
import { PageHeader } from '../components/ui/PageHeader';
import { ToolGrid } from '../components/tools/ToolCard';
import { categories } from '../data/categories';
import { breadcrumbsFor } from '../seo/meta';
import { hasTools, type Route } from '../router/routes';
import { Link, useRouter } from '../router/Router';
import { searchTools } from '../search/search';

export function DirectoryPage({ route }: { route: Route }) {
  const { search, navigate } = useRouter();
  const [query, setQuery] = useState('');

  // Read ?q= after hydration (the prerendered page has no query).
  useEffect(() => {
    setQuery(new URLSearchParams(search).get('q') ?? '');
  }, [search]);

  const results = useMemo(() => (query.trim() ? searchTools(query, 50) : []), [query]);
  const listed = categories.filter(hasTools);

  const updateQuery = (value: string) => {
    setQuery(value);
    const trimmed = value.trim();
    navigate(trimmed ? `/calculators?q=${encodeURIComponent(trimmed)}` : '/calculators', {
      replace: true,
    });
  };

  return (
    <div className="container page">
      <Breadcrumbs crumbs={breadcrumbsFor(route)} />
      <PageHeader title="All calculators and tools">
        <p className="page-header__intro">
          {allTools.length} free calculators and converters, grouped by category. Filter the list or
          jump to a category.
        </p>
      </PageHeader>

      <div className="directory-filter">
        <label htmlFor="directory-q" className="field__label">
          Filter tools
        </label>
        <div className="search__field">
          <Icon name="search" size={18} className="search__icon" />
          <input
            id="directory-q"
            className="search__input"
            type="search"
            autoComplete="off"
            placeholder="For example: fence, kg, days"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
        </div>
      </div>

      {query.trim() ? (
        <section className="home-section" aria-labelledby="results-heading">
          <h2 id="results-heading" aria-live="polite">
            {results.length === 0
              ? `No tools match “${query.trim()}”`
              : `${results.length} ${results.length === 1 ? 'tool matches' : 'tools match'} “${query.trim()}”`}
          </h2>
          {results.length > 0 ? (
            <ToolGrid tools={results.map((r) => r.tool)} showCategory />
          ) : (
            <p>
              Try a single word such as “mulch”, “horse” or “kg”, or browse the categories below.
            </p>
          )}
        </section>
      ) : (
        <>
          <nav aria-label="Jump to category" className="chip-row">
            {listed.map((category) => (
              <a key={category.id} href={`#cat-${category.id}`} className="chip">
                {category.name}
              </a>
            ))}
          </nav>
          <section className="home-section" aria-labelledby="dir-popular">
            <h2 id="dir-popular">Popular tools</h2>
            <ToolGrid tools={popularTools(6)} showCategory />
          </section>
          <section className="home-section" aria-labelledby="dir-recent">
            <h2 id="dir-recent">Recently added</h2>
            <ToolGrid tools={recentTools(6)} showCategory />
          </section>
        </>
      )}

      <section className="home-section" aria-labelledby="dir-all">
        <h2 id="dir-all">Every tool by category</h2>
        {listed.map((category) => {
          const tools = allTools.filter((t) => t.category === category.id);
          if (tools.length === 0) return null;
          return (
            <div key={category.id} id={`cat-${category.id}`} className="directory-group">
              <h3 className="directory-group__title">
                <Link to={`/${category.id}`}>{category.name}</Link>
              </h3>
              <ToolGrid tools={tools} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
