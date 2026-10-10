import { toolsInCategory } from '../../calculators/registry';
import type { Category } from '../../data/categories';
import { Link } from '../../router/Router';
import { plural } from '../../utils/format';
import { Icon } from '../ui/Icon';

export function CategoryCard({ category }: { category: Category }) {
  const count = toolsInCategory(category.id).length;
  return (
    <Link to={`/${category.id}`} className="category-card">
      <span className="category-card__icon">
        <Icon name={category.icon} size={22} />
      </span>
      <span className="category-card__body">
        <span className="category-card__name">{category.name}</span>
        <span className="category-card__summary">{category.summary}</span>
        <span className="category-card__count">
          {count} {plural(count, 'tool')}
        </span>
      </span>
    </Link>
  );
}

export function CategoryGrid({ categories }: { categories: readonly Category[] }) {
  return (
    <ul className="category-grid">
      {categories.map((category) => (
        <li key={category.id}>
          <CategoryCard category={category} />
        </li>
      ))}
    </ul>
  );
}
