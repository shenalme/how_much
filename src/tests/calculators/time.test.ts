import { describe, expect, it } from 'vitest';
import { describeDifference } from '../../calculators/time/date-difference-calculator/calculator';
import { detail, result, run } from '../helpers';

describe('Age in Days Calculator', () => {
  it('counts days including leap days', async () => {
    const res = await result('age-in-days-calculator', { birth: '1990-05-15', on: '2026-10-10' });
    expect(res.headline.value).toBe('13,297');
    expect(detail(res, 'weeks')).toBe('1,899 weeks and 4 days');
  });

  it('gives milestone dates', async () => {
    const res = await result('age-in-days-calculator', { birth: '2000-01-01', on: '2000-01-01' });
    expect(res.headline.value).toBe('0');
    expect(detail(res, '1,000 days old on')).toBe('September 27, 2002 (in 1,000 days)');
    expect(detail(res, '10,000 days old on')).toBe('May 19, 2027 (in 10,000 days)');
  });

  it('rejects a birth date after the count-to date', async () => {
    expect(
      (await run('age-in-days-calculator', { birth: '2027-01-01', on: '2026-01-01' })).errors.birth,
    ).toBeTruthy();
  });
});

describe('Date Difference Calculator', () => {
  it('splits into years, months and days', async () => {
    const res = await result('date-difference-calculator', {
      start: '2024-01-31',
      end: '2025-03-01',
      inclusive: 'no',
    });
    expect(`${res.headline.value} ${res.headline.unit}`).toBe('1 year, 1 month, 1 day');
    expect(detail(res, 'total days')).toBe('395');
  });

  it('counts the end date when asked', async () => {
    const res = await result('date-difference-calculator', {
      start: '2026-01-01',
      end: '2026-01-31',
      inclusive: 'yes',
    });
    expect(`${res.headline.value} ${res.headline.unit}`).toBe('1 month');
    expect(detail(res, 'total days')).toBe('31');
  });

  it('swaps reversed dates', async () => {
    const res = await result('date-difference-calculator', {
      start: '2026-10-10',
      end: '2026-01-01',
      inclusive: 'no',
    });
    expect(detail(res, 'total days')).toBe('282');
    expect(res.notes?.[0]).toMatch(/swapped/);
  });

  it('handles identical dates', async () => {
    const res = await result('date-difference-calculator', {
      start: '2026-05-05',
      end: '2026-05-05',
      inclusive: 'no',
    });
    expect(`${res.headline.value} ${res.headline.unit}`).toBe('0 days');
  });

  it('describes differences compactly', () => {
    expect(describeDifference(2, 0, 3)).toEqual({ value: '2', unit: 'years, 3 days' });
    expect(describeDifference(0, 0, 1)).toEqual({ value: '1', unit: 'day' });
    expect(describeDifference(1500, 0, 0)).toEqual({ value: '1,500', unit: 'years' });
  });
});

describe('Days Between Dates Calculator', () => {
  it('counts days and weekdays', async () => {
    const res = await result('days-between-dates-calculator', {
      start: '2026-12-01',
      end: '2026-12-25',
      inclusive: 'no',
    });
    expect(res.headline.value).toBe('24');
    expect(detail(res, 'weekdays')).toBe('18');
    expect(detail(res, 'weekend')).toBe('6');
  });

  it('includes the end date when asked', async () => {
    const res = await result('days-between-dates-calculator', {
      start: '2026-10-05',
      end: '2026-10-09',
      inclusive: 'yes',
    });
    expect(res.headline.value).toBe('5');
    expect(detail(res, 'weekdays')).toBe('5'); // Mon to Fri
  });

  it('counts across a leap day', async () => {
    expect(
      (
        await result('days-between-dates-calculator', {
          start: '2024-02-28',
          end: '2024-03-01',
          inclusive: 'no',
        })
      ).headline.value,
    ).toBe('2');
    expect(
      (
        await result('days-between-dates-calculator', {
          start: '2023-02-28',
          end: '2023-03-01',
          inclusive: 'no',
        })
      ).headline.value,
    ).toBe('1');
  });

  it('handles long ranges', async () => {
    expect(
      (
        await result('days-between-dates-calculator', {
          start: '1900-01-01',
          end: '2100-01-01',
          inclusive: 'no',
        })
      ).headline.value,
    ).toBe('73,049');
  });
});
