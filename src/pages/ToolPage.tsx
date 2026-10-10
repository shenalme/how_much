import { useEffect, useState } from 'react';
import { analytics } from '../analytics';
import { getLoadedCalculator, loadCalculator } from '../calculators/registry';
import type { CalculatorDefinition } from '../calculators/types';
import { AdSlot } from '../components/ads/AdSlot';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { ExampleSection } from '../components/calculator/ExampleSection';
import { FAQSection } from '../components/calculator/FAQSection';
import { FormulaSection } from '../components/calculator/FormulaSection';
import { HowItWorksSection } from '../components/calculator/HowItWorksSection';
import { ReferenceTables } from '../components/calculator/ReferenceTables';
import { RelatedTools } from '../components/calculator/RelatedTools';
import { Alert } from '../components/ui/Alert';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/ui/PageHeader';
import type { Category } from '../data/categories';
import type { RegisteredTool } from '../calculators/registry';
import { breadcrumbsFor } from '../seo/meta';
import type { Route } from '../router/routes';
import { Link } from '../router/Router';
import { formatDate, parseISODate } from '../utils/dates';

interface ToolPageProps {
  route: Route;
  tool: RegisteredTool;
  category: Category;
}

function useCalculator(slug: string) {
  const [calculator, setCalculator] = useState<CalculatorDefinition | undefined>(() =>
    getLoadedCalculator(slug),
  );
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const cached = getLoadedCalculator(slug);
    if (cached) {
      setCalculator(cached);
      return undefined;
    }
    setCalculator(undefined);
    loadCalculator(slug)
      .then((loaded) => !cancelled && setCalculator(loaded))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return { calculator, failed };
}

export function ToolPage({ route, tool, category }: ToolPageProps) {
  const { calculator, failed } = useCalculator(tool.slug);

  useEffect(() => {
    analytics.trackToolUsed(tool.slug);
  }, [tool.slug]);

  const updated = parseISODate(tool.updated ?? tool.added);

  return (
    <div className="container page tool-page">
      <Breadcrumbs crumbs={breadcrumbsFor(route)} />
      <PageHeader title={tool.title}>
        <p className="page-header__intro">{calculator?.intro ?? tool.description}</p>
      </PageHeader>

      {calculator ? (
        <CalculatorForm key={tool.slug} calculator={calculator} title={tool.title} />
      ) : failed ? (
        <Alert tone="error" title="This calculator didn't load">
          <p>Check your connection and reload the page.</p>
        </Alert>
      ) : (
        <div className="calculator calculator--loading" aria-busy="true">
          <p className="visually-hidden">Loading calculator…</p>
        </div>
      )}

      <div className="tool-page__body">
        <article className="tool-page__content prose">
          {calculator && (
            <>
              <HowItWorksSection content={calculator.content} />
              <FormulaSection formula={calculator.content.formula} />
              <ExampleSection calculator={calculator} />
              <ReferenceTables tables={calculator.content.tables} />
              <AdSlot placement="tool-content" />
              <FAQSection faq={calculator.content.faq} />
            </>
          )}
          {updated && (
            <p className="tool-page__updated">
              Last reviewed <time dateTime={tool.updated ?? tool.added}>{formatDate(updated)}</time>
              . Spotted a problem? <Link to="/contact">Tell us</Link>.
            </p>
          )}
        </article>
        <aside className="tool-page__rail" aria-label="More tools">
          <RelatedTools tool={tool} />
          <p className="tool-page__category-link">
            <Link to={`/${category.id}`}>All {category.name.toLowerCase()} tools</Link>
          </p>
          <AdSlot placement="tool-rail" />
        </aside>
      </div>
    </div>
  );
}
