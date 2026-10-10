import { describe, expect, it } from 'vitest';
import { deckMaterials } from '../../calculators/construction/deck-calculator/calculator';
import { detail, result, run, u } from '../helpers';

describe('Paint Calculator', () => {
  const room = {
    mode: 'room',
    length: u('12', 'ft'),
    width: u('10', 'ft'),
    height: u('8', 'ft'),
    ceiling: 'no',
    doors: '1',
    windows: '2',
    coats: '2',
    coverage: '350',
    coverageUnit: 'ft2gal',
  };

  it('calculates gallons for a room', async () => {
    const res = await result('paint-calculator', room);
    expect(res.headline).toEqual({ value: '1.72', unit: 'gallons' });
    expect(detail(res, 'area to paint')).toBe('301 ft² (28 m²)');
    expect(detail(res, 'gallon cans')).toBe('2 cans');
  });

  it('adds the ceiling', async () => {
    expect((await result('paint-calculator', { ...room, ceiling: 'yes' })).headline.value).toBe(
      '2.41',
    ); // 421 × 2 ÷ 350
  });

  it('works with metric coverage', async () => {
    const res = await result('paint-calculator', {
      mode: 'walls',
      wallArea: u('40', 'm2'),
      doors: '0',
      windows: '0',
      coats: '2',
      coverage: '10',
      coverageUnit: 'm2l',
    });
    expect(res.headline).toEqual({ value: '8', unit: 'liters' });
    expect(detail(res, 'tins')).toBe('4 tins');
  });

  it('rejects openings larger than the walls', async () => {
    const evaluation = await run('paint-calculator', { ...room, windows: '30' });
    expect(evaluation.errors.windows).toMatch(/more than the wall area/);
  });

  it('requires at least one coat', async () => {
    expect((await run('paint-calculator', { ...room, coats: '0' })).errors.coats).toBeTruthy();
  });
});

describe('Flooring Calculator', () => {
  const base = {
    shape: 'rectangle',
    length: u('12', 'ft'),
    width: u('10', 'ft'),
    waste: '10',
    box: u('20', 'ft2'),
  };

  it('adds waste and rounds up to boxes', async () => {
    const res = await result('flooring-calculator', base);
    expect(res.headline).toEqual({ value: '132', unit: 'square feet' });
    expect(detail(res, 'boxes')).toBe('7 boxes');
  });

  it('calculates cost when a price is given', async () => {
    expect(
      detail(await result('flooring-calculator', { ...base, price: '45.99' }), 'total cost'),
    ).toBe('321.93');
  });

  it('works in metric', async () => {
    const res = await result('flooring-calculator', {
      shape: 'rectangle',
      length: u('5', 'm'),
      width: u('4', 'm'),
      waste: '10',
      box: u('2', 'm2'),
    });
    expect(res.headline).toEqual({ value: '22', unit: 'square meters' });
    expect(detail(res, 'boxes')).toBe('11 boxes');
  });
});

describe('Tile Calculator', () => {
  const base = {
    shape: 'rectangle',
    length: u('10', 'ft'),
    width: u('8', 'ft'),
    tileLength: u('12', 'in'),
    tileWidth: u('12', 'in'),
    grout: u('1/8', 'in'),
    waste: '10',
  };

  it('accounts for grout and waste', async () => {
    expect((await result('tile-calculator', base)).headline.value).toBe('87');
  });

  it('gives an exact count with no grout or waste', async () => {
    const res = await result('tile-calculator', {
      ...base,
      length: u('10', 'ft'),
      width: u('10', 'ft'),
      grout: u('0', 'in'),
      waste: '0',
    });
    expect(res.headline.value).toBe('100');
  });

  it('rounds boxes up', async () => {
    expect(detail(await result('tile-calculator', { ...base, perBox: '15' }), 'boxes')).toBe(
      '6 boxes',
    );
  });

  it('handles metric tiles', async () => {
    const res = await result('tile-calculator', {
      shape: 'area',
      area: u('3', 'm2'),
      tileLength: u('30', 'cm'),
      tileWidth: u('60', 'cm'),
      grout: u('0', 'mm'),
      waste: '0',
    });
    expect(res.headline.value).toBe('17'); // 3 ÷ 0.18 = 16.7
  });
});

