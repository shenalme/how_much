import { describe, expect, it } from 'vitest';
import { detail, result, run, u } from '../helpers';

describe('Mulch Calculator', () => {
  const base = {
    shape: 'rectangle',
    length: u('20', 'ft'),
    width: u('15', 'ft'),
    depth: u('3', 'in'),
  };

  it('calculates a typical bed (20 × 15 ft at 3 in = 2.78 yd³)', async () => {
    const res = await result('mulch-calculator', base);
    expect(res.headline).toEqual({ value: '2.78', unit: 'cubic yards' });
    expect(res.summary).toBe('You need approximately 2.78 cubic yards of mulch.');
    expect(detail(res, 'cubic feet')).toBe('75 ft³');
    expect(detail(res, 'bags (2 cu ft)')).toBe('38 bags');
  });

  it('gives the same answer when units are mixed', async () => {
    const res = await result('mulch-calculator', {
      ...base,
      length: u('240', 'in'),
      width: u('5', 'yd'),
    });
    expect(res.headline.value).toBe('2.78');
  });

  it('switches to cubic meters for metric measurements', async () => {
    const res = await result('mulch-calculator', {
      shape: 'rectangle',
      length: u('4', 'm'),
      width: u('2.5', 'm'),
      depth: u('7.5', 'cm'),
      bag: 'l:50',
    });
    expect(res.headline).toEqual({ value: '0.75', unit: 'cubic meters' });
    expect(detail(res, 'bags')).toBe('15 bags');
  });

  it('handles round beds', async () => {
    const res = await result('mulch-calculator', {
      shape: 'circle',
      diameter: u('10', 'ft'),
      depth: u('3', 'in'),
    });
    // π × 5² × 0.25 = 19.635 ft³ ÷ 27 = 0.727
    expect(res.headline.value).toBe('0.73');
  });

  it('handles decimal depths', async () => {
    const res = await result('mulch-calculator', { ...base, depth: u('2.5', 'in') });
    expect(res.headline.value).toBe('2.31'); // 62.5 ft³ ÷ 27
  });

  it('does not round an exact bag count up', async () => {
    const res = await result('mulch-calculator', {
      shape: 'area',
      area: u('24', 'ft2'),
      depth: u('1', 'in'),
      bag: 'ft3:2',
    });
    expect(detail(res, 'bags')).toBe('1 bag');
  });

  it('rejects a zero depth and zero dimensions', async () => {
    expect((await run('mulch-calculator', { ...base, depth: u('0', 'in') })).errors.depth).toMatch(
      /greater than 0/,
    );
    expect(
      (await run('mulch-calculator', { ...base, length: u('0', 'ft') })).errors.length,
    ).toBeTruthy();
  });

  it('warns about very deep or thin layers', async () => {
    expect((await result('mulch-calculator', { ...base, depth: u('6', 'in') })).notes?.[0]).toMatch(
      /deeper/,
    );
    expect((await result('mulch-calculator', { ...base, depth: u('1', 'in') })).notes?.[0]).toMatch(
      /thinner/,
    );
  });

  it('accepts large areas', async () => {
    const res = await result('mulch-calculator', {
      shape: 'area',
      area: u('100', 'acre'),
      depth: u('3', 'in'),
    });
    expect(res.headline.value).toBe('40,333.33'); // 4,356,000 ft² × 0.25 ÷ 27
  });
});

describe('Soil Calculator', () => {
  const base = {
    shape: 'rectangle',
    length: u('20', 'ft'),
    width: u('15', 'ft'),
    depth: u('4', 'in'),
  };

  it('adds the settling allowance', async () => {
    expect((await result('soil-calculator', { ...base, settling: '10' })).headline.value).toBe(
      '4.07',
    );
    expect((await result('soil-calculator', { ...base, settling: '0' })).headline.value).toBe(
      '3.7',
    );
    expect((await result('soil-calculator', { ...base, settling: '20' })).headline.value).toBe(
      '4.44',
    );
  });

  it('reports the volume before the allowance', async () => {
    const res = await result('soil-calculator', { ...base, settling: '10' });
    expect(detail(res, 'before allowance')).toBe('3.7 cubic yards');
  });

  it('works in metric', async () => {
    const res = await result('soil-calculator', {
      shape: 'rectangle',
      length: u('5', 'm'),
      width: u('2', 'm'),
      depth: u('10', 'cm'),
      settling: '0',
    });
    expect(res.headline).toEqual({ value: '1', unit: 'cubic meters' });
  });
});

