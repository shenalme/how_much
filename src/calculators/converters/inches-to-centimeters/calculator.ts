import { createConverter } from '../../shared/converter';
import { formatNumber } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'inches-to-centimeters',
  from: 'in',
  to: 'cm',
  defaultValue: '12',
  intro:
    'Enter a length in inches to convert it to centimeters. One inch is exactly 2.54 centimeters. You can type fractions such as 5/8 or 2 1/2.',
  howItWorks: [
    'The inch has been defined as exactly 2.54 centimeters since 1959, so inches convert to centimeters by multiplying by 2.54.',
    'Fractional inches from a tape measure can be entered directly: 3/8 is read as 0.375 and 2 1/2 as 2.5.',
  ],
  extraDetails: (inches) => [
    { label: 'Millimeters', value: `${formatNumber(inches * 25.4, 3)} mm` },
  ],
  examples: [
    {
      title: 'Convert 12 inches to centimeters',
      values: { value: '12' },
      steps: ['12 in × 2.54 = 30.48 cm'],
      expected: '30.48',
    },
  ],
  faq: [
    {
      question: 'How many centimeters are in an inch?',
      answer: 'Exactly 2.54 centimeters, or 25.4 millimeters.',
    },
    {
      question: 'How many centimeters is a 32 inch waist?',
      answer: '32 × 2.54 = 81.28 cm.',
    },
    {
      question: 'How do I convert screen sizes?',
      answer:
        'Screen sizes are measured diagonally. A 55 inch screen is 55 × 2.54 = 139.7 cm across the diagonal.',
    },
  ],
});