describe('Concrete Calculator', () => {
  it('calculates a slab with bags', async () => {
    const res = await result('concrete-calculator', {
      shape: 'slab',
      length: u('10', 'ft'),
      width: u('10', 'ft'),
      thickness: u('4', 'in'),
      quantity: '1',
      waste: '10',
    });
    expect(res.headline).toEqual({ value: '1.36', unit: 'cubic yards' });
    expect(detail(res, '80 lb')).toBe('62 bags');
    expect(detail(res, '60 lb')).toBe('82 bags');
    expect(detail(res, '40 lb')).toBe('123 bags');
  });

  it('calculates round post holes', async () => {
    const res = await result('concrete-calculator', {
      shape: 'round',
      diameter: u('10', 'in'),
      depth: u('36', 'in'),
      quantity: '8',
      waste: '10',
    });
    expect(res.headline.value).toBe('0.53');
    expect(detail(res, '80 lb')).toBe('24 bags');
  });

  it('gives exactly 45 bags of 80 lb per cubic yard', async () => {
    const res = await result('concrete-calculator', {
      shape: 'slab',
      length: u('3', 'yd'),
      width: u('3', 'yd'),
      thickness: u('1', 'yd'),
      quantity: '1',
      waste: '0',
    });
    expect(res.headline.value).toBe('9'); // 3 × 3 × 1 yd = 9 yd³
    expect(detail(res, '80 lb')).toBe('405 bags');
  });

  it('uses cubic meters and kg bags for metric input', async () => {
    const res = await result('concrete-calculator', {
      shape: 'slab',
      length: u('3', 'm'),
      width: u('3', 'm'),
      thickness: u('10', 'cm'),
      quantity: '1',
      waste: '0',
    });
    expect(res.headline).toEqual({ value: '0.9', unit: 'cubic meters' });
    expect(detail(res, '25 kg')).toBe('77 bags');
  });
});

describe('Gravel Calculator', () => {
  it('converts volume to US tons', async () => {
    const res = await result('gravel-calculator', {
      shape: 'rectangle',
      length: u('20', 'ft'),
      width: u('10', 'ft'),
      depth: u('4', 'in'),
      density: u('100', 'lbft3'),
      extra: '0',
    });
    expect(res.headline).toEqual({ value: '3.33', unit: 'tons' });
    expect(detail(res, 'cubic yards')).toBe('2.47 yd³');
    expect(detail(res, 'pounds')).toBe('6,667 lb');
  });

  it('works in metric with a density in kg/m³', async () => {
    const res = await result('gravel-calculator', {
      shape: 'area',
      area: u('10', 'm2'),
      depth: u('10', 'cm'),
      density: u('1600', 'kgm3'),
      extra: '0',
    });
    expect(res.headline).toEqual({ value: '1.6', unit: 'tonnes' });
  });

  it('adds compaction', async () => {
    const res = await result('gravel-calculator', {
      shape: 'area',
      area: u('10', 'm2'),
      depth: u('10', 'cm'),
      density: u('1.5', 'tm3'),
      extra: '10',
    });
    expect(res.headline.value).toBe('1.65');
  });
});

describe('Deck Calculator', () => {
  const ft = 0.3048;
  const inch = 0.0254;

  it('matches the worked example', async () => {
    const res = await result('deck-calculator', {});
    expect(res.headline.value).toBe('29');
    expect(detail(res, 'joists')).toBe('13');
    expect(detail(res, 'screws')).toBe('676');
  });

  it('joins boards when they are shorter than the deck', () => {
    const r = deckMaterials({
      lengthM: 20 * ft,
      widthM: 12 * ft,
      boardWidthM: 5.5 * inch,
      gapM: 0.125 * inch,
      boardLengthM: 12 * ft,
      joistSpacingM: 16 * inch,
      wastePercent: 0,
    });
    expect(r.rows).toBe(26);
    expect(r.boardsRaw).toBe(52);
  });

  it('cuts several rows from one long board', () => {
    const r = deckMaterials({
      lengthM: 8 * ft,
      widthM: 12 * ft,
      boardWidthM: 5.5 * inch,
      gapM: 0.125 * inch,
      boardLengthM: 16 * ft,
      joistSpacingM: 16 * inch,
      wastePercent: 0,
    });
    expect(r.boardsRaw).toBe(13);
    expect(r.joists).toBe(7);
  });

  it('allows a zero gap but not a zero board width', async () => {
    expect((await run('deck-calculator', { gap: u('0', 'in') })).errors).toEqual({});
    expect(
      (await run('deck-calculator', { boardWidth: u('0', 'in') })).errors.boardWidth,
    ).toBeTruthy();
  });
});
