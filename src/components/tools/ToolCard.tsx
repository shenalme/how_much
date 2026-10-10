import { toolPath } from '../../calculators/registry';
import type { ToolMeta } from '../../calculators/types';
import { getCategory } from '../../data/categories';
import { Link } from '../../router/Router';

interface ToolCardProps {
  tool: ToolMeta;
  showCategory?: boolean;
}

export function ToolCard({ tool, showCategory = false }: ToolCardProps) {
  return (
    <Link to={toolPath(tool)} className="tool-card">
      <span className="tool-card__title">{tool.title}</span>
      <span className="tool-card__description">{tool.description}</span>
      {showCategory && (
        <span className="tool-card__category">{getCategory(tool.category)?.name}</span>
      )}
    </Link>
  );
}

interface ToolGridProps {
  tools: readonly ToolMeta[];
  showCategory?: boolean;
  label?: string;
}

export function ToolGrid({ tools, showCategory, label }: ToolGridProps) {
  return (
    <ul className="tool-grid" aria-label={label}>
      {tools.map((tool) => (
        <li key={tool.slug}>
          <ToolCard tool={tool} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}
