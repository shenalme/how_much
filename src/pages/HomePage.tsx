import { popularTools, allTools } from '../calculators/registry';
import { CategoryGrid } from '../components/tools/CategoryCard';
import { ToolGrid } from '../components/tools/ToolCard';
import { SearchBox } from '../components/search/SearchBox';
import { siteConfig } from '../config/site';
import { categories } from '../data/categories';
import { hasTools } from '../router/routes';
import { Link } from '../router/Router';

const EXAMPLES = [
  'How much mulch do I need?',
  'Convert 50 lbs to kg',
  'How much concrete do I need?',
];

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero__title" tabIndex={-1}>
            <span className="hero__brand">{siteConfig.name}</span>
            <span className="hero__tagline">{siteConfig.tagline}</span>
          </h1>
          <SearchBox
            id="hero-search"
            variant="hero"
            label="What do you need to calculate?"
            placeholder="Mulch, paint, kg to lbs…"
            examples={EXAMPLES}
          />
        </div>
      </section>

      <div className="container">
        <section className="home-section" aria-labelledby="popular-heading">
          <div className="section-heading">
            <h2 id="popular-heading">Popular tools</h2>
            <Link to="/calculators" className="section-heading__link">
              All {allTools.length} tools
            </Link>
          </div>
          <ToolGrid tools={popularTools(8)} showCategory />
        </section>

        <section className="home-section" aria-labelledby="categories-heading">
          <div className="section-heading">
            <h2 id="categories-heading">Browse by category</h2>
          </div>
          <CategoryGrid categories={categories.filter(hasTools)} />
        </section>

        <section className="home-section home-about" aria-labelledby="about-heading">
          <h2 id="about-heading">Need help figuring something out?</h2>
          <div className="home-about__body">
            <p>
              {siteConfig.name} answers the practical “how much?” questions that come up around the
              house, in the garden, at the barn and on the road. Type in your measurements and get a
              clear answer, with the formula and assumptions shown so you can see exactly how it was
              worked out.
            </p>
            <p>
              Every tool runs in your browser. There is nothing to install, no account to create,
              and the numbers you enter are not sent anywhere.
            </p>
            <p>
              <Link to="/about">How our calculators are built and checked</Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
