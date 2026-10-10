import { allTools } from '../calculators/registry';
import { siteConfig } from '../config/site';
import type { Route } from '../router/routes';
import { Link } from '../router/Router';
import { StaticPageLayout } from './StaticPageLayout';

export function AboutPage({ route }: { route: Route }) {
  return (
    <StaticPageLayout route={route} page="about">
      <p>
        {siteConfig.name} is a library of {allTools.length} free calculators, converters and
        estimators for practical questions: how much mulch to order, how many tiles to buy, how much
        hay a horse eats, how many days until a date.
      </p>
      <h2>What we aim for</h2>
      <ul>
        <li>The answer first. The calculator sits at the top of every page, ready to use.</li>
        <li>Clear working. Each tool shows its formula, a worked example and its assumptions.</li>
        <li>
          Honest estimates. Where an answer depends on local conditions or product details, we say
          so.
        </li>
        <li>No friction. No accounts, no email sign-up, nothing to install.</li>
      </ul>
      <h2>How the calculators are built and checked</h2>
      <p>
        Unit conversions use the exact international definitions of each unit. Material estimates
        use standard geometry (area × depth, for example) and widely published coverage or yield
        figures, which are listed on each page so you can replace them with the figure for your
        product.
      </p>
      <p>
        Every calculator has automated tests covering typical values, zero, invalid input, very
        large values, decimals, unit conversions and rounding. The worked examples on each page are
        recalculated from the live calculator, so an example can never show a different answer from
        the tool itself.
      </p>
      <h2>Your data</h2>
      <p>
        Calculations happen in your browser. The numbers you type are not sent to us. See the{' '}
        <Link to="/privacy">privacy policy</Link> for details.
      </p>
      <h2>Found a mistake?</h2>
      <p>
        Accuracy matters more to us than anything else. If a result looks wrong, please{' '}
        <Link to="/contact">tell us</Link> which tool you used and the values you entered.
      </p>
    </StaticPageLayout>
  );
}
