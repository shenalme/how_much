import { createConverter } from '../../shared/converter';
import { formatNumber } from '../../../utils/format';

function poundsAndOunces(kg: number): string {
  const totalOunces = Math.round((kg / 0.45359237) * 16 * 10) / 10;
  const pounds = Math.floor(totalOunces / 16);
  const ounces = totalOunces - pounds * 16;
  return `${formatNumber(pounds, 0)} lb ${formatNumber(ounces, 1)} oz`;
}

export const calculator = createConverter({
  slug: 'kilograms-to-pounds',
  from: 'kg',
  to: 'lb',
  defaultValue: '70',
  intro:
    'Enter a weight in kilograms to convert it to pounds, and to pounds and ounces. One kilogram is about 2.20462 pounds.',
  howItWorks: [
    'A pound is defined as exactly 0.45359237 kilograms, so kilograms are converted to pounds by dividing by that number, which is the same as multiplying by about 2.2046226.',
    'For small weights such as baby weights or cooking, the result is also shown in pounds and ounces, with 16 ounces to a pound.',
  ],
  extraDetails: (kg) => [{ label: 'Pounds and ounces', value: poundsAndOunces(kg) }],
  examples: [
    {
      title: 'Convert 70 kg to pounds',
      values: { value: '70' },
      steps: ['70 kg ÷ 0.45359237 = 154.324 lb', '0.324 lb × 16 = 5.2 oz, so 154 lb 5.2 oz'],
      expected: '154.324',
    },
  ],
  faq: [
    {
      question: 'How many pounds are in a kilogram?',
      answer: 'About 2.20462 pounds, or 2 pounds 3.27 ounces.',
    },
    {
      question: 'What is a quick way to convert kg to lbs?',
      answer:
        'Double the kilograms and add 10%: 70 kg → 140 → 154 lb. The exact answer is 154.32 lb.',
    },
    {
      question: 'How heavy is a 23 kg suitcase in pounds?',
      answer:
        '23 kg is 50.71 pounds, which is why many airlines quote their checked-bag limit as 23 kg or 50 lb.',
    },
  ],
});
