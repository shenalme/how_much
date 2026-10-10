import { CalcInputError } from '../../engine';
import type { CalculatorDefinition } from '../../types';
import { formatMoney, formatNumber } from '../../../utils/format';

export function marginFigures(cost: number, price: number) {
  const profit = price - cost;
  return {
    profit,
    margin: price !== 0 ? (profit / price) * 100 : 0,
    markup: cost !== 0 ? (profit / cost) * 100 : null,
  };
}

export function priceForMargin(cost: number, marginPercent: number): number {
  return cost / (1 - marginPercent / 100);
}

export const calculator: CalculatorDefinition = {
  slug: 'profit-margin-calculator',
  intro:
    'Find your profit, margin and markup from cost and price, or work out what to charge to hit a target margin.',
  fields: [
    {
      id: 'mode',
      kind: 'select',
      label: 'What do you know?',
      options: [
        { value: 'price', label: 'Cost and selling price' },
        { value: 'margin', label: 'Cost and the margin I want' },
      ],
      default: 'price',
      wide: true,
    },
    { id: 'cost', kind: 'number', label: 'Cost', default: '60' },
    {
      id: 'price',
      kind: 'number',
      label: 'Selling price',
      default: '100',
      exclusiveMin: true,
      showWhen: { field: 'mode', equals: ['price'] },
    },
    {
      id: 'targetMargin',
      kind: 'number',
      label: 'Target margin',
      default: '40',
      suffix: '%',
      max: 99.99,
      showWhen: { field: 'mode', equals: ['margin'] },
    },
  ],
  calculate(inputs) {
    const cost = inputs.num('cost');
    let price: number;
    if (inputs.select('mode') === 'margin') {
      const target = inputs.num('targetMargin');
      if (target >= 100) throw new CalcInputError('A margin must be below 100%.', 'targetMargin');
      price = priceForMargin(cost, target);
    } else {
      price = inputs.num('price');
    }
    const { profit, margin, markup } = marginFigures(cost, price);
    const marginMode = inputs.select('mode') === 'margin';

    return {
      headline: marginMode
        ? { value: formatMoney(price), unit: 'selling price' }
        : { value: formatNumber(margin, 2), unit: '% margin' },
      summary: marginMode
        ? `Sell at ${formatMoney(price)} for a ${formatNumber(margin, 2)}% margin (${formatMoney(profit)} profit).`
        : `A cost of ${formatMoney(cost)} and price of ${formatMoney(price)} gives ${formatMoney(profit)} profit: a ${formatNumber(margin, 2)}% margin${markup !== null ? ` and ${formatNumber(markup, 2)}% markup` : ''}.`,
      details: [
        { label: 'Selling price', value: formatMoney(price) },
        { label: 'Cost', value: formatMoney(cost) },
        { label: 'Profit', value: formatMoney(profit) },
        { label: 'Margin', value: `${formatNumber(margin, 2)}%` },
        {
          label: 'Markup',
          value: markup === null ? 'Undefined (cost is 0)' : `${formatNumber(markup, 2)}%`,
        },
      ],
      notes: profit < 0 ? ['The price is below cost, so this sale makes a loss.'] : undefined,
    };
  },
  content: {
    howItWorks: [
      'Profit is the selling price minus the cost. Margin expresses that profit as a percentage of the selling price; markup expresses it as a percentage of the cost. The same sale always has a higher markup than margin.',
      'To find the price for a target margin, divide the cost by (1 − margin). Adding the margin percentage to the cost (a common mistake) produces a markup, not a margin, and underprices the product.',
    ],
    formula: [
      { label: 'Profit', expression: 'Profit = Price − Cost' },
      { label: 'Margin', expression: 'Margin % = Profit ÷ Price × 100' },
      { label: 'Markup', expression: 'Markup % = Profit ÷ Cost × 100' },
      { label: 'Price for a margin', expression: 'Price = Cost ÷ (1 − Margin % ÷ 100)' },
    ],
    assumptions: [
      'Cost here means the direct cost of the item (gross margin). Overheads, taxes and fees are not included.',
    ],
    examples: [
      {
        title: 'Cost 60, price 100',
        values: { mode: 'price', cost: '60', price: '100' },
        steps: ['Profit = 100 − 60 = 40', 'Margin = 40 ÷ 100 = 40%', 'Markup = 40 ÷ 60 = 66.67%'],
        expected: '40',
      },
      {
        title: 'The price for a 40% margin on a cost of 60',
        values: { mode: 'margin', cost: '60', targetMargin: '40' },
        steps: ['Price = 60 ÷ (1 − 0.40)', 'Price = 60 ÷ 0.60 = 100'],
        expected: '100.00',
      },
    ],
    faq: [
      {
        question: 'What is the difference between margin and markup?',
        answer:
          'Both use the same profit, but margin divides it by the price and markup divides it by the cost. Buying at 60 and selling at 100 is a 40% margin and a 66.67% markup.',
      },
      {
        question: 'How do I convert markup to margin?',
        answer: 'Margin = Markup ÷ (1 + Markup). A 50% markup is 0.5 ÷ 1.5 = 33.33% margin.',
      },
      {
        question: 'Can a margin be more than 100%?',
        answer:
          'No. Margin is a share of the price, so it is always below 100%. Markup has no upper limit.',
      },
    ],
  },
};
