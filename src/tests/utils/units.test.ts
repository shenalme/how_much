import { describe, expect, it } from 'vitest';
import { convert, getUnit, isMetric, UNITS } from '../../utils/units';

describe('units', () => {
  it('uses exact international definitions', () => {
    expect(convert(1, 'in', 'cm')).toBeCloseTo(2.54, 12);
    expect(convert(1, 'ft', 'm')).toBe(0.3048);
    expect(convert(1, 'yd', 'ft')).toBeCloseTo(3, 12);
    expect(convert(1, 'mi', 'ft')).toBeCloseTo(5280, 9);
    expect(convert(1, 'lb', 'kg')).toBe(0.45359237);
    expect(convert(1, 'lb', 'oz')).toBeCloseTo(16, 12);
    expect(convert(1, 'acre', 'ft2')).toBeCloseTo(43560, 8);
    expect(convert(1, 'ha', 'm2')).toBe(10000);
    expect(convert(1, 'yd3', 'ft3')).toBeCloseTo(27, 12);
    expect(convert(1, 'galUS', 'in3')).toBeCloseTo(231, 9);
    expect(convert(1, 'galUK', 'l')).toBeCloseTo(4.54609, 12);
    expect(convert(1, 'ton', 'lb')).toBeCloseTo(2000, 9);
    expect(convert(60, 'mph', 'kmh')).toBeCloseTo(96.56064, 9);
  });

  it('converts temperatures with offsets', () => {
    expect(convert(212, 'f', 'c')).toBeCloseTo(100, 12);
    expect(convert(-40, 'c', 'f')).toBeCloseTo(-40, 12);
    expect(convert(0, 'k', 'c')).toBeCloseTo(-273.15, 12);
    expect(convert(32, 'f', 'k')).toBeCloseTo(273.15, 12);
  });

  it('round-trips every unit through its base', () => {
    for (const unit of Object.values(UNITS)) {
      expect(unit.fromBase(unit.toBase(123.456)), unit.id).toBeCloseTo(123.456, 9);
    }
  });

  it('refuses to convert between dimensions', () => {
    expect(() => convert(1, 'ft', 'kg')).toThrow(/Cannot convert/);
    expect(() => getUnit('furlong')).toThrow(/Unknown unit/);
  });

  it('knows which units are metric', () => {
    expect(isMetric('cm')).toBe(true);
    expect(isMetric('ft')).toBe(false);
  });
});
