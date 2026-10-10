import { createConverter } from '../../shared/converter';
import { formatSignificant } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'feet-to-meters',
  from: 'ft',
  to: 'm',
  defaultValue: '10',
  intro: 'Enter a length in feet to convert it to meters. One foot is exactly 0.3048 meters.',
  howItWorks: [
    'The international foot is defined as exactly 0.3048 meters, so converting feet to meters is a single multiplication with no rounding in the factor itself. The result is shown to six significant figures.',
    'To convert feet and inches, first turn the inches into decimal feet by dividing by 12 (5 ft 6 in = 5.5 ft), or convert each part separately and add: inches × 2.54 gives centimeters.',
  ],
  extraDetails: (feet) => [
    { label: 'Centimeters', value: `${formatSignificant(feet * 30.48, 6)} cm` },
  ],
  examples: [
    {
      title: 'Convert 10 feet to meters',
      values: { value: '10' },
      steps: ['10 ft × 0.3048 = 3.048 m'],
      expected: '3.048',
    },
  ],
  faq: [
    {
      question: 'How many meters are in a foot?',
      answer: 'Exactly 0.3048 meters, or 30.48 centimeters, by international definition.',
    },
    {
      question: 'How do I convert 6 feet to meters?',
      answer: '6 × 0.3048 = 1.8288 meters, or about 1.83 m.',
    },
    {
      question: 'Is the US survey foot different?',
      answer:
        'The US survey foot (1200/3937 m) differs from the international foot by about 2 parts per million. It was retired for new work at the end of 2022; this converter uses the international foot.',
    },
  ],
});