describe('Raised Bed Soil Calculator', () => {
  const base = {
    shape: 'rectangle',
    length: u('8', 'ft'),
    width: u('4', 'ft'),
    height: u('12', 'in'),
    beds: '2',
    compost: '30',
  };

  it('multiplies by the number of beds and splits the mix', async () => {
    const res = await result('raised-bed-soil-calculator', base);
    expect(res.headline.value).toBe('2.37');
    expect(detail(res, 'per bed')).toBe('1.19 cubic yards');
    expect(detail(res, 'topsoil')).toBe('44.8 ft³ (1.66 yd³)');
    expect(detail(res, 'compost')).toBe('19.2 ft³ (0.71 yd³)');
  });

  it('omits the split when compost is 0%', async () => {
    const res = await result('raised-bed-soil-calculator', { ...base, compost: '0' });
    expect(res.details?.some((d) => d.label === 'Compost')).toBe(false);
  });

  it('requires a whole number of beds', async () => {
    expect((await run('raised-bed-soil-calculator', { ...base, beds: '1.5' })).errors.beds).toMatch(
      /whole/,
    );
    expect(
      (await run('raised-bed-soil-calculator', { ...base, beds: '0' })).errors.beds,
    ).toBeTruthy();
  });

  it('rejects a compost share over 100%', async () => {
    expect(
      (await run('raised-bed-soil-calculator', { ...base, compost: '120' })).errors.compost,
    ).toBeTruthy();
  });

  it('handles round beds', async () => {
    const res = await result('raised-bed-soil-calculator', {
      ...base,
      shape: 'circle',
      diameter: u('1', 'm'),
      height: u('30', 'cm'),
      beds: '1',
    });
    expect(res.headline).toEqual({ value: '0.24', unit: 'cubic meters' }); // π × 0.25 × 0.3
  });
});

describe('Compost Calculator', () => {
  it('uses the preset depth', async () => {
    const res = await result('compost-calculator', {
      shape: 'area',
      area: u('1000', 'ft2'),
      application: 'lawn-quarter',
    });
    expect(res.headline.value).toBe('0.77');
    const bed = await result('compost-calculator', {
      shape: 'area',
      area: u('1000', 'ft2'),
      application: 'bed-2',
    });
    expect(bed.headline.value).toBe('6.17'); // 166.67 ft³ ÷ 27
  });

  it('uses a custom metric depth', async () => {
    const res = await result('compost-calculator', {
      shape: 'area',
      area: u('10', 'm2'),
      application: 'custom',
      depth: u('2', 'cm'),
    });
    expect(res.headline).toEqual({ value: '0.2', unit: 'cubic meters' });
  });

  it('ignores the hidden custom depth field for presets', async () => {
    const evaluation = await run('compost-calculator', {
      application: 'bed-1',
      depth: u('abc', 'in'),
    });
    expect(evaluation.errors).toEqual({});
  });
});

describe('Garden Area Calculator', () => {
  it('calculates rectangles, circles and triangles', async () => {
    expect(
      (
        await result('garden-area-calculator', {
          shape: 'rectangle',
          length: u('20', 'ft'),
          width: u('15', 'ft'),
        })
      ).headline.value,
    ).toBe('300');
    expect(
      (await result('garden-area-calculator', { shape: 'circle', diameter: u('10', 'ft') }))
        .headline.value,
    ).toBe('78.54');
    expect(
      (
        await result('garden-area-calculator', {
          shape: 'triangle',
          base: u('12', 'ft'),
          height: u('8', 'ft'),
        })
      ).headline.value,
    ).toBe('48');
  });

  it('converts to acres and perimeter', async () => {
    const res = await result('garden-area-calculator', {
      shape: 'rectangle',
      length: u('43560', 'ft'),
      width: u('1', 'ft'),
    });
    expect(detail(res, 'acres')).toBe('1');
    expect(detail(res, 'perimeter')).toBe('87,122 ft');
  });

  it('reports metric areas in square meters', async () => {
    const res = await result('garden-area-calculator', {
      shape: 'rectangle',
      length: u('5', 'm'),
      width: u('4', 'm'),
    });
    expect(res.headline).toEqual({ value: '20', unit: 'square meters' });
    expect(detail(res, 'square feet')).toBe('215.28 ft²');
  });
});

