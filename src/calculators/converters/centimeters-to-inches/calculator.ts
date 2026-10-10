import { createConverter } from '../../shared/converter';
import { feetAndInches } from '../../shared/feetInches';

export const calculator = createConverter({
  slug: 'centimeters-to-inches',
  from: 'cm',
  to: 'in',
  defaultValue: '100',
  intro:
    'Enter a length in centimeters to convert it to inches, and to feet and inches for heights. One inch is exactly 2.54 cm.',
  howItWorks: [
    'Because one inch is exactly 2.54 centimeters, centimeters convert to inches by dividing by 2.54 (or multiplying by about 0.393701).',
    'For heights, the result is also shown in feet and inches, with 12 inches to a foot.',
  ],
  extraDetails: (cm) => [{ label: 'Feet and inches', value: feetAndInches(cm / 100) }],
  examples: [
    {
      title: 'Convert 100 centimeters to inches',
      values: { value: '100' },
      steps: ['100 cm ÷ 2.54 = 39.3701 in', '39.3701 in = 3 ft 3.37 in'],
      expected: '39.3701',
    },
  ],
  faq: [
    {
      question: 'How many inches are in a centimeter?',
      answer: 'About 0.393701 inches. Ten centimeters is about 3.94 inches.',
    },
    {
      question: 'How tall is 170 cm in feet and inches?',
      answer: '170 ÷ 2.54 = 66.93 inches, which is 5 feet 6.93 inches.',
    },
    {
      question: 'Is 30 cm the same as a foot?',
      answer: 'Close, but not quite. A foot is exactly 30.48 cm, so 30 cm is about 11.81 inches.',
    },
  ],
});
