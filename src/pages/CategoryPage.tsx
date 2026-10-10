import { toolsInCategory } from '../calculators/registry';
import { AdSlot } from '../components/ads/AdSlot';
import { CategoryGrid } from '../components/tools/CategoryCard';
import { ToolGrid } from '../components/tools/ToolCard';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/ui/PageHeader';
import { getCategory, type Category } from '../data/categories';
import { breadcrumbsFor } from '../seo/meta';
import { hasTools, type Route } from '../router/routes';

export function CategoryPage({ route, category }: { route: Route; category: Category }) {
  const tools = toolsInCategory(category.id);
  const related = category.related
    .map((id) => getCategory(id))
    .filter((c): c is Category => c !== undefined && hasTools(c));

  return (
    <div className="container page">
      <Breadcrumbs crumbs={breadcrumbsFor(route)} />
      <PageHeader title={category.heading}>
        <div className="page-header__intro prose">
          {category.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </PageHeader>

      <section className="home-section" aria-labelledby="category-tools">
        <h2 id="category-tools">
          {tools.length} {category.name.toLowerCase()} {tools.length === 1 ? 'tool' : 'tools'}
        </h2>
        <ToolGrid tools={tools} />
      </section>

      {category.tips && category.tips.length > 0 && (
        <section className="home-section" aria-labelledby="category-tips">
          <h2 id="category-tips">Good to know</h2>
          <div className="tips">
            {category.tips.map((tip) => (
              <div className="tip" key={tip.title}>
                <h3 className="tip__title">{tip.title}</h3>
                <p>{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <AdSlot placement="category" />

      {related.length > 0 && (
        <section className="home-section" aria-labelledby="category-related">
          <h2 id="category-related">Related categories</h2>
          <CategoryGrid categories={related} />
        </section>
      )}
    </div>
  );
}
