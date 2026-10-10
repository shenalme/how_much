import { createConverter } from '../../shared/converter';
import { feetAndInches } from '../../shared/feetInches';

export const calculator = createConverter({
  slug: 'meters-to-feet',
  from: 'm',
  to: 'ft',
  defaultValue: '2',
  intro:
    'Enter a length in meters to convert it to feet, and to feet and inches. One meter is about 3.28084 feet.',
  howItWorks: [
    'A foot is defined as exactly 0.3048 meters, so meters are converted to feet by dividing by 0.3048, which is the same as multiplying by about 3.28084.',
    'For heights and room sizes it is often more useful to see feet and inches. The calculator splits the result into whole feet and the remaining inches (12 inches to a foot).',
  ],
  extraDetails: (meters) => [{ label: 'Feet and inches', value: feetAndInches(meters) }],
  examples: [
    {
      title: 'Convert 2 meters to feet',
      values: { value: '2' },
      steps: ['2 m ÷ 0.3048 = 6.56168 ft', '0.56168 ft × 12 = 6.74 in, so 6 ft 6.74 in'],
      expected: '6.56168',
    },
  ],
  faq: [
    {
      question: 'How many feet are in a meter?',
      answer: 'About 3.28084 feet (1 ÷ 0.3048), or 3 feet 3.37 inches.',
    },
    {
      question: 'How tall is 1.8 meters in feet?',
      answer: '1.8 m is 5.90551 feet, which is 5 feet 10.87 inches.',
    },
    {
      question: 'Is a meter longer than a yard?',
      answer: 'Yes. A yard is 0.9144 m, so a meter is about 1.0936 yards.',
    },
  ],
});
