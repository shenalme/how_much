import { describe, expect, it } from 'vitest';
import {
  acresNeeded,
  horsesSupported,
} from '../../calculators/animals/horse-pasture-calculator/calculator';
import { detail, result, run, u } from '../helpers';

describe('Horse Fence Calculator', () => {
  const base = {
    shape: 'rectangle',
    length: u('300', 'ft'),
    width: u('200', 'ft'),
    lines: '3',
    spacing: u('8', 'ft'),
    gates: '1',
    gateWidth: u('12', 'ft'),
  };

  it('calculates posts, rail length and area', async () => {
    const res = await result('horse-fence-calculator', base);
    expect(res.headline.value).toBe('988');
    expect(detail(res, 'posts')).toBe('125');
    expect(detail(res, '3 lines')).toBe('2,964 ft');
    expect(detail(res, 'enclosed area')).toBe('1.38 acres (0.56 ha)');
  });

  it('accepts a known perimeter in meters', async () => {
    const res = await result('horse-fence-calculator', {
      shape: 'perimeter',
      perimeter: u('400', 'm'),
      lines: '2',
      spacing: u('4', 'm'),
      gates: '0',
      gateWidth: u('3', 'm'),
    });
    expect(res.headline).toEqual({ value: '400', unit: 'm of fence line' });
    expect(detail(res, 'posts')).toBe('100');
    expect(detail(res, '2 lines')).toBe('800 m');
  });

  it('requires at least one line', async () => {
    expect(
      (await run('horse-fence-calculator', { ...base, lines: '0' })).errors.lines,
    ).toBeTruthy();
  });
});

describe('Horse Pasture Calculator', () => {
  it('applies each guideline', () => {
    expect(acresNeeded('standard', 3)).toBe(6);
    expect(acresNeeded('first-plus', 3)).toBe(4);
    expect(acresNeeded('first-plus', 1)).toBe(2);
    expect(acresNeeded('intensive', 3)).toBe(3);
    expect(acresNeeded('custom', 3, 2.5)).toBe(7.5);
  });

  it('works out how many horses land supports', () => {
    expect(horsesSupported('standard', 5)).toBe(2);
    expect(horsesSupported('first-plus', 5)).toBe(4);
    expect(horsesSupported('first-plus', 1.5)).toBe(0);
    expect(horsesSupported('intensive', 3)).toBe(3);
  });

  it('shows acres and hectares', async () => {
    const res = await result('horse-pasture-calculator', { horses: '3', guideline: 'standard' });
    expect(res.headline).toEqual({ value: '6', unit: 'acres' });
    expect(detail(res, 'hectares')).toBe('2.43');
  });

  it('uses hectares when the custom figure is metric', async () => {
    const res = await result('horse-pasture-calculator', {
      horses: '2',
      guideline: 'custom',
      perHorse: u('1', 'ha'),
    });
    expect(res.headline).toEqual({ value: '2', unit: 'hectares' });
  });

  it('compares with available land', async () => {
    const res = await result('horse-pasture-calculator', {
      horses: '3',
      guideline: 'standard',
      available: u('5', 'acre'),
    });
    expect(detail(res, 'horses your land supports')).toBe('2');
    expect(res.notes?.[0]).toMatch(/1 acres short/);
  });

  it('always states that this is a rule of thumb', async () => {
    const res = await result('horse-pasture-calculator', { horses: '1' });
    expect(res.notes?.join(' ')).toMatch(/rule of thumb/);
  });

  it('requires at least one horse', async () => {
    expect((await run('horse-pasture-calculator', { horses: '0' })).errors.horses).toBeTruthy();
  });
});

describe('Horse Feed Calculator', () => {
  it('calculates daily hay from body weight', async () => {
    const res = await result('horse-feed-calculator', {
      weight: u('1100', 'lb'),
      intake: '2',
      dryMatter: '90',
      horses: '1',
      days: '30',
      bale: u('50', 'lb'),
    });
    expect(res.headline.value).toBe('24.4');
    expect(detail(res, 'dry matter per horse')).toBe('22 lb');
    expect(detail(res, 'bales')).toBe('15');
  });

  it('scales by horses and days', async () => {
    const res = await result('horse-feed-calculator', {
      weight: u('1000', 'lb'),
      intake: '2',
      dryMatter: '100',
      horses: '2',
      days: '150',
      bale: u('', 'lb'),
    });
    expect(detail(res, '150 days')).toBe('6,000 lb');
    expect(res.details?.some((d) => d.label === 'Bales')).toBe(false);
  });

  it('works in kilograms', async () => {
    const res = await result('horse-feed-calculator', {
      weight: u('500', 'kg'),
      intake: '2',
      dryMatter: '90',
    });
    expect(res.headline.unit).toMatch(/^kg/);
    expect(res.headline.value).toBe('11.1');
  });

  it('rejects implausible intake percentages', async () => {
    expect((await run('horse-feed-calculator', { intake: '12' })).errors.intake).toBeTruthy();
    expect((await run('horse-feed-calculator', { dryMatter: '20' })).errors.dryMatter).toBeTruthy();
  });
});
