import type { CalculatorContent } from '../../calculators/types';

export function FormulaSection({ formula }: { formula: CalculatorContent['formula'] }) {
  if (formula.length === 0) return null;
  return (
    <section className="content-section" aria-labelledby="formula-heading">
      <h2 id="formula-heading">Formula</h2>
      <div className="formula">
        {formula.map((line, index) => (
          <div className="formula__line" key={index}>
            {line.label && <p className="formula__label">{line.label}</p>}
            <p className="formula__expression">{line.expression}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
