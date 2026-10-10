import { createConverter } from '../../shared/converter';
import { formatNumber } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'acres-to-hectares',
  from: 'acre',
  to: 'ha',
  defaultValue: '10',
  intro:
    'Enter an area in acres to convert it to hectares. One acre is exactly 0.40468564224 hectares.',
  howItWorks: [
    'The international acre is defined as exactly 43,560 square feet, which is 4,046.8564224 square meters. A hectare is 10,000 square meters, so one acre is 0.40468564224 hectares.',
    'A rough rule: 2.5 acres is about 1 hectare (the exact figure is 2.4711 acres).',
  ],
  tableValues: [0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 40, 50, 100, 160, 640],
  extraDetails: (acres) => [
    { label: 'Square meters', value: `${formatNumber(acres * 4046.8564224, 0)} m²` },
    { label: 'Square feet', value: `${formatNumber(acres * 43560, 0)} ft²` },
  ],
  examples: [
    {
      title: 'Convert 10 acres to hectares',
      values: { value: '10' },
      steps: ['10 acres × 0.40468564224 = 4.04686 ha'],
      expected: '4.04686',
    },
  ],
  faq: [
    {
      question: 'How many hectares are in an acre?',
      answer: 'One acre is about 0.404686 hectares, or 4,046.86 square meters.',
    },
    {
      question: 'Which is bigger, an acre or a hectare?',
      answer: 'A hectare is about 2.47 times larger than an acre.',
    },
    {
      question: 'How big is an acre?',
      answer:
        'An acre is 43,560 square feet: roughly 208.7 × 208.7 feet if square, or about 90% of an American football field excluding the end zones.',
    },
  ],
});
