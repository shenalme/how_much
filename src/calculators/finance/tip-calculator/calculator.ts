import type { CalculatorDefinition } from '../../types';
import { formatMoney, formatNumber, plural } from '../../../utils/format';

export function splitBill(bill: number, tipPercent: number, people: number, roundUp: boolean) {
  let total = bill * (1 + tipPercent / 100);
  let perPerson = total / people;
  if (roundUp) {
    perPerson = Math.ceil(perPerson - 1e-9);
    total = perPerson * people;
  }
  return { tip: total - bill, total, perPerson };
}

export const calculator: CalculatorDefinition = {
  slug: 'tip-calculator',
  intro: 'Enter the bill and tip percentage to see the tip, the total and each person’s share.',
  fields: [
    { id: 'bill', kind: 'number', label: 'Bill amount', default: '50' },
    {
      id: 'tip',
      kind: 'number',
      label: 'Tip',
      help: 'Customs differ widely between countries.',
      default: '18',
      suffix: '%',
      max: 100,
    },
    {
      id: 'people',
      kind: 'number',
      label: 'Number of people',
      default: '2',
      integer: true,
      min: 1,
      max: 1000,
    },
    {
      id: 'round',
      kind: 'select',
      label: 'Round each share up to a whole amount?',
      options: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes (adds a little to the tip)' },
      ],
      default: 'no',
      wide: true,
    },
  ],
  calculate(inputs) {
    const bill = inputs.num('bill');
    const people = inputs.num('people');
    const { tip, total, perPerson } = splitBill(
      bill,
      inputs.num('tip'),
      people,
      inputs.select('round') === 'yes',
    );
    return {
      headline: { value: formatMoney(tip), unit: 'tip' },
      summary: `Leave a tip of ${formatMoney(tip)} for a total of ${formatMoney(total)}${people > 1 ? `, or ${formatMoney(perPerson)} each for ${formatNumber(people, 0)} ${plural(people, 'person', 'people')}` : ''}.`,
      details: [
        {
          label: 'Tip',
          value: `${formatMoney(tip)} (${formatNumber(bill > 0 ? (tip / bill) * 100 : 0, 2)}%)`,
        },
        { label: 'Total', value: formatMoney(total) },
        { label: 'Per person', value: formatMoney(perPerson) },
      ],
    };
  },
  content: {
    howItWorks: [
      'The tip is the bill multiplied by the tip percentage. Adding it to the bill gives the total, which is divided by the number of people for each share.',
      'If you choose to round up, each share is rounded up to the next whole amount and the tip increases slightly to match, which makes paying in cash easier.',
    ],
    formula: [
      { label: 'Tip', expression: 'Tip = Bill × Tip % ÷ 100' },
      { label: 'Total', expression: 'Total = Bill + Tip' },
      { label: 'Per person', expression: 'Share = Total ÷ People' },
    ],
    assumptions: [
      'Some people tip on the pre-tax amount; enter the bill before tax if you prefer to do that.',
    ],
    examples: [
      {
        title: 'An 18% tip on a bill of 50 for two people',
        values: { bill: '50', tip: '18', people: '2', round: 'no' },
        steps: ['Tip = 50 × 0.18 = 9.00', 'Total = 59.00', 'Each person pays 59.00 ÷ 2 = 29.50'],
        expected: '9.00',
      },
    ],
    faq: [
      {
        question: 'How much should I tip?',
        answer:
          'It depends on the country and the service. In US restaurants 15 to 20% is common; in many other countries service is included or tips are smaller. Check local customs.',
      },
      {
        question: 'How do I calculate 20% quickly?',
        answer:
          'Move the decimal point one place left to get 10%, then double it. For a bill of 64, 10% is 6.40, so 20% is 12.80.',
      },
      {
        question: 'Should I tip on tax?',
        answer:
          'Practice varies. Tipping on the pre-tax amount is common, but either is acceptable; enter whichever amount you want to tip on.',
      },
    ],
  },
};
