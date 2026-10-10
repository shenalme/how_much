import type { CalculatorContent } from '../../calculators/types';

/** Native <details> accordion: keyboard accessible and works without JavaScript. */
export function FAQSection({ faq }: { faq: CalculatorContent['faq'] }) {
  if (faq.length === 0) return null;
  return (
    <section className="content-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently asked questions</h2>
      <div className="faq">
        {faq.map((item) => (
          <details className="faq__item" key={item.question}>
            <summary className="faq__question">{item.question}</summary>
            <div className="faq__answer">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
