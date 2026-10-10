import type { CalculatorDefinition } from '../../types';
import { formatNumber } from '../../../utils/format';

export function statistics(values: number[]) {
  const count = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, v) => total + v, 0);
  const mean = sum / count;
  const middle = Math.floor(count / 2);
  const median =
    count % 2 === 0
      ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
      : (sorted[middle] ?? 0);
  const frequencies = new Map<number, number>();
  for (const v of values) frequencies.set(v, (frequencies.get(v) ?? 0) + 1);
  const highest = Math.max(...frequencies.values());
  const modes =
    highest > 1
      ? [...frequencies]
          .filter(([, n]) => n === highest)
          .map(([v]) => v)
          .sort((a, b) => a - b)
      : [];
  const squares = values.reduce((total, v) => total + (v - mean) ** 2, 0);
  return {
    count,
    sum,
    mean,
    median,
    modes,
    min: sorted[0] ?? 0,
    max: sorted[count - 1] ?? 0,
    range: (sorted[count - 1] ?? 0) - (sorted[0] ?? 0),
    populationSd: Math.sqrt(squares / count),
    sampleSd: count > 1 ? Math.sqrt(squares / (count - 1)) : null,
  };
}

const f = (n: number) => formatNumber(n, 4);

export const calculator: CalculatorDefinition = {
  slug: 'average-calculator',
  intro:
    'Paste or type your numbers to get the average (mean) along with the median, mode, range and standard deviation.',
  fields: [
    {
      id: 'values',
      kind: 'numberList',
      label: 'Numbers',
      help: 'Separate with commas, spaces or new lines. Use a period for decimals, e.g. 2.5.',
      default: '4, 8, 15, 16, 23, 42',
      placeholder: 'e.g. 12, 15.5, 9, 22',
      minCount: 1,
    },
  ],
  calculate(inputs) {
    const s = statistics(inputs.list('values'));
    return {
      headline: { value: f(s.mean) },
      summary: `The average (mean) of these ${formatNumber(s.count, 0)} numbers is ${f(s.mean)}.`,
      details: [
        { label: 'Count', value: formatNumber(s.count, 0) },
        { label: 'Sum', value: f(s.sum) },
        { label: 'Median', value: f(s.median) },
        {
          label: 'Mode',
          value: s.modes.length ? s.modes.map(f).join(', ') : 'None (no value repeats)',
        },
        { label: 'Smallest', value: f(s.min) },
        { label: 'Largest', value: f(s.max) },
        { label: 'Range', value: f(s.range) },
        { label: 'Standard deviation (population)', value: f(s.populationSd) },
        {
          label: 'Standard deviation (sample)',
          value: s.sampleSd === null ? 'Needs 2 or more numbers' : f(s.sampleSd),
        },
      ],
    };
  },
  content: {
    howItWorks: [
      'The mean is what most people call the average: add all the numbers and divide by how many there are. The median is the middle value once the numbers are sorted (or the mean of the two middle values when there is an even count). The mode is the value that appears most often.',
      'The median is less affected by unusually large or small values than the mean, which is why it is often used for things like house prices. Standard deviation measures how spread out the numbers are around the mean.',
    ],
    formula: [
      { label: 'Mean', expression: 'Mean = Sum of values ÷ Number of values' },
      { label: 'Median', expression: 'Median = Middle value of the sorted list' },
      { label: 'Range', expression: 'Range = Largest − Smallest' },
      {
        label: 'Standard deviation',
        expression: 'σ = √(Σ(x − mean)² ÷ n), sample: √(Σ(x − mean)² ÷ (n − 1))',
      },
    ],
    examples: [
      {
        title: 'The average of 4, 8, 15, 16, 23 and 42',
        values: { values: '4, 8, 15, 16, 23, 42' },
        steps: [
          'Sum = 4 + 8 + 15 + 16 + 23 + 42 = 108',
          'Mean = 108 ÷ 6 = 18',
          'Median = (15 + 16) ÷ 2 = 15.5',
        ],
        expected: '18',
      },
    ],
    faq: [
      {
        question: 'What is the difference between mean and median?',
        answer:
          'The mean adds everything and divides by the count; the median is the middle value. With 1, 2, 3, 4 and 100, the mean is 22 but the median is 3, which better describes a typical value.',
      },
      {
        question: 'Should I use the population or sample standard deviation?',
        answer:
          'Use the population version when your list contains every value you care about, and the sample version when the numbers are a sample drawn from a larger group.',
      },
      {
        question: 'Can I paste numbers from a spreadsheet?',
        answer:
          'Yes. Copy a column or row and paste it in; values separated by new lines, tabs or spaces are all recognised.',
      },
    ],
  },
};
