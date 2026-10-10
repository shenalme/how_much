import { siteConfig } from '../../config/site';
import { Link } from '../../router/Router';

/**
 * Text logo. To use an image instead, replace the <span> with an <img> and keep
 * the accessible name on the link.
 */
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${siteConfig.name} home`}>
      <span className="logo__text">{siteConfig.logo.text}</span>
    </Link>
  );
}
