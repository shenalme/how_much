import { createConverter } from '../../shared/converter';
import { formatSignificant } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'pounds-to-kilograms',
  from: 'lb',
  to: 'kg',
  defaultValue: '50',
  intro:
    'Enter a weight in pounds to convert it to kilograms. One pound is exactly 0.45359237 kilograms.',
  howItWorks: [
    'The international avoirdupois pound is defined as exactly 0.45359237 kilograms. To convert pounds to kilograms, multiply by that factor, which is the same as dividing by about 2.20462.',
    'A quick mental estimate is to halve the pounds and subtract 10%: 50 lb → 25 → about 22.5 kg (the exact answer is 22.68 kg).',
  ],
  extraDetails: (lb) => [{ label: 'Grams', value: `${formatSignificant(lb * 453.59237, 7)} g` }],
  examples: [
    {
      title: 'Convert 50 lbs to kg',
      values: { value: '50' },
      steps: ['50 lb × 0.45359237 = 22.6796 kg'],
      expected: '22.6796',
    },
  ],
  faq: [
    {
      question: 'How many kilograms are in a pound?',
      answer: 'Exactly 0.45359237 kg, or about 453.6 grams.',
    },
    {
      question: 'Why is pounds abbreviated lb?',
      answer:
        'It comes from the Latin libra, a Roman unit of weight. "Lbs" is a common informal plural.',
    },
    {
      question: 'How do I convert stones and pounds to kilograms?',
      answer:
        'One stone is 14 pounds. Convert the whole weight to pounds first (11 st 4 lb = 158 lb), then multiply by 0.45359237: 158 lb = 71.67 kg.',
    },
  ],
});
