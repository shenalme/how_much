import { describe, expect, it } from 'vitest';
import { allTools, toolPath } from '../calculators/registry';
import { stripBase, withBase } from '../router/base';
import { getAllRoutePaths, normalizePath, resolveRoute } from '../router/routes';

describe('routing', () => {
  it('resolves every tool at /<category>/<slug>', () => {
    for (const tool of allTools) {
      const route = resolveRoute(toolPath(tool));
      expect(route.type, tool.slug).toBe('tool');
    }
  });

  it('uses the required URL structure', () => {
    const paths = getAllRoutePaths();
    for (const expected of [
      '/garden/mulch-calculator',
      '/garden/soil-calculator',
      '/garden/grass-seed-calculator',
      '/home/paint-calculator',
      '/home/concrete-calculator',
      '/home/flooring-calculator',
      '/animals/horse-fence-calculator',
      '/animals/horse-pasture-calculator',
      '/converters/feet-to-meters',
      '/converters/acres-to-hectares',
      '/math/percentage-calculator',
      '/math/age-calculator',
      '/garden',
      '/home',
      '/construction',
      '/converters',
      '/math',
      '/calculators',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
    ]) {
      expect(paths).toContain(expected);
    }
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('resolves categories and static pages', () => {
    expect(resolveRoute('/garden').type).toBe('category');
    expect(resolveRoute('/about')).toMatchObject({ type: 'page', page: 'about' });
    expect(resolveRoute('/')).toMatchObject({ type: 'home' });
    expect(resolveRoute('/calculators')).toMatchObject({ type: 'directory' });
  });

  it('only serves a tool at its own category', () => {
    expect(resolveRoute('/math/mulch-calculator').type).toBe('notFound');
    expect(resolveRoute('/garden/nope').type).toBe('notFound');
    expect(resolveRoute('/tool/123').type).toBe('notFound');
    expect(resolveRoute('/garden/mulch-calculator/extra').type).toBe('notFound');
  });

  it('normalises trailing slashes, .html and duplicate slashes', () => {
    expect(normalizePath('/garden/mulch-calculator/')).toBe('/garden/mulch-calculator');
    expect(normalizePath('/garden.html')).toBe('/garden');
    expect(normalizePath('/garden/index.html')).toBe('/garden');
    expect(normalizePath('//garden//mulch-calculator')).toBe('/garden/mulch-calculator');
    expect(normalizePath('/index.html')).toBe('/');
    expect(resolveRoute('/garden/mulch-calculator/').type).toBe('tool');
  });

  it('handles a project sub-path base', () => {
    expect(normalizePath('/PROJECTNAME/garden/', '/PROJECTNAME/')).toBe('/garden');
    expect(normalizePath('/PROJECTNAME', '/PROJECTNAME/')).toBe('/');
    expect(stripBase('/PROJECTNAME/about', '/PROJECTNAME/')).toBe('/about');
    expect(withBase('/garden')).toBe('/garden');
  });
});
