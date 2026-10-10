import { CalcInputError } from '../../engine';
import type { CalculatorDefinition, NumberField } from '../../types';
import { formatNumber } from '../../../utils/format';

const num = (
  id: string,
  label: string,
  value: string,
  mode: string,
  positive = false,
): NumberField => ({
  id,
  kind: 'number',
  label,
  default: value,
  exclusiveMin: positive,
  showWhen: { field: 'mode', equals: [mode] },
});

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

function decimalsOf(n: number): number {
  const text = String(n);
  if (text.includes('e-')) return Number(text.split('e-')[1]);
  return text.includes('.') ? (text.split('.')[1]?.length ?? 0) : 0;
}

/** Reduce a ratio of positive numbers to the smallest whole numbers. */
export function simplifyRatio(a: number, b: number): [number, number] {
  const decimals = Math.min(9, Math.max(decimalsOf(a), decimalsOf(b)));
  const scale = 10 ** decimals;
  const x = Math.round(a * scale);
  const y = Math.round(b * scale);
  const divisor = gcd(x, y) || 1;
  return [x / divisor, y / divisor];
}

const f = (n: number) => formatNumber(n, 4);

export const calculator: CalculatorDefinition = {
  slug: 'ratio-calculator',
  intro:
    'Solve A : B = C : D for the missing value, simplify a ratio, or share a total in a ratio.',
  fields: [
    {
      id: 'mode',
      kind: 'select',
      label: 'What do you want to do?',
      options: [
        { value: 'solve', label: 'Find the missing value (A : B = C : ?)' },
        { value: 'simplify', label: 'Simplify a ratio' },
        { value: 'divide', label: 'Split a total in a ratio' },
      ],
      default: 'solve',
      wide: true,
    },
    num('a', 'A', '3', 'solve', true),
    num('b', 'B', '4', 'solve'),
    num('c', 'C', '9', 'solve'),
    num('simplifyA', 'First number', '12', 'simplify', true),
    num('simplifyB', 'Second number', '18', 'simplify', true),
    { ...num('total', 'Total to split', '100', 'divide'), wide: true },
    num('partA', 'Ratio part A', '2', 'divide', true),
    num('partB', 'Ratio part B', '3', 'divide', true),
  ],
  calculate(inputs) {
    const mode = inputs.select('mode');
    if (mode === 'simplify') {
      const a = inputs.num('simplifyA');
      const b = inputs.num('simplifyB');
      const [x, y] = simplifyRatio(a, b);
      if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
        throw new CalcInputError(
          'These numbers are too large or too precise to simplify exactly.',
          'simplifyB',
        );
      }
      return {
        headline: { value: `${formatNumber(x, 0)} : ${formatNumber(y, 0)}` },
        summary: `${f(a)} : ${f(b)} simplifies to ${formatNumber(x, 0)} : ${formatNumber(y, 0)}.`,
        details: [
          { label: 'As 1 : n', value: `1 : ${f(b / a)}` },
          { label: 'As n : 1', value: `${f(a / b)} : 1` },
          { label: 'As a fraction', value: `${formatNumber(x, 0)}/${formatNumber(y, 0)}` },
        ],
      };
    }
    if (mode === 'divide') {
      const total = inputs.num('total');
      const a = inputs.num('partA');
      const b = inputs.num('partB');
      const shareA = (total * a) / (a + b);
      const shareB = total - shareA;
      return {
        headline: { value: `${f(shareA)} and ${f(shareB)}` },
        summary: `Splitting ${f(total)} in the ratio ${f(a)} : ${f(b)} gives ${f(shareA)} and ${f(shareB)}.`,
        details: [
          { label: 'Share A', value: f(shareA) },
          { label: 'Share B', value: f(shareB) },
          { label: 'One part is worth', value: f(total / (a + b)) },
        ],
      };
    }
    const a = inputs.num('a');
    const b = inputs.num('b');
    const c = inputs.num('c');
    const d = (b * c) / a;
    return {
      headline: { value: f(d) },
      summary: `${f(a)} : ${f(b)} = ${f(c)} : ${f(d)}`,
      details: [
        { label: 'Working', value: `D = ${f(b)} × ${f(c)} ÷ ${f(a)}` },
        { label: 'Scale factor', value: `× ${f(c / a)}` },
      ],
    };
  },
  content: {
    howItWorks: [
      'A ratio compares quantities. Two ratios are in proportion when A : B = C : D, which means A × D = B × C. Rearranging gives the missing value D = B × C ÷ A.',
      'To simplify a ratio, both numbers are divided by their greatest common divisor. Decimals are first scaled up to whole numbers, so 1.5 : 2.5 becomes 15 : 25 and then 3 : 5. To split a total in a ratio, the total is divided into A + B equal parts.',
    ],
    formula: [
      { label: 'Missing value', expression: 'D = B × C ÷ A' },
      { label: 'Simplify', expression: 'A : B = (A ÷ GCD) : (B ÷ GCD)' },
      { label: 'Split a total', expression: 'Share A = Total × A ÷ (A + B)' },
    ],
    examples: [
      {
        title: '3 : 4 = 9 : ?',
        values: { mode: 'solve', a: '3', b: '4', c: '9' },
        steps: ['D = 4 × 9 ÷ 3', 'D = 36 ÷ 3 = 12'],
        expected: '12',
      },
      {
        title: 'Simplify 12 : 18',
        values: { mode: 'simplify', simplifyA: '12', simplifyB: '18' },
        steps: ['The greatest common divisor of 12 and 18 is 6', '12 ÷ 6 = 2 and 18 ÷ 6 = 3'],
        expected: '2 : 3',
      },
      {
        title: 'Split 100 in the ratio 2 : 3',
        values: { mode: 'divide', total: '100', partA: '2', partB: '3' },
        steps: [
          'Total parts = 2 + 3 = 5; one part = 100 ÷ 5 = 20',
          'Shares = 2 × 20 = 40 and 3 × 20 = 60',
        ],
        expected: '40 and 60',
      },
    ],
    faq: [
      {
        question: 'How do I scale a ratio up or down?',
        answer:
          'Multiply or divide both sides by the same number. 2 : 3 scaled by 4 is 8 : 12. Use the missing-value mode to scale to a specific amount.',
      },
      {
        question: 'Does the order of a ratio matter?',
        answer:
          'Yes. 2 : 3 and 3 : 2 describe different mixtures. Keep the quantities in the same order on both sides.',
      },
      {
        question: 'How do I write a ratio as a percentage?',
        answer:
          'Divide each part by the total of all parts and multiply by 100. In 2 : 3 the first part is 2 ÷ 5 = 40% of the whole.',
      },
    ],
  },
};
