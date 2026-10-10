/**
 * Checks that apply to every calculator automatically, so a new tool gets
 * baseline coverage the moment its folder is added.
 */
import { describe, expect, it } from 'vitest';
import { evaluate, exampleState, initialState, isFieldVisible } from '../../calculators/engine';
import { allTools, loadAllCalculators, loadCalculator } from '../../calculators/registry';
import type { CalculatorDefinition, Field } from '../../calculators/types';
import { categories } from '../../data/categories';

const calculators = await loadAllCalculators();
const bySlug = new Map<string, CalculatorDefinition>(calculators.map((c) => [c.slug, c]));
const TODAY = '2026-10-10';

const numericFields = (calc: CalculatorDefinition) =>
  calc.fields.filter(
    (f): f is Extract<Field, { kind: 'number' | 'unit' }> =>
      f.kind === 'number' || f.kind === 'unit',
  );

function stateWith(calc: CalculatorDefinition, override: (field: Field) => string | undefined) {
  const state = initialState(calc, TODAY);
  for (const field of calc.fields) {
    const value = override(field);
    if (value !== undefined) state.values[field.id] = value;
  }
  return state;
}

/** State with `field` set to `value` and made visible by selecting the option it depends on. */
function stateShowing(calc: CalculatorDefinition, field: Field, value: string) {
  const state = initialState(calc, TODAY);
  state.values[field.id] = value;
  if (field.showWhen) state.values[field.showWhen.field] = field.showWhen.equals[0] ?? '';
  expect(isFieldVisible(field, state), `${field.id} should be visible`).toBe(true);
  return state;
}

describe('tool registry', () => {
  it('has at least the 36 required tools', () => {
    expect(allTools.length).toBeGreaterThanOrEqual(36);
  });

  it('has unique slugs, titles and SEO titles', () => {
    const slugs = allTools.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const titles = allTools.map((t) => (t.seoTitle ?? t.title).toLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
    const descriptions = allTools.map((t) => t.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it.each(allTools.map((t) => [t.slug, t] as const))('%s has valid metadata', (_slug, tool) => {
    expect(tool.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(tool.folder).toBe(`./${tool.category}/${tool.slug}`);
    expect(categories.some((c) => c.id === tool.category)).toBe(true);
    for (const id of tool.alsoIn ?? []) expect(categories.some((c) => c.id === id)).toBe(true);
    expect(tool.description.length).toBeGreaterThanOrEqual(70);
    expect(tool.description.length).toBeLessThanOrEqual(170);
    expect(tool.keywords.length).toBeGreaterThanOrEqual(3);
    expect(tool.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tool.related.length).toBeGreaterThanOrEqual(3);
    for (const related of tool.related) {
      expect(related, `${tool.slug} → ${related}`).not.toBe(tool.slug);
      expect(
        allTools.some((t) => t.slug === related),
        `${tool.slug} relates to unknown "${related}"`,
      ).toBe(true);
    }
  });
});

describe.each(allTools.map((t) => [t.slug] as const))('%s', (slug) => {
  const calc = bySlug.get(slug) as CalculatorDefinition;

  it('loads a calculator whose slug matches its metadata', async () => {
    expect((await loadCalculator(slug)).slug).toBe(slug);
  });

  it('has unique field ids and valid showWhen references', () => {
    const ids = calc.fields.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const field of calc.fields) {
      if (field.showWhen) expect(ids).toContain(field.showWhen.field);
      if (field.kind === 'unit') expect(field.units).toContain(field.defaultUnit);
      if (field.kind === 'select')
        expect(field.options.map((o) => o.value)).toContain(field.default);
    }
  });

  it('has explanatory content', () => {
    expect(calc.intro.length).toBeGreaterThan(40);
    expect(calc.content.howItWorks.length).toBeGreaterThan(0);
    expect(calc.content.formula.length).toBeGreaterThan(0);
    expect(calc.content.examples.length).toBeGreaterThan(0);
    expect(calc.content.faq.length).toBeGreaterThanOrEqual(2);
  });

  it('produces a result with its default values', () => {
    const { result, errors, formError } = evaluate(calc, initialState(calc, TODAY));
    expect(errors).toEqual({});
    expect(formError).toBeNull();
    expect(result?.summary).toBeTruthy();
    expect(result?.headline.value).not.toMatch(/NaN|Infinity|undefined/);
  });

  it.each(calc.content.examples.map((e) => [e.title, e] as const))(
    'worked example "%s" matches the calculator',
    (_title, example) => {
      const { result, errors } = evaluate(calc, exampleState(calc, example));
      expect(errors).toEqual({});
      expect(result?.headline.value).toBe(example.expected);
    },
  );

  it('rejects text that is not a number', () => {
    for (const field of numericFields(calc)) {
      const { errors, result } = evaluate(calc, stateShowing(calc, field, 'abc'));
      expect(errors[field.id], field.id).toBeTruthy();
      expect(result).toBeNull();
    }
  });

  it('rejects negative values where only positive values make sense', () => {
    for (const field of numericFields(calc)) {
      if ((field.min ?? 0) < 0) continue;
      expect(
        evaluate(calc, stateShowing(calc, field, '-5')).errors[field.id],
        field.id,
      ).toBeTruthy();
    }
  });

  it('handles zero in every numeric field without crashing or showing NaN', () => {
    const state = stateWith(calc, (f) =>
      f.kind === 'number' || f.kind === 'unit' ? '0' : undefined,
    );
    const { result } = evaluate(calc, state);
    if (result) expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity/);
  });

  it('handles decimal values', () => {
    const state = stateWith(calc, (f) =>
      (f.kind === 'number' || f.kind === 'unit') && !f.integer && !f.optional ? '2.5' : undefined,
    );
    const { result, errors, formError } = evaluate(calc, state);
    if (Object.keys(errors).length === 0 && !formError) {
      expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity/);
    }
  });

  it('rejects values above the field maximum', () => {
    for (const field of numericFields(calc)) {
      const { errors } = evaluate(calc, stateShowing(calc, field, '1000000000001'));
      expect(errors[field.id], field.id).toBeTruthy();
    }
  });

  it('copes with very large values without producing NaN or Infinity', () => {
    const state = stateWith(calc, (f) => {
      if (f.kind !== 'number' && f.kind !== 'unit') return undefined;
      if (f.optional) return undefined;
      return String(Math.min(f.max ?? 1_000_000_000, 1_000_000));
    });
    const { result } = evaluate(calc, state);
    if (result) expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity|undefined/);
  });
});
