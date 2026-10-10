import { evaluate, exampleState } from '../../calculators/engine';
import type { CalculatorDefinition, Field } from '../../calculators/types';
import { formatDate, parseISODate } from '../../utils/dates';
import { getUnit } from '../../utils/units';

function describeValue(field: Field, value: string, unit: string | undefined): string {
  switch (field.kind) {
    case 'unit':
      return `${value} ${getUnit(unit ?? field.defaultUnit).symbol}`;
    case 'number':
      return [field.prefix, value, field.suffix]
        .filter(Boolean)
        .join(field.suffix === '%' ? '' : ' ');
    case 'select':
      return field.options.find((o) => o.value === value)?.label ?? value;
    case 'date': {
      const date = parseISODate(value);
      return date ? formatDate(date) : value;
    }
    case 'text':
      return `${value.split('\n').filter(Boolean).length} lines`;
    default:
      return value;
  }
}

/**
 * Worked examples. The result shown is computed live from the calculator, so the
 * page can never display an example answer the calculator would not produce.
 */
export function ExampleSection({ calculator }: { calculator: CalculatorDefinition }) {
  const { examples } = calculator.content;
  if (examples.length === 0) return null;
  return (
    <section className="content-section" aria-labelledby="example-heading">
      <h2 id="example-heading">{examples.length > 1 ? 'Examples' : 'Example'}</h2>
      {examples.map((example) => {
        const state = exampleState(calculator, example);
        const { result } = evaluate(calculator, state);
        const shownFields = calculator.fields.filter((f) => f.id in example.values);
        return (
          <div className="example" key={example.title}>
            <h3 className="example__title">{example.title}</h3>
            {shownFields.length > 0 && (
              <dl className="example__inputs">
                {shownFields.map((field) => (
                  <div key={field.id}>
                    <dt>{field.label}</dt>
                    <dd>
                      {describeValue(field, state.values[field.id] ?? '', state.units[field.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <ol className="example__steps">
              {example.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {result && <p className="example__result">{result.summary}</p>}
          </div>
        );
      })}
    </section>
  );
}
