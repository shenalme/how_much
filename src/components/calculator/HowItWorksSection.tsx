import type { CalculatorContent } from '../../calculators/types';

export function HowItWorksSection({ content }: { content: CalculatorContent }) {
  return (
    <>
      <section className="content-section" aria-labelledby="how-heading">
        <h2 id="how-heading">How the calculation works</h2>
        {content.howItWorks.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      {content.assumptions && content.assumptions.length > 0 && (
        <section className="content-section" aria-labelledby="assumptions-heading">
          <h2 id="assumptions-heading">Assumptions and limits</h2>
          <ul className="assumptions">
            {content.assumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
