import { describe, expect, it } from 'vitest';
import { fuelStops } from '../../calculators/automotive/road-trip-fuel-calculator/calculator';
import { economyFromLitersPerKm, litersPerKm } from '../../calculators/shared/fuel';
import { detail, result, run, u } from '../helpers';

describe('fuel economy conversions', () => {
  it('round-trips every unit', () => {
    for (const unit of ['mpgUS', 'mpgUK', 'l100km', 'kml'] as const) {
      const lpk = litersPerKm(25, unit);
      expect(economyFromLitersPerKm(lpk)[unit]).toBeCloseTo(25, 10);
    }
  });

  it('matches known conversions', () => {
    const e = economyFromLitersPerKm(litersPerKm(30, 'mpgUS'));
    expect(e.l100km).toBeCloseTo(7.8405, 4);
    expect(e.mpgUK).toBeCloseTo(36.0285, 3);
  });
});

describe('Fuel Cost Calculator', () => {
  const base = {
    distance: u('300', 'mi'),
    trip: 'one',
    economy: '30',
    economyUnit: 'mpgUS',
    price: '3.50',
    priceUnit: 'perGalUS',
  };

  it('calculates cost in US units', async () => {
    const res = await result('fuel-cost-calculator', base);
    expect(res.headline.value).toBe('35.00');
    expect(detail(res, 'cost per distance')).toBe('0.12 per mile');
  });

  it('doubles for a round trip', async () => {
    expect((await result('fuel-cost-calculator', { ...base, trip: 'round' })).headline.value).toBe(
      '70.00',
    );
  });

  it('mixes UK mpg with a price per liter', async () => {
    const res = await result('fuel-cost-calculator', {
      distance: u('100', 'mi'),
      trip: 'one',
      economy: '50',
      economyUnit: 'mpgUK',
      price: '1.50',
      priceUnit: 'perL',
    });
    expect(res.headline.value).toBe('13.64'); // 2 UK gal × 4.54609 L × 1.50
  });

  it('works with L/100 km and km', async () => {
    const res = await result('fuel-cost-calculator', {
      distance: u('450', 'km'),
      trip: 'one',
      economy: '6.5',
      economyUnit: 'l100km',
      price: '1.75',
      priceUnit: 'perL',
    });
    expect(res.headline.value).toBe('51.19');
  });

  it('rejects zero fuel economy', async () => {
    expect(
      (await run('fuel-cost-calculator', { ...base, economy: '0' })).errors.economy,
    ).toBeTruthy();
  });

  it('allows a zero price', async () => {
    expect((await result('fuel-cost-calculator', { ...base, price: '0' })).headline.value).toBe(
      '0.00',
    );
  });
});

describe('MPG Calculator', () => {
  it('reports US mpg for US gallons', async () => {
    const res = await result('mpg-calculator', {
      distance: u('350', 'mi'),
      fuel: u('11.2', 'galUS'),
    });
    expect(res.headline).toEqual({ value: '31.3', unit: 'mpg (US)' });
    expect(detail(res, 'liters per 100 km')).toBe('7.53');
  });

  it('reports UK mpg for UK gallons', async () => {
    const res = await result('mpg-calculator', {
      distance: u('400', 'mi'),
      fuel: u('10', 'galUK'),
    });
    expect(res.headline).toEqual({ value: '40', unit: 'mpg (UK)' });
  });

  it('reports L/100 km for liters', async () => {
    const res = await result('mpg-calculator', { distance: u('520', 'km'), fuel: u('36.4', 'l') });
    expect(res.headline).toEqual({ value: '7', unit: 'L/100 km' });
  });

  it('adds cost per mile when a price is given', async () => {
    const res = await result('mpg-calculator', {
      distance: u('300', 'mi'),
      fuel: u('10', 'galUS'),
      price: '3',
    });
    expect(detail(res, 'cost per mile')).toBe('0.10');
  });
});

describe('Road Trip Fuel Calculator', () => {
  it('splits the cost and counts fill-ups', async () => {
    const res = await result('road-trip-fuel-calculator', {
      distance: u('600', 'mi'),
      trip: 'one',
      economy: '25',
      economyUnit: 'mpgUS',
      price: '3.40',
      priceUnit: 'perGalUS',
      people: '3',
      tank: u('14', 'galUS'),
    });
    expect(res.headline.value).toBe('81.60');
    expect(detail(res, 'per person')).toBe('27.20');
    expect(detail(res, 'fill-ups')).toMatch(/^1 /);
  });

  it('counts fill-ups starting from a full tank', () => {
    expect(fuelStops(10, 14)).toBe(0);
    expect(fuelStops(14, 14)).toBe(0);
    expect(fuelStops(28.1, 14)).toBe(2);
  });
});

describe('Travel Time Calculator', () => {
  it('adds stops to driving time', async () => {
    const res = await result('travel-time-calculator', {
      distance: u('270', 'mi'),
      speed: u('60', 'mph'),
      stops: '1',
      stopMinutes: '15',
    });
    expect(res.headline.value).toBe('4 h 45 min');
  });

  it('mixes miles and km/h', async () => {
    const res = await result('travel-time-calculator', {
      distance: u('100', 'km'),
      speed: u('100', 'kmh'),
      stops: '0',
      stopMinutes: '0',
    });
    expect(res.headline.value).toBe('1 h');
  });

  it('shows days for very long trips', async () => {
    const res = await result('travel-time-calculator', {
      distance: u('3000', 'mi'),
      speed: u('50', 'mph'),
      stops: '0',
    });
    expect(res.headline.value).toBe('2 days 12 h');
  });

  it('rejects zero speed', async () => {
    expect(
      (await run('travel-time-calculator', { speed: u('0', 'mph') })).errors.speed,
    ).toBeTruthy();
  });
});
