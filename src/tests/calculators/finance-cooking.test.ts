import { describe, expect, it } from 'vitest';
import { monthlyPayment } from '../../calculators/finance/mortgage-calculator/calculator';
import { splitBill } from '../../calculators/finance/tip-calculator/calculator';
import {
  marginFigures,
  priceForMargin,
} from '../../calculators/business/profit-margin-calculator/calculator';
import {
  formatQuantity,
  parseQuantity,
  scaleLine,
} from '../../calculators/cooking/recipe-scaler/calculator';
import { detail, result, run } from '../helpers';

describe('Mortgage Calculator', () => {
  it('uses the standard amortization formula', () => {
    expect(monthlyPayment(320000, 6.5, 30)).toBeCloseTo(2022.62, 2);
    expect(monthlyPayment(200000, 5, 15)).toBeCloseTo(1581.59, 2);
  });

  it('handles a 0% rate', () => {
    expect(monthlyPayment(120000, 0, 10)).toBe(1000);
  });

  it('adds taxes, insurance and fees', async () => {
    const res = await result('mortgage-calculator', {
      price: '400000',
      downType: 'percent',
      downPercent: '20',
      rate: '6.5',
      years: '30',
      tax: '4800',
      insurance: '1200',
      hoa: '50',
    });
    expect(res.headline.value).toBe('2,572.62');
    expect(detail(res, 'total interest')).toBe('408,142.36');
  });

  it('accepts the down payment as an amount', async () => {
    const res = await result('mortgage-calculator', {
      price: '300000',
      downType: 'amount',
      downAmount: '60000',
      rate: '0',
      years: '20',
    });
    expect(res.headline.value).toBe('1,000.00');
  });

  it('rejects a down payment covering the full price', async () => {
    expect(
      (await run('mortgage-calculator', { downPercent: '100' })).errors.downPercent,
    ).toBeTruthy();
  });

  it('mentions mortgage insurance below 20% down', async () => {
    expect((await result('mortgage-calculator', { downPercent: '10' })).notes?.[0]).toMatch(
      /mortgage insurance/,
    );
  });
});

describe('Tip Calculator', () => {
  it('calculates the tip and split', () => {
    expect(splitBill(50, 18, 2, false)).toEqual({ tip: 9, total: 59, perPerson: 29.5 });
  });

  it('rounds each share up', () => {
    const r = splitBill(47.3, 15, 3, true);
    expect(r.perPerson).toBe(19);
    expect(r.total).toBe(57);
    expect(r.tip).toBeCloseTo(9.7, 10);
  });

  it('shows the per-person amount', async () => {
    const res = await result('tip-calculator', { bill: '50', tip: '18', people: '2', round: 'no' });
    expect(detail(res, 'per person')).toBe('29.50');
  });

  it('allows a zero tip', async () => {
    expect((await result('tip-calculator', { tip: '0' })).headline.value).toBe('0.00');
  });
});

describe('Profit Margin Calculator', () => {
  it('distinguishes margin and markup', () => {
    const r = marginFigures(60, 100);
    expect(r.profit).toBe(40);
    expect(r.margin).toBe(40);
    expect(r.markup).toBeCloseTo(66.6667, 4);
    expect(marginFigures(0, 10).markup).toBeNull();
  });

  it('finds the price for a target margin', async () => {
    expect(priceForMargin(60, 40)).toBeCloseTo(100, 10);
    const res = await result('profit-margin-calculator', {
      mode: 'margin',
      cost: '75',
      targetMargin: '25',
    });
    expect(res.headline.value).toBe('100.00');
  });

  it('flags a loss', async () => {
    const res = await result('profit-margin-calculator', {
      mode: 'price',
      cost: '120',
      price: '100',
    });
    expect(res.headline.value).toBe('-20');
    expect(res.notes?.[0]).toMatch(/loss/);
  });

  it('rejects a margin of 100% or more', async () => {
    expect(
      (await run('profit-margin-calculator', { mode: 'margin', targetMargin: '100' })).errors
        .targetMargin,
    ).toBeTruthy();
  });
});

describe('Recipe Scaler', () => {
  it('parses quantities', () => {
    expect(parseQuantity('2')).toBe(2);
    expect(parseQuantity('1 1/2')).toBe(1.5);
    expect(parseQuantity('3/4')).toBe(0.75);
    expect(parseQuantity('½')).toBe(0.5);
    expect(parseQuantity('1½')).toBe(1.5);
    expect(parseQuantity('.5')).toBe(0.5);
  });

  it('formats kitchen fractions', () => {
    expect(formatQuantity(2.25)).toBe('2 1/4');
    expect(formatQuantity(1 / 3)).toBe('1/3');
    expect(formatQuantity(0.375)).toBe('3/8');
    expect(formatQuantity(4)).toBe('4');
    expect(formatQuantity(1.37)).toBe('1.37');
    expect(formatQuantity(1.999)).toBe('2');
  });

  it('scales lines, ranges and bullets', () => {
    expect(scaleLine('2 cups flour', 1.5).text).toBe('3 cups flour');
    expect(scaleLine('1 1/2 tsp salt', 1.5).text).toBe('2 1/4 tsp salt');
    expect(scaleLine('2-3 tbsp butter', 2).text).toBe('4-6 tbsp butter');
    expect(scaleLine('- ½ cup milk', 0.5).text).toBe('- 1/4 cup milk');
    expect(scaleLine('Salt to taste', 2)).toEqual({ text: 'Salt to taste', scaled: false });
  });

  it('scales a whole recipe', async () => {
    const res = await result('recipe-scaler', {
      original: '4',
      desired: '2',
      ingredients: '2 cups flour\n3 eggs\nPinch of salt',
    });
    expect(res.headline.value).toBe('× 0.5');
    expect(res.lines).toEqual(['1 cups flour', '1 1/2 eggs', 'Pinch of salt']);
    expect(res.notes?.[0]).toMatch(/1 line has no quantity/);
  });

  it('rejects zero servings', async () => {
    expect((await run('recipe-scaler', { original: '0' })).errors.original).toBeTruthy();
  });
});
