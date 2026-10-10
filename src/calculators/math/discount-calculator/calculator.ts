import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatMoney, formatNumber } from '../../../utils/format';

export function applyDiscounts(price: number, discount: number, extra = 0, tax = 0) {
  const afterFirst = price * (1 - discount / 100);
  const afterAll = afterFirst * (1 - extra / 100);
  const taxAmount = afterAll * (tax / 100);
  const savings = price - afterAll;
  return {
    afterFirst,
    afterAll,
    taxAmount,
    final: afterAll + taxAmount,
    savings,
    effectiveDiscount: price > 0 ? (savings / price) * 100 : 0,
  };
}

export const calculator: CalculatorDefinition = {
  slug: 'discount-calculator',
  intro:
    'Enter the original price and discount to see the sale price and your savings. Add a second discount or sales tax if you need to.',
  fields: [
    { id: 'price', kind: 'number', label: 'Original price', default: '85', max: 1_000_000_000 },
    { id: 'discount', kind: 'number', label: 'Discount', default: '25', suffix: '%', max: 100 },
    {
      id: 'extra',
      kind: 'number',
      label: 'Extra discount on top',
      help: 'Applied after the first discount, e.g. an extra 10% at checkout.',
      default: '',
      suffix: '%',
      optional: true,
      max: 100,
    },
    {
      id: 'tax',
      kind: 'number',
      label: 'Sales tax',
      default: '',
      suffix: '%',
      optional: true,
      max: 100,
    },
  ],
  calculate(inputs) {
    const price = inputs.num('price');
    const discount = inputs.num('discount');
    const extra = inputs.optionalNum('extra') ?? 0;
    const tax = inputs.optionalNum('tax') ?? 0;
    const r = applyDiscounts(price, discount, extra, tax);

    const details: ResultDetail[] = [
      { label: 'Original price', value: formatMoney(price) },
      {
        label: `${formatNumber(discount, 2)}% off`,
        value: `− ${formatMoney(price - r.afterFirst)}`,
      },
    ];
    if (extra > 0)
      details.push({
        label: `Extra ${formatNumber(extra, 2)}% off`,
        value: `− ${formatMoney(r.afterFirst - r.afterAll)}`,
      });
    details.push({ label: 'Price after discount', value: formatMoney(r.afterAll) });
    if (tax > 0)
      details.push({
        label: `Sales tax (${formatNumber(tax, 3)}%)`,
        value: `+ ${formatMoney(r.taxAmount)}`,
      });
    details.push({
      label: 'Total savings',
      value: `${formatMoney(r.savings)} (${formatNumber(r.effectiveDiscount, 2)}%)`,
    });

    return {
      headline: { value: formatMoney(r.final) },
      summary: `You pay ${formatMoney(r.final)}${tax > 0 ? ' including tax' : ''}, saving ${formatMoney(r.savings)} (${formatNumber(r.effectiveDiscount, 2)}% off).`,
      details,
      notes:
        extra > 0
          ? [
              `Stacked discounts multiply: ${formatNumber(discount, 2)}% then ${formatNumber(extra, 2)}% is ${formatNumber(r.effectiveDiscount, 2)}% off in total, not ${formatNumber(discount + extra, 2)}%.`,
            ]
          : undefined,
    };
  },
  content: {
    howItWorks: [
      'A discount of d% leaves you paying (100 − d)% of the price. A 25% discount means you pay 75%, so the sale price is the original price × 0.75.',
      'When a second discount is applied on top, it is taken from the already-reduced price, so two discounts combine to less than their sum. Sales tax, if you enter it, is added to the discounted price.',
    ],
    formula: [
      { label: 'Sale price', expression: 'Sale price = Price × (1 − Discount % ÷ 100)' },
      {
        label: 'With an extra discount',
        expression: 'Sale price = Price × (1 − D1 ÷ 100) × (1 − D2 ÷ 100)',
      },
      { label: 'Savings', expression: 'Savings = Price − Sale price' },
      { label: 'With tax', expression: 'Total = Sale price × (1 + Tax % ÷ 100)' },
    ],
    examples: [
      {
        title: '25% off a price of 85',
        values: { price: '85', discount: '25' },
        steps: ['You pay 100% − 25% = 75%', '85 × 0.75 = 63.75', 'Savings = 85 − 63.75 = 21.25'],
        expected: '63.75',
      },
      {
        title: '30% off, then an extra 20% off 100',
        values: { price: '100', discount: '30', extra: '20' },
        steps: [
          'After 30% off: 100 × 0.70 = 70',
          'After an extra 20% off: 70 × 0.80 = 56',
          'Total discount = 44%, not 50%',
        ],
        expected: '56.00',
      },
    ],
    faq: [
      {
        question: 'Is 20% off plus an extra 20% off the same as 40% off?',
        answer:
          'No. The second 20% comes off the already-reduced price, so you pay 0.8 × 0.8 = 64% of the original, a 36% discount in total.',
      },
      {
        question: 'How do I work out the original price from a sale price?',
        answer:
          'Divide the sale price by (1 − discount ÷ 100). A sale price of 60 after 25% off came from 60 ÷ 0.75 = 80.',
      },
      {
        question: 'Is sales tax charged on the original or the discounted price?',
        answer:
          'Usually on the discounted price for store discounts, but rules for coupons and rebates differ between places. The calculator applies tax to the discounted price.',
      },
    ],
  },
};
