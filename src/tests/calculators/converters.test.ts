import { describe, expect, it } from 'vitest';
import { feetAndInches } from '../../calculators/shared/feetInches';
import { detail, result, run } from '../helpers';

const cases: [string, string, string][] = [
  ['feet-to-meters', '1', '0.3048'],
  ['feet-to-meters', '10', '3.048'],
  ['meters-to-feet', '1', '3.28084'],
  ['meters-to-feet', '0.3048', '1'],
  ['inches-to-centimeters', '1', '2.54'],
  ['inches-to-centimeters', '3 1/2', '8.89'],
  ['centimeters-to-inches', '2.54', '1'],
  ['centimeters-to-inches', '100', '39.3701'],
  ['pounds-to-kilograms', '1', '0.453592'],
  ['pounds-to-kilograms', '50', '22.6796'],
  ['kilograms-to-pounds', '1', '2.20462'],
  ['kilograms-to-pounds', '0.45359237', '1'],
  ['acres-to-hectares', '1', '0.404686'],
  ['hectares-to-acres', '1', '2.47105'],
  ['fahrenheit-to-celsius', '32', '0'],
  ['fahrenheit-to-celsius', '212', '100'],
  ['fahrenheit-to-celsius', '-40', '-40'],
  ['fahrenheit-to-celsius', '98.6', '37'],
  ['celsius-to-fahrenheit', '100', '212'],
  ['celsius-to-fahrenheit', '-40', '-40'],
  ['celsius-to-fahrenheit', '37', '98.6'],
];

describe('unit converters', () => {
  it.each(cases)('%s: %s → %s', async (slug, input, expected) => {
    expect((await result(slug, { value: input })).headline.value).toBe(expected);
  });

  it('converts zero', async () => {
    expect((await result('feet-to-meters', { value: '0' })).headline.value).toBe('0');
    expect((await result('celsius-to-fahrenheit', { value: '0' })).headline.value).toBe('32');
  });

  it('rejects negative lengths but allows negative temperatures', async () => {
    expect((await run('feet-to-meters', { value: '-1' })).errors.value).toBeTruthy();
    expect((await run('fahrenheit-to-celsius', { value: '-1' })).errors.value).toBeUndefined();
  });

  it('formats very large values with separators', async () => {
    expect((await result('pounds-to-kilograms', { value: '1000000000' })).headline.value).toBe(
      '453,592,370',
    );
  });

  it('keeps precision for very small values', async () => {
    expect((await result('centimeters-to-inches', { value: '0.001' })).headline.value).toBe(
      '0.000393701',
    );
  });

  it('writes a readable summary with singular units', async () => {
    expect((await result('feet-to-meters', { value: '1' })).summary).toBe(
      '1 foot = 0.3048 meters.',
    );
  });

  it('shows feet and inches', async () => {
    expect(detail(await result('meters-to-feet', { value: '1.8' }), 'feet and inches')).toBe(
      '5 ft 10.87 in',
    );
    expect(detail(await result('centimeters-to-inches', { value: '170' }), 'feet and inches')).toBe(
      '5 ft 6.93 in',
    );
    expect(feetAndInches(0.3048 * 6)).toBe('6 ft 0 in');
  });

  it('shows pounds and ounces', async () => {
    expect(detail(await result('kilograms-to-pounds', { value: '1' }), 'ounces')).toBe(
      '2 lb 3.3 oz',
    );
  });

  it('accepts a decimal comma', async () => {
    expect((await result('feet-to-meters', { value: '2,5' })).headline.value).toBe('0.762');
  });
});