describe('Grass Seed Calculator', () => {
  const base = { shape: 'area', area: u('5000', 'ft2'), grass: 'tall-fescue', project: 'new' };

  it('multiplies area by the seeding rate', async () => {
    expect((await result('grass-seed-calculator', base)).headline).toEqual({
      value: '35',
      unit: 'lb',
    });
    expect(
      (await result('grass-seed-calculator', { ...base, grass: 'kentucky-bluegrass' })).headline
        .value,
    ).toBe('12.5');
  });

  it('halves the rate for overseeding', async () => {
    expect(
      (await result('grass-seed-calculator', { ...base, project: 'overseed' })).headline.value,
    ).toBe('17.5');
  });

  it('accepts a custom rate in g/m²', async () => {
    const res = await result('grass-seed-calculator', {
      shape: 'area',
      area: u('100', 'm2'),
      grass: 'custom',
      rate: '10',
      rateUnit: 'gm2',
      project: 'new',
    });
    expect(res.headline).toEqual({ value: '1', unit: 'kg' });
  });

  it('requires a positive custom rate', async () => {
    expect(
      (await run('grass-seed-calculator', { ...base, grass: 'custom', rate: '0' })).errors.rate,
    ).toBeTruthy();
  });
});

describe('Sod Calculator', () => {
  it('rounds pieces up after adding waste', async () => {
    const res = await result('sod-calculator', {
      shape: 'rectangle',
      length: u('20', 'ft'),
      width: u('15', 'ft'),
      piece: '16x24in',
      waste: '5',
    });
    expect(res.headline).toEqual({ value: '119', unit: 'pieces' });
  });

  it('handles exact metric rolls without over-rounding', async () => {
    const res = await result('sod-calculator', {
      shape: 'area',
      area: u('50', 'm2'),
      piece: '1m2',
      waste: '0',
    });
    expect(res.headline.value).toBe('50');
  });

  it('supports a custom piece size', async () => {
    const res = await result('sod-calculator', {
      shape: 'area',
      area: u('450', 'ft2'),
      piece: 'custom',
      pieceArea: u('9', 'ft2'),
      waste: '0',
    });
    expect(res.headline.value).toBe('50');
  });
});

describe('Fence Calculator', () => {
  const base = {
    length: u('150', 'ft'),
    layout: 'open',
    spacing: u('8', 'ft'),
    rails: '3',
    gates: '1',
    gateWidth: u('4', 'ft'),
    style: 'boards',
    boardWidth: u('3.5', 'in'),
    gap: u('2', 'in'),
  };

  it('counts posts, rails and pickets', async () => {
    const res = await result('fence-calculator', base);
    expect(res.headline.value).toBe('21');
    expect(detail(res, 'rails')).toBe('57 (438 ft in total)');
    expect(detail(res, 'pickets')).toBe('319');
  });

  it('needs one post per section for a closed loop', async () => {
    const res = await result('fence-calculator', {
      ...base,
      length: u('32', 'ft'),
      layout: 'closed',
      gates: '0',
    });
    expect(res.headline.value).toBe('4');
  });

  it('needs sections + 1 posts for an open run', async () => {
    const res = await result('fence-calculator', { ...base, length: u('32', 'ft'), gates: '0' });
    expect(res.headline.value).toBe('5');
  });

  it('works in meters', async () => {
    const res = await result('fence-calculator', {
      ...base,
      length: u('50', 'm'),
      spacing: u('2.5', 'm'),
      gates: '0',
      style: 'none',
    });
    expect(res.headline.value).toBe('21');
    expect(detail(res, 'fenced length')).toBe('50 m');
  });

  it('reports gates wider than the fence as an error', async () => {
    const evaluation = await run('fence-calculator', {
      ...base,
      length: u('10', 'ft'),
      gates: '3',
    });
    expect(evaluation.errors.gates).toMatch(/gates/);
    expect(evaluation.result).toBeNull();
  });
});
