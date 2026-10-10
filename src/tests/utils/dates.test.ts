import { describe, expect, it } from 'vitest';
import {
  addMonths,
  countWeekdays,
  dayOfWeek,
  diffDays,
  diffYMD,
  isLeapYear,
  parseISODate,
  todayISO,
  type YMD,
} from '../../utils/dates';

const d = (text: string): YMD => {
  const parsed = parseISODate(text);
  if (!parsed) throw new Error(text);
  return parsed;
};

describe('dates', () => {
  it('validates real dates', () => {
    expect(parseISODate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseISODate('2023-02-29')).toBeNull();
    expect(parseISODate('2026-13-01')).toBeNull();
    expect(parseISODate('26-01-01')).toBeNull();
  });

  it('knows leap years', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
  });

  it('counts days across years and leap days', () => {
    expect(diffDays(d('2024-01-01'), d('2025-01-01'))).toBe(366);
    expect(diffDays(d('2025-01-01'), d('2026-01-01'))).toBe(365);
    expect(diffDays(d('2026-03-01'), d('2026-02-01'))).toBe(-28);
    expect(diffDays(d('0099-01-01'), d('0100-01-01'))).toBe(365);
  });

  it('is not affected by daylight saving changes', () => {
    expect(diffDays(d('2026-03-28'), d('2026-03-30'))).toBe(2);
    expect(diffDays(d('2026-10-24'), d('2026-10-26'))).toBe(2);
  });

  it('clamps month addition', () => {
    expect(addMonths(d('2026-01-31'), 1)).toEqual({ year: 2026, month: 2, day: 28 });
    expect(addMonths(d('2024-01-31'), 1)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(addMonths(d('2026-11-15'), 3)).toEqual({ year: 2027, month: 2, day: 15 });
  });

  it('splits differences into years, months and days', () => {
    expect(diffYMD(d('1990-05-15'), d('2026-10-10'))).toEqual({ years: 36, months: 4, days: 25 });
    expect(diffYMD(d('2026-01-31'), d('2026-03-01'))).toEqual({ years: 0, months: 1, days: 1 });
    expect(diffYMD(d('2026-05-05'), d('2026-05-05'))).toEqual({ years: 0, months: 0, days: 0 });
    expect(() => diffYMD(d('2026-05-06'), d('2026-05-05'))).toThrow();
  });

  it('finds the day of the week', () => {
    expect(dayOfWeek(d('1970-01-01'))).toBe(4);
    expect(dayOfWeek(d('2026-10-10'))).toBe(6);
    expect(dayOfWeek(d('1900-01-01'))).toBe(1);
  });

  it('counts weekdays', () => {
    expect(countWeekdays(d('2026-10-05'), d('2026-10-12'))).toEqual({
      weekdays: 5,
      weekendDays: 2,
      total: 7,
    });
    expect(countWeekdays(d('2026-10-10'), d('2026-10-11'), true)).toEqual({
      weekdays: 0,
      weekendDays: 2,
      total: 2,
    });
  });

  it('formats today in local time', () => {
    expect(todayISO(new Date(2026, 9, 10, 23, 59))).toBe('2026-10-10');
  });
});
