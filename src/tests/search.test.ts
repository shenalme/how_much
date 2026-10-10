import { describe, expect, it } from 'vitest';
import { resultHref } from '../components/search/SearchBox';
import { extractNumber, queryTerms, searchTools } from '../search/search';

const slugs = (query: string, limit = 8) => searchTools(query, limit).map((r) => r.tool.slug);

describe('search', () => {
  it('finds mulch and suggests related garden tools', () => {
    const results = slugs('mulch');
    expect(results[0]).toBe('mulch-calculator');
    expect(results).toEqual(
      expect.arrayContaining([
        'soil-calculator',
        'compost-calculator',
        'raised-bed-soil-calculator',
      ]),
    );
  });

  it('finds every horse tool', () => {
    expect(slugs('horse').slice(0, 3).sort()).toEqual([
      'horse-feed-calculator',
      'horse-fence-calculator',
      'horse-pasture-calculator',
    ]);
  });

  it('understands unit abbreviations', () => {
    const results = slugs('kg');
    expect(results.slice(0, 2).sort()).toEqual(['kilograms-to-pounds', 'pounds-to-kilograms']);
  });

  it('respects the direction of a conversion', () => {
    expect(slugs('Convert 50 lbs to kg')[0]).toBe('pounds-to-kilograms');
    expect(slugs('kg to lbs')[0]).toBe('kilograms-to-pounds');
    expect(slugs('cm to inches')[0]).toBe('centimeters-to-inches');
  });

  it('ignores question words', () => {
    expect(queryTerms('How much concrete do I need?')).toEqual(['concrete']);
    expect(slugs('How much concrete do I need?')[0]).toBe('concrete-calculator');
    expect(slugs('How much mulch do I need?')[0]).toBe('mulch-calculator');
  });

  it('supports partial words and synonyms', () => {
    expect(slugs('mortg')[0]).toBe('mortgage-calculator');
    expect(slugs('topsoil')[0]).toBe('soil-calculator');
    expect(slugs('petrol')).toContain('fuel-cost-calculator');
    expect(slugs('turf')).toContain('sod-calculator');
    expect(slugs('gratuity')[0]).toBe('tip-calculator');
  });

  it('returns nothing for empty or meaningless queries', () => {
    expect(searchTools('')).toEqual([]);
    expect(searchTools('how much')).toEqual([]);
    expect(searchTools('zzzqqq')).toEqual([]);
  });

  it('extracts a number and prefills converters', () => {
    expect(extractNumber('convert 50 lbs to kg')).toBe(50);
    expect(extractNumber('no numbers')).toBeNull();
    const top = searchTools('50 lbs to kg')[0];
    expect(top && resultHref(top, '50 lbs to kg')).toBe('/converters/pounds-to-kilograms?value=50');
  });
});
