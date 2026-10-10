import { relatedTools, toolPath } from '../../calculators/registry';
import type { ToolMeta } from '../../calculators/types';
import { getCategory } from '../../data/categories';
import { Link } from '../../router/Router';

export function RelatedTools({ tool }: { tool: ToolMeta }) {
  const related = relatedTools(tool);
  if (related.length === 0) return null;
  return (
    <section className="related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="related__heading">
        Related tools
      </h2>
      <ul className="related__list">
        {related.map((item) => (
          <li key={item.slug}>
            <Link to={toolPath(item)} className="related__link">
              <span className="related__title">{item.title}</span>
              <span className="related__meta">{getCategory(item.category)?.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
