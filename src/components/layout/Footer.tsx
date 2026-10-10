import { popularTools, toolPath } from '../../calculators/registry';
import { siteConfig } from '../../config/site';
import { categories } from '../../data/categories';
import { hasTools } from '../../router/routes';
import { Link } from '../../router/Router';

export function Footer() {
  const year = new Date().getFullYear();
  const start = siteConfig.copyrightStartYear;
  const years = year > start ? `${start}–${year}` : String(start);
  const socials = Object.entries(siteConfig.social).filter(([, url]) => url);

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <p className="site-footer__logo">{siteConfig.name}</p>
          <p>{siteConfig.tagline}</p>
          <p className="site-footer__small">
            Free to use. No sign-up. Calculations run in your browser.
          </p>
        </div>
        <nav aria-label="Categories" className="site-footer__col">
          <h2 className="site-footer__heading">Categories</h2>
          <ul>
            {categories.filter(hasTools).map((category) => (
              <li key={category.id}>
                <Link to={`/${category.id}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Popular tools" className="site-footer__col site-footer__col--single">
          <h2 className="site-footer__heading">Popular</h2>
          <ul>
            {popularTools(6).map((tool) => (
              <li key={tool.slug}>
                <Link to={toolPath(tool)}>{tool.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Site" className="site-footer__col">
          <h2 className="site-footer__heading">Site</h2>
          <ul>
            <li>
              <Link to="/calculators">All tools</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy</Link>
            </li>
            <li>
              <Link to="/terms">Terms</Link>
            </li>
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} rel="me noopener">
                  {name === 'x' ? 'X' : name.charAt(0).toUpperCase() + name.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container site-footer__legal">
        <p suppressHydrationWarning>
          © {years} {siteConfig.name}. Results are estimates; check important figures with a
          qualified professional.
        </p>
      </div>
    </footer>
  );
}
