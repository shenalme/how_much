import { CalcInputError } from '../../engine';
import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatMoney, formatNumber } from '../../../utils/format';

/** Standard fixed-rate amortizing payment. */
export function monthlyPayment(
  principal: number,
  annualRatePercent: number,
  years: number,
): number {
  const n = years * 12;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - (1 + r) ** -n);
}

export const calculator: CalculatorDefinition = {
  slug: 'mortgage-calculator',
  intro:
    'Enter the price, down payment, rate and term to estimate your monthly payment and the total interest over the life of the loan.',
  fields: [
    { id: 'price', kind: 'number', label: 'Home price', default: '400000', exclusiveMin: true },
    {
      id: 'downType',
      kind: 'select',
      label: 'Down payment as',
      options: [
        { value: 'percent', label: 'Percentage of price' },
        { value: 'amount', label: 'Amount' },
      ],
      default: 'percent',
    },
    {
      id: 'downPercent',
      kind: 'number',
      label: 'Down payment',
      default: '20',
      suffix: '%',
      max: 100,
      showWhen: { field: 'downType', equals: ['percent'] },
    },
    {
      id: 'downAmount',
      kind: 'number',
      label: 'Down payment',
      default: '80000',
      showWhen: { field: 'downType', equals: ['amount'] },
    },
    {
      id: 'rate',
      kind: 'number',
      label: 'Interest rate (annual)',
      default: '6.5',
      suffix: '%',
      max: 100,
    },
    {
      id: 'years',
      kind: 'select',
      label: 'Loan term',
      options: [
        { value: '30', label: '30 years' },
        { value: '25', label: '25 years' },
        { value: '20', label: '20 years' },
        { value: '15', label: '15 years' },
        { value: '10', label: '10 years' },
      ],
      default: '30',
    },
    { id: 'tax', kind: 'number', label: 'Property tax per year', default: '', optional: true },
    {
      id: 'insurance',
      kind: 'number',
      label: 'Home insurance per year',
      default: '',
      optional: true,
    },
    {
      id: 'hoa',
      kind: 'number',
      label: 'HOA or service fees per month',
      default: '',
      optional: true,
    },
  ],
  calculate(inputs) {
    const price = inputs.num('price');
    const down =
      inputs.select('downType') === 'amount'
        ? inputs.num('downAmount')
        : (price * inputs.num('downPercent')) / 100;
    const principal = price - down;
    if (principal <= 0) {
      throw new CalcInputError(
        'The down payment covers the whole price, so there is nothing to borrow.',
        inputs.select('downType') === 'amount' ? 'downAmount' : 'downPercent',
      );
    }
    const years = Number(inputs.select('years'));
    const rate = inputs.num('rate');
    const payment = monthlyPayment(principal, rate, years);
    const extras =
      (inputs.optionalNum('tax') ?? 0) / 12 +
      (inputs.optionalNum('insurance') ?? 0) / 12 +
      (inputs.optionalNum('hoa') ?? 0);
    const totalPaid = payment * years * 12;
    const interest = totalPaid - principal;

    const details: ResultDetail[] = [
      { label: 'Loan amount', value: formatMoney(principal) },
      {
        label: 'Down payment',
        value: `${formatMoney(down)} (${formatNumber((down / price) * 100, 2)}%)`,
      },
      { label: 'Principal and interest per month', value: formatMoney(payment) },
    ];
    if (extras > 0) {
      details.push(
        { label: 'Taxes, insurance and fees per month', value: formatMoney(extras) },
        { label: 'Total per month', value: formatMoney(payment + extras) },
      );
    }
    details.push(
      { label: 'Total interest', value: formatMoney(interest) },
      { label: 'Total of all loan payments', value: formatMoney(totalPaid) },
    );

    const monthly = payment + extras;
    return {
      headline: { value: formatMoney(monthly), unit: 'per month' },
      summary: `Your estimated monthly payment is ${formatMoney(monthly)}${extras > 0 ? ' including taxes, insurance and fees' : ' for principal and interest'}.`,
      details,
      notes: [
        down / price < 0.2
          ? 'With less than 20% down, many lenders require mortgage insurance, which is not included here.'
          : 'Lender fees, closing costs and mortgage insurance are not included.',
        'An estimate for planning, not financial advice or a loan offer.',
      ],
    };
  },
  content: {
    howItWorks: [
      'A fixed-rate mortgage is repaid in equal monthly payments. Each payment covers that month’s interest and repays part of the loan. The standard amortization formula finds the payment that brings the balance to exactly zero at the end of the term.',
      'The annual rate is divided by 12 to get the monthly rate, and the term in years is multiplied by 12 to get the number of payments. Property tax, insurance and HOA fees, if entered, are added on top as monthly amounts.',
    ],
    formula: [
      { label: 'Monthly payment', expression: 'M = P × r ÷ (1 − (1 + r)^−n)' },
      { label: 'Where', expression: 'P = loan amount, r = annual rate ÷ 12 ÷ 100, n = years × 12' },
      { label: 'Total interest', expression: 'Interest = M × n − P' },
    ],
    assumptions: [
      'Fixed interest rate for the whole term, with monthly payments and no extra repayments.',
      'Mortgage insurance, closing costs and lender fees vary and are not included.',
      'This is a planning estimate, not financial advice. Compare official loan estimates from lenders.',
    ],
    examples: [
      {
        title: 'A 400,000 home with 20% down at 6.5% over 30 years',
        values: {
          price: '400000',
          downType: 'percent',
          downPercent: '20',
          rate: '6.5',
          years: '30',
        },
        steps: [
          'Loan = 400,000 − 80,000 = 320,000',
          'r = 6.5 ÷ 12 ÷ 100 = 0.0054167; n = 360',
          'M = 320,000 × 0.0054167 ÷ (1 − 1.0054167^−360) = 2,022.62',
        ],
        expected: '2,022.62',
      },
    ],
    faq: [
      {
        question: 'How much does a 1% lower interest rate save?',
        answer:
          'On a 320,000 loan over 30 years, going from 6.5% to 5.5% lowers the monthly payment from about 2,022.62 to 1,816.92, saving roughly 74,000 in interest over the term.',
      },
      {
        question: 'Should I choose a 15 or 30 year term?',
        answer:
          'A 15 year loan has higher monthly payments but far less total interest. A 30 year loan is more affordable month to month. Try both in the calculator to compare.',
      },
      {
        question: 'Does this include property tax and insurance?',
        answer:
          'Only if you enter them. They are added to the monthly payment as one twelfth of the yearly amounts.',
      },
    ],
  },
};
