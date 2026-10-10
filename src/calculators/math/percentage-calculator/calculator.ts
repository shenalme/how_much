import { CalcInputError, DEFAULT_MAX } from '../../engine';
import type { CalculatorDefinition, NumberField } from '../../types';
import { formatNumber } from '../../../utils/format';

const num = (
  id: string,
  label: string,
  value: string,
  mode: string,
  suffix?: string,
): NumberField => ({
  id,
  kind: 'number',
  label,
  default: value,
  suffix,
  min: -DEFAULT_MAX,
  showWhen: { field: 'mode', equals: [mode] },
});

const f = (n: number) => formatNumber(n, 4);

export const calculator: CalculatorDefinition = {
  slug: 'percentage-calculator',
  intro:
    'Choose the question you want to answer, enter two numbers and get the result with the working shown.',
  fields: [
    {
      id: 'mode',
      kind: 'select',
      label: 'What do you want to work out?',
      options: [
        { value: 'of', label: 'What is X% of Y?' },
        { value: 'is', label: 'X is what percent of Y?' },
        { value: 'change', label: 'Percentage change from X to Y' },
        { value: 'whole', label: 'X is Y% of what?' },
      ],
      default: 'of',
      wide: true,
    },
    num('ofPercent', 'Percentage', '15', 'of', '%'),
    num('ofValue', 'Of this number', '80', 'of'),
    num('isPart', 'Number', '30', 'is'),
    num('isWhole', 'Is what percent of', '120', 'is'),
    num('changeFrom', 'From', '50', 'change'),
    num('changeTo', 'To', '65', 'change'),
    num('wholePart', 'Number', '45', 'whole'),
    num('wholePercent', 'Is this percent of the total', '30', 'whole', '%'),
  ],
  calculate(inputs) {
    switch (inputs.select('mode')) {
      case 'is': {
        const part = inputs.num('isPart');
        const whole = inputs.num('isWhole');
        if (whole === 0) throw new CalcInputError('Enter a number other than 0.', 'isWhole');
        const pct = (part / whole) * 100;
        return {
          headline: { value: f(pct), unit: '%' },
          summary: `${f(part)} is ${f(pct)}% of ${f(whole)}.`,
          details: [{ label: 'Working', value: `${f(part)} ÷ ${f(whole)} × 100` }],
        };
      }
      case 'change': {
        const from = inputs.num('changeFrom');
        const to = inputs.num('changeTo');
        if (from === 0) {
          throw new CalcInputError(
            'A percentage change from 0 is undefined. Enter a starting value other than 0.',
            'changeFrom',
          );
        }
        const pct = ((to - from) / Math.abs(from)) * 100;
        const direction = pct > 0 ? 'an increase' : pct < 0 ? 'a decrease' : 'no change';
        return {
          headline: { value: `${pct > 0 ? '+' : ''}${f(pct)}`, unit: '%' },
          summary:
            pct === 0
              ? `There is no change from ${f(from)} to ${f(to)}.`
              : `Going from ${f(from)} to ${f(to)} is ${direction} of ${f(Math.abs(pct))}%.`,
          details: [
            { label: 'Difference', value: f(to - from) },
            { label: 'Working', value: `(${f(to)} − ${f(from)}) ÷ |${f(from)}| × 100` },
          ],
        };
      }
      case 'whole': {
        const part = inputs.num('wholePart');
        const pct = inputs.num('wholePercent');
        if (pct === 0) throw new CalcInputError('Enter a percentage other than 0.', 'wholePercent');
        const whole = part / (pct / 100);
        return {
          headline: { value: f(whole) },
          summary: `${f(part)} is ${f(pct)}% of ${f(whole)}.`,
          details: [{ label: 'Working', value: `${f(part)} ÷ (${f(pct)} ÷ 100)` }],
        };
      }
      default: {
        const pct = inputs.num('ofPercent');
        const value = inputs.num('ofValue');
        const result = (pct / 100) * value;
        return {
          headline: { value: f(result) },
          summary: `${f(pct)}% of ${f(value)} is ${f(result)}.`,
          details: [
            { label: 'Working', value: `${f(pct)} ÷ 100 × ${f(value)}` },
            { label: `${f(value)} plus ${f(pct)}%`, value: f(value + result) },
            { label: `${f(value)} minus ${f(pct)}%`, value: f(value - result) },
          ],
        };
      }
    }
  },
  content: {
    howItWorks: [
      'A percentage is a fraction of 100: 15% means 15 per hundred, or 0.15. To find a percentage of a number, multiply the number by the percentage divided by 100. To find what percent one number is of another, divide the part by the whole and multiply by 100.',
      'Percentage change compares a new value with an original one: the difference is divided by the original value. The original value is the reference point, so going from 50 to 65 is a 30% increase, while going back from 65 to 50 is a 23.08% decrease.',
    ],
    formula: [
      { label: 'X% of Y', expression: 'Result = X ÷ 100 × Y' },
      { label: 'X is what % of Y', expression: 'Percent = X ÷ Y × 100' },
      { label: 'Change from X to Y', expression: 'Change % = (Y − X) ÷ |X| × 100' },
      { label: 'X is Y% of what', expression: 'Whole = X ÷ (Y ÷ 100)' },
    ],
    examples: [
      {
        title: 'What is 15% of 80?',
        values: { mode: 'of', ofPercent: '15', ofValue: '80' },
        steps: ['15 ÷ 100 = 0.15', '0.15 × 80 = 12'],
        expected: '12',
      },
      {
        title: '30 is what percent of 120?',
        values: { mode: 'is', isPart: '30', isWhole: '120' },
        steps: ['30 ÷ 120 = 0.25', '0.25 × 100 = 25%'],
        expected: '25',
      },
      {
        title: 'Percentage change from 50 to 65',
        values: { mode: 'change', changeFrom: '50', changeTo: '65' },
        steps: ['Difference = 65 − 50 = 15', '15 ÷ 50 × 100 = 30% increase'],
        expected: '+30',
      },
    ],
    faq: [
      {
        question: 'How do I calculate a percentage of a number in my head?',
        answer:
          'Find 10% by moving the decimal point one place left, then scale. For 15% of 80: 10% is 8, 5% is half of that (4), so 15% is 12.',
      },
      {
        question: 'Is a 50% increase followed by a 50% decrease back to the start?',
        answer:
          'No. 100 increased by 50% is 150, and 150 decreased by 50% is 75. Each percentage applies to a different starting value.',
      },
      {
        question: 'What is the difference between percent and percentage points?',
        answer:
          'Percentage points measure the plain difference between two percentages. A rate rising from 4% to 5% has gone up 1 percentage point, which is a 25% increase in the rate.',
      },
    ],
  },
};
