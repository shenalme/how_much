import { describe, expect, it } from 'vitest';
import { statistics } from '../../calculators/math/average-calculator/calculator';
import { applyDiscounts } from '../../calculators/math/discount-calculator/calculator';
import { simplifyRatio } from '../../calculators/math/ratio-calculator/calculator';
import { nextBirthday } from '../../calculators/math/age-calculator/calculator';
import { parseISODate } from '../../utils/dates';
import { detail, result, run } from '../helpers';

describe('Percentage Calculator', () => {
  it('finds X% of Y', async () => {
    expect(
      (await result('percentage-calculator', { mode: 'of', ofPercent: '15', ofValue: '80' }))
        .headline.value,
    ).toBe('12');
    expect(
      (await result('percentage-calculator', { mode: 'of', ofPercent: '0', ofValue: '80' }))
        .headline.value,
    ).toBe('0');
    expect(
      (await result('percentage-calculator', { mode: 'of', ofPercent: '12.5', ofValue: '1000000' }))
        .headline.value,
    ).toBe('125,000');
  });

  it('finds what percent X is of Y, rounding to 4 decimals', async () => {
    expect(
      (await result('percentage-calculator', { mode: 'is', isPart: '30', isWhole: '120' })).headline
        .value,
    ).toBe('25');
    expect(
      (await result('percentage-calculator', { mode: 'is', isPart: '1', isWhole: '3' })).headline
        .value,
    ).toBe('33.3333');
  });

  it('calculates increases and decreases', async () => {
    expect(
      (await result('percentage-calculator', { mode: 'change', changeFrom: '50', changeTo: '65' }))
        .headline.value,
    ).toBe('+30');
    const down = await result('percentage-calculator', {
      mode: 'change',
      changeFrom: '65',
      changeTo: '50',
    });
    expect(down.headline.value).toBe('-23.0769');
    expect(down.summary).toMatch(/decrease of 23.0769%/);
  });

  it('uses the absolute starting value for negative numbers', async () => {
    const res = await result('percentage-calculator', {
      mode: 'change',
      changeFrom: '-50',
      changeTo: '-25',
    });
    expect(res.headline.value).toBe('+50');
  });

  it('finds the whole from a part', async () => {
    expect(
      (
        await result('percentage-calculator', {
          mode: 'whole',
          wholePart: '45',
          wholePercent: '30',
        })
      ).headline.value,
    ).toBe('150');
  });

  it('reports division by zero as an input error', async () => {
    expect(
      (await run('percentage-calculator', { mode: 'is', isPart: '5', isWhole: '0' })).errors
        .isWhole,
    ).toBeTruthy();
    expect(
      (await run('percentage-calculator', { mode: 'change', changeFrom: '0', changeTo: '5' }))
        .errors.changeFrom,
    ).toBeTruthy();
    expect(
      (await run('percentage-calculator', { mode: 'whole', wholePart: '5', wholePercent: '0' }))
        .errors.wholePercent,
    ).toBeTruthy();
  });
});

describe('Discount Calculator', () => {
  it('applies a single discount', () => {
    const r = applyDiscounts(85, 25);
    expect(r.final).toBeCloseTo(63.75, 10);
    expect(r.savings).toBeCloseTo(21.25, 10);
  });

  it('stacks discounts multiplicatively', async () => {
    const res = await result('discount-calculator', { price: '100', discount: '20', extra: '20' });
    expect(res.headline.value).toBe('64.00');
    expect(detail(res, 'total savings')).toBe('36.00 (36%)');
  });

  it('adds tax to the discounted price', async () => {
    const res = await result('discount-calculator', { price: '100', discount: '10', tax: '8.25' });
    expect(res.headline.value).toBe('97.43'); // 90 × 1.0825 = 97.425
  });

  it('handles 0% and 100% discounts', async () => {
    expect(
      (await result('discount-calculator', { price: '50', discount: '0' })).headline.value,
    ).toBe('50.00');
    expect(
      (await result('discount-calculator', { price: '50', discount: '100' })).headline.value,
    ).toBe('0.00');
    expect(
      (await run('discount-calculator', { price: '50', discount: '101' })).errors.discount,
    ).toBeTruthy();
  });
});

