import { createConverter } from '../../shared/converter';
import { formatNumber } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'hectares-to-acres',
  from: 'ha',
  to: 'acre',
  defaultValue: '5',
  intro: 'Enter an area in hectares to convert it to acres. One hectare is about 2.47105 acres.',
  howItWorks: [
    'A hectare is 10,000 square meters (a square 100 m on each side). The international acre is exactly 4,046.8564224 square meters, so hectares are converted to acres by multiplying by 10,000 and dividing by 4,046.8564224, about 2.47105.',
  ],
  tableValues: [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 250, 1000],
  extraDetails: (ha) => [
    { label: 'Square meters', value: `${formatNumber(ha * 10000, 0)} m²` },
    { label: 'Square feet', value: `${formatNumber((ha * 10000) / 0.09290304, 0)} ft²` },
  ],
  examples: [
    {
      title: 'Convert 5 hectares to acres',
      values: { value: '5' },
      steps: ['5 ha × 10,000 = 50,000 m²', '50,000 m² ÷ 4,046.8564224 = 12.3553 acres'],
      expected: '12.3553',
    },
  ],
  faq: [
    {
      question: 'How many acres are in a hectare?',
      answer: 'About 2.47105 acres.',
    },
    {
      question: 'How big is a hectare?',
      answer:
        'A square 100 meters on each side, or 10,000 square meters. That is about 1.4 times the size of a standard 105 × 68 m football (soccer) pitch.',
    },
    {
      question: 'How many square kilometers is a hectare?',
      answer: 'One hundredth: 100 hectares make one square kilometer.',
    },
  ],
});
