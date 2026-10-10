import { evaluate, initialState, type Evaluation } from '../calculators/engine';
import { loadCalculator } from '../calculators/registry';
import type { ExampleValue } from '../calculators/types';

export type Values = Record<string, string | ExampleValue>;

/** Run a calculator with some fields overridden. Date fields defaulting to "today" use `today`. */
export async function run(
  slug: string,
  values: Values = {},
  today = '2026-10-10',
): Promise<Evaluation> {
  const calculator = await loadCalculator(slug);
  const state = initialState(calculator, today);
  for (const [id, value] of Object.entries(values)) {
    if (typeof value === 'string') state.values[id] = value;
    else {
      state.values[id] = value.value;
      state.units[id] = value.unit;
    }
  }
  return evaluate(calculator, state);
}

/** Run and return the result, failing loudly if there isn't one. */
export async function result(slug: string, values: Values = {}, today?: string) {
  const evaluation = await run(slug, values, today);
  if (!evaluation.result) {
    throw new Error(
      `${slug} produced no result: ${JSON.stringify({ errors: evaluation.errors, formError: evaluation.formError })}`,
    );
  }
  return evaluation.result;
}

/** Find a detail row's value by (partial) label. */
export function detail(
  res: { details?: { label: string; value: string }[] },
  label: string,
): string {
  const row = res.details?.find((d) => d.label.toLowerCase().includes(label.toLowerCase()));
  if (!row) throw new Error(`No detail matching "${label}" in ${JSON.stringify(res.details)}`);
  return row.value;
}

export const u = (value: string, unit: string): ExampleValue => ({ value, unit });