describe('Ratio Calculator', () => {
  it('solves proportions', async () => {
    expect(
      (await result('ratio-calculator', { mode: 'solve', a: '3', b: '4', c: '9' })).headline.value,
    ).toBe('12');
    expect(
      (await result('ratio-calculator', { mode: 'solve', a: '16', b: '9', c: '1920' })).headline
        .value,
    ).toBe('1,080');
  });

  it('simplifies ratios, including decimals', () => {
    expect(simplifyRatio(12, 18)).toEqual([2, 3]);
    expect(simplifyRatio(1.5, 2.5)).toEqual([3, 5]);
    expect(simplifyRatio(1920, 1080)).toEqual([16, 9]);
    expect(simplifyRatio(7, 7)).toEqual([1, 1]);
  });

  it('splits a total', async () => {
    const res = await result('ratio-calculator', {
      mode: 'divide',
      total: '100',
      partA: '2',
      partB: '3',
    });
    expect(res.headline.value).toBe('40 and 60');
    expect(
      (await result('ratio-calculator', { mode: 'divide', total: '10', partA: '1', partB: '2' }))
        .headline.value,
    ).toBe('3.3333 and 6.6667');
  });

  it('rejects a zero first term', async () => {
    expect(
      (await run('ratio-calculator', { mode: 'solve', a: '0', b: '4', c: '9' })).errors.a,
    ).toBeTruthy();
  });
});

describe('Average Calculator', () => {
  it('computes mean, median and mode', () => {
    const s = statistics([4, 8, 15, 16, 23, 42]);
    expect(s.mean).toBe(18);
    expect(s.median).toBe(15.5);
    expect(s.modes).toEqual([]);
    expect(statistics([3, 1, 2]).median).toBe(2);
    expect(statistics([1, 2, 2, 3, 3]).modes).toEqual([2, 3]);
  });

  it('computes standard deviations', () => {
    const s = statistics([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(s.populationSd).toBe(2);
    expect(s.sampleSd).toBeCloseTo(2.13809, 5);
    expect(statistics([5]).sampleSd).toBeNull();
  });

  it('parses mixed separators and decimals', async () => {
    const res = await result('average-calculator', { values: '1.5\n2.5; 3  4,5' });
    expect(res.headline.value).toBe('3.2');
    expect(detail(res, 'count')).toBe('5');
  });

  it('handles negatives and zeros', async () => {
    expect((await result('average-calculator', { values: '-10, 0, 10' })).headline.value).toBe('0');
  });

  it('lists invalid entries', async () => {
    const evaluation = await run('average-calculator', { values: '1, two, 3' });
    expect(evaluation.errors.values).toMatch(/“two”/);
  });
});

describe('Age Calculator', () => {
  it('calculates years, months and days', async () => {
    const res = await result('age-calculator', { birth: '1990-05-15', on: '2026-10-10' });
    expect(res.headline).toEqual({ value: '36', unit: 'years old' });
    expect(res.summary).toBe('The age is 36 years, 4 months and 25 days.');
    expect(detail(res, 'total days')).toBe('13,297');
  });

  it('turns a year older on the birthday itself', async () => {
    expect(
      (await result('age-calculator', { birth: '2000-10-10', on: '2026-10-10' })).headline.value,
    ).toBe('26');
    expect(
      (await result('age-calculator', { birth: '2000-10-11', on: '2026-10-10' })).headline.value,
    ).toBe('25');
  });

  it('handles 29 February birthdays', async () => {
    expect(
      (await result('age-calculator', { birth: '2004-02-29', on: '2025-02-28' })).headline.value,
    ).toBe('21');
    expect(
      (await result('age-calculator', { birth: '2004-02-29', on: '2025-02-27' })).headline.value,
    ).toBe('20');
    const next = nextBirthday(parseISODate('2004-02-29')!, parseISODate('2025-03-01')!);
    expect(next).toEqual({ year: 2026, month: 2, day: 28 });
  });

  it('shows the next birthday', async () => {
    const res = await result('age-calculator', { birth: '1990-05-15', on: '2026-10-10' });
    expect(detail(res, 'next birthday')).toBe('May 15, 2027, in 217 days');
  });

  it('rejects a birth date in the future and invalid dates', async () => {
    expect(
      (await run('age-calculator', { birth: '2030-01-01', on: '2026-10-10' })).errors.birth,
    ).toBeTruthy();
    expect((await run('age-calculator', { birth: '2023-02-29' })).errors.birth).toBeTruthy();
  });
});
