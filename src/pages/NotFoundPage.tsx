import { popularTools } from '../calculators/registry';
import { SearchBox } from '../components/search/SearchBox';
import { CategoryGrid } from '../components/tools/CategoryCard';
import { ToolGrid } from '../components/tools/ToolCard';
import { PageHeader } from '../components/ui/PageHeader';
import { categories } from '../data/categories';
import { hasTools } from '../router/routes';

export function NotFoundPage() {
  return (
    <div className="container page not-found">
      <PageHeader title="We couldn't find that tool.">
        <p className="page-header__intro">
          The address may be mistyped, or the page may have moved. Search for what you need, or pick
          from the tools and categories below.
        </p>
      </PageHeader>
      <div className="not-found__search">
        <SearchBox id="notfound-search" variant="hero" label="Search all tools" />
      </div>
      <section className="home-section" aria-labelledby="nf-popular">
        <h2 id="nf-popular">Popular tools</h2>
        <ToolGrid tools={popularTools(6)} showCategory />
      </section>
      <section className="home-section" aria-labelledby="nf-categories">
        <h2 id="nf-categories">Browse categories</h2>
        <CategoryGrid categories={categories.filter(hasTools)} />
      </section>
    </div>
  );
}
