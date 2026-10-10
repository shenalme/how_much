/**
 * Factory for one-way unit converter pages (feet → meters, °F → °C …).
 * All conversion maths comes from utils/units.ts; this only adds the page shape.
 */
import type { CalculatorContent, CalculatorDefinition, ContentTable, ResultDetail } from '../types';
import { DEFAULT_MAX } from '../engine';
import { formatSignificant } from '../../utils/format';
import { convert, getUnit } from '../../utils/units';

export interface ConverterOptions {
  slug: string;
  from: string;
  to: string;
  intro: string;
  /** Default input value. */
  defaultValue?: string;
  howItWorks: string[];
  /** Formula lines; defaults to the forward and reverse factor formulas. */
  formula?: CalculatorContent['formula'];
  /** Values listed in the reference table. */
  tableValues?: number[];
  /** Extra result lines, e.g. feet and inches. Receives the input in `from` units. */
  extraDetails?: (value: number) => ResultDetail[];
  faq: CalculatorContent['faq'];
  examples: CalculatorContent['examples'];
  /** Allow negative input (temperatures). */
  allowNegative?: boolean;
  significantDigits?: number;
}

const DEFAULT_TABLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 25, 50, 100];

function unitName(unitId: string, value: number): string {
  const unit = getUnit(unitId);
  return Math.abs(value) === 1 ? unit.singular : unit.plural;
}

export function referenceTable(
  from: string,
  to: string,
  values: number[],
  significant = 6,
): ContentTable {
  const fromUnit = getUnit(from);
  const toUnit = getUnit(to);
  return {
    caption: `${fromUnit.plural.replace(/^./, (c) => c.toUpperCase())} to ${toUnit.plural}`,
    columns: [`${fromUnit.plural} (${fromUnit.symbol})`, `${toUnit.plural} (${toUnit.symbol})`],
    rows: values.map((v) => [
      formatSignificant(v, significant),
      formatSignificant(convert(v, from, to), significant),
    ]),
  };
}

/** "multiply by 0.3048" / "divide by 0.3048", from the units' definitions. */
export function factorFormula(from: string, to: string): CalculatorContent['formula'] {
  const factor = convert(1, from, to);
  const fromUnit = getUnit(from);
  const toUnit = getUnit(to);
  const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());
  return [
    {
      label: 'Conversion',
      expression: `${cap(toUnit.plural)} = ${cap(fromUnit.plural)} × ${formatSignificant(factor, 10)}`,
    },
    {
      label: 'Equivalent',
      expression: `${cap(toUnit.plural)} = ${cap(fromUnit.plural)} ÷ ${formatSignificant(1 / factor, 10)}`,
    },
  ];
}

export function createConverter(options: ConverterOptions): CalculatorDefinition {
  const { from, to } = options;
  const fromUnit = getUnit(from);
  const toUnit = getUnit(to);
  const significant = options.significantDigits ?? 6;

  return {
    slug: options.slug,
    intro: options.intro,
    fields: [
      {
        id: 'value',
        kind: 'unit',
        label: `Value in ${fromUnit.plural}`,
        dimension: fromUnit.dimension,
        units: [from],
        defaultUnit: from,
        default: options.defaultValue ?? '1',
        min: options.allowNegative ? -DEFAULT_MAX : 0,
        wide: true,
      },
    ],
    calculate(inputs) {
      const value = inputs.num('value');
      const result = convert(value, from, to);
      const resultText = formatSignificant(result, significant);
      const valueText = formatSignificant(value, 10);
      return {
        headline: { value: resultText, unit: toUnit.symbol },
        summary: `${valueText} ${unitName(from, value)} = ${resultText} ${unitName(to, result)}.`,
        details: [
          {
            label: fromUnit.plural.replace(/^./, (c) => c.toUpperCase()),
            value: `${valueText} ${fromUnit.symbol}`,
          },
          {
            label: toUnit.plural.replace(/^./, (c) => c.toUpperCase()),
            value: `${resultText} ${toUnit.symbol}`,
          },
          ...(options.extraDetails?.(value) ?? []),
        ],
      };
    },
    content: {
      howItWorks: options.howItWorks,
      formula: options.formula ?? factorFormula(from, to),
      examples: options.examples,
      faq: options.faq,
      tables: [referenceTable(from, to, options.tableValues ?? DEFAULT_TABLE, significant)],
    },
  };
}
