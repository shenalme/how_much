import { describe, expect, it } from 'vitest';
import { formatDuration, formatNumber, formatSignificant, round } from '../../utils/format';
import { parseNumber, parseNumberList } from '../../utils/parse';

describe('parseNumber', () => {
  it.each([
    ['12', 12],
    ['-3.5', -3.5],
    ['+4', 4],
    ['.5', 0.5],
    ['5.', 5],
    ['  7 ', 7],
    ['1,250', 1250],
    ['1,250,000.75', 1250000.75],
    ['2,5', 2.5],
    ['0,750', 0.75],
    ['1/2', 0.5],
    ['3 1/4', 3.25],
    ['-1 1/2', -1.5],
  ])('parses "%s"', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(['', 'abc', '1e5', '12abc', '1/0', '1,2,3', '1.2.3', '--1', 'Infinity', 'NaN'])(
    'rejects "%s"',
    (input) => {
      expect(parseNumber(input)).toBeNull();
    },
  );

  it('parses number lists', () => {
    expect(parseNumberList('1, 2;3\n4 5')).toEqual({ values: [1, 2, 3, 4, 5], invalid: [] });
    expect(parseNumberList('1, x, 3').invalid).toEqual(['x']);
  });
});

describe('formatting', () => {
  it('rounds half away from zero', () => {
    expect(formatNumber(2.345, 2)).toBe('2.35');
    expect(formatNumber(-2.345, 2)).toBe('-2.35');
    expect(formatNumber(2.5, 0)).toBe('3');
    expect(formatNumber(1.005, 2)).toBe('1.01');
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(-0.001, 2)).toBe(0);
  });

  it('adds separators and trims zeros', () => {
    expect(formatNumber(1234567.891, 2)).toBe('1,234,567.89');
    expect(formatNumber(3.1, 2)).toBe('3.1');
    expect(formatNumber(3.1, 2, 2)).toBe('3.10');
  });

  it('never shows negative zero or NaN', () => {
    expect(formatNumber(-0.0001, 2)).toBe('0');
    expect(formatNumber(NaN)).toBe('—');
    expect(formatNumber(Infinity)).toBe('—');
  });

  it('uses scientific notation only for enormous values', () => {
    expect(formatNumber(999_999_999_999)).toBe('999,999,999,999');
    expect(formatNumber(1e16)).toBe('1.000 × 10^16');
  });

  it('formats significant figures for converters', () => {
    expect(formatSignificant(3.280839895)).toBe('3.28084');
    expect(formatSignificant(0.0003937007874)).toBe('0.000393701');
    expect(formatSignificant(453592.37)).toBe('453,592');
    expect(formatSignificant(0)).toBe('0');
  });

  it('formats durations', () => {
    expect(formatDuration(4.75)).toBe('4 h 45 min');
    expect(formatDuration(0.5)).toBe('30 min');
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(25)).toBe('1 day 1 h');
  });
});
