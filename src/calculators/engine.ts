import { parseISODate, type YMD } from '../utils/dates';
import { formatNumber } from '../utils/format';
import { parseNumber, parseNumberList } from '../utils/parse';
import { getUnit } from '../utils/units';
import type {
  CalcResult,
  CalculatorDefinition,
  CalculatorExample,
  Field,
  NumberField,
  UnitField,
} from './types';

/** Raw form state: exactly what the person typed, plus selected units. */
export interface FormState {
  values: Record<string, string>;
  units: Record<string, string>;
}

/**
 * Throw from `calculate` when inputs are individually valid but don't make sense
 * together (e.g. an end date before a start date). Pass `field` to show the
 * message next to that input.
 */
export class CalcInputError extends Error {
  readonly field: string | undefined;
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'CalcInputError';
    this.field = field;
  }
}

export const DEFAULT_MAX = 1_000_000_000;

export function initialState(def: CalculatorDefinition, today?: string): FormState {
  const values: Record<string, string> = {};
  const units: Record<string, string> = {};
  for (const field of def.fields) {
    if (field.kind === 'date') {
      values[field.id] = field.default === 'today' ? (today ?? '') : field.default;
    } else {
      values[field.id] = field.default;
    }
    if (field.kind === 'unit') units[field.id] = field.defaultUnit;
  }
  return { values, units };
}

export function isFieldVisible(field: Field, state: FormState): boolean {
  if (!field.showWhen) return true;
  const current = state.values[field.showWhen.field] ?? '';
  return field.showWhen.equals.includes(current);
}

function checkNumeric(value: number, field: NumberField | UnitField): string | null {
  const min = field.min ?? 0;
  const max = field.max ?? DEFAULT_MAX;
  if (field.integer && !Number.isInteger(value)) return 'Enter a whole number.';
  if (field.exclusiveMin ? value <= min : value < min) {
    if (min === 0) return field.exclusiveMin ? 'Enter a value greater than 0.' : 'Enter 0 or more.';
    return field.exclusiveMin
      ? `Enter a value greater than ${formatNumber(min, 4)}.`
      : `Enter a value of at least ${formatNumber(min, 4)}.`;
  }
  if (value > max) return `Enter a value no greater than ${formatNumber(max, 4)}.`;
  return null;
}

/** Validate one field. Returns an error message, or null when valid. */
export function validateField(field: Field, state: FormState): string | null {
  const raw = (state.values[field.id] ?? '').trim();
  if (raw === '') {
    return field.optional ? null : 'This field is required.';
  }
  switch (field.kind) {
    case 'number':
    case 'unit': {
      const value = parseNumber(raw);
      if (value === null) return 'Enter a number, for example 12 or 3.5.';
      return checkNumeric(value, field);
    }
    case 'select':
      return field.options.some((o) => o.value === raw) ? null : 'Choose an option.';
    case 'date':
      return parseISODate(raw) ? null : 'Enter a valid date.';
    case 'numberList': {
      const { values, invalid } = parseNumberList(raw);
      if (invalid.length > 0) {
        const shown = invalid
          .slice(0, 3)
          .map((t) => `“${t}”`)
          .join(', ');
        return `These are not numbers: ${shown}. Separate numbers with commas, spaces or new lines.`;
      }
      if (values.length < (field.minCount ?? 1)) {
        return `Enter at least ${field.minCount ?? 1} numbers.`;
      }
      if (values.some((v) => Math.abs(v) > DEFAULT_MAX)) {
        return `Numbers must be between -${formatNumber(DEFAULT_MAX)} and ${formatNumber(DEFAULT_MAX)}.`;
      }
      return null;
    }
    case 'text':
      return null;
  }
}

/** Typed, validated access to inputs inside `calculate`. */
export class Inputs {
  private readonly fields: Map<string, Field>;
  private readonly state: FormState;

  constructor(def: Pick<CalculatorDefinition, 'fields'>, state: FormState) {
    this.fields = new Map(def.fields.map((f) => [f.id, f]));
    this.state = state;
  }

  private field(id: string): Field {
    const field = this.fields.get(id);
    if (!field) throw new Error(`Unknown field "${id}"`);
    return field;
  }

  private raw(id: string): string {
    this.field(id);
    return (this.state.values[id] ?? '').trim();
  }

  /** True when an optional field has a value. */
  has(id: string): boolean {
    return this.raw(id) !== '';
  }

  /** A number field's value. */
  num(id: string): number {
    const value = parseNumber(this.raw(id));
    if (value === null) throw new Error(`Field "${id}" is not a valid number`);
    return value;
  }

  /** An optional number field's value, or null when blank. */
  optionalNum(id: string): number | null {
    return this.has(id) ? this.num(id) : null;
  }

  /** A unit field's value converted to the dimension's base unit (m, m², m³, kg, °C…). */
  unit(id: string): number {
    return getUnit(this.unitOf(id)).toBase(this.num(id));
  }

  /** An optional unit field in base units, or null when blank. */
  optionalUnit(id: string): number | null {
    return this.has(id) ? this.unit(id) : null;
  }

  /** The unit id currently selected for a unit field. */
  unitOf(id: string): string {
    const field = this.field(id);
    if (field.kind !== 'unit') throw new Error(`Field "${id}" is not a unit field`);
    return this.state.units[id] ?? field.defaultUnit;
  }

  select(id: string): string {
    return this.raw(id);
  }

  date(id: string): YMD {
    const date = parseISODate(this.raw(id));
    if (!date) throw new Error(`Field "${id}" is not a valid date`);
    return date;
  }

  list(id: string): number[] {
    return parseNumberList(this.raw(id)).values;
  }

  text(id: string): string {
    return this.state.values[id] ?? '';
  }
}

export interface Evaluation {
  /** Validation messages by field id (visible fields only). */
  errors: Record<string, string>;
  result: CalcResult | null;
  /** A message about the inputs as a whole. */
  formError: string | null;
}

const TOO_LARGE = 'The result is too large to calculate. Try smaller values.';

function looksBroken(result: CalcResult): boolean {
  const text = [
    result.headline.value,
    result.summary,
    ...(result.details ?? []).map((d) => d.value),
  ];
  return text.some((t) => /NaN|Infinity|undefined/.test(t)) || result.headline.value === '—';
}

/** Validate every visible field and, if all are valid, run the calculation. */
export function evaluate(def: CalculatorDefinition, state: FormState): Evaluation {
  const errors: Record<string, string> = {};
  for (const field of def.fields) {
    if (!isFieldVisible(field, state)) continue;
    const error = validateField(field, state);
    if (error) errors[field.id] = error;
  }
  if (Object.keys(errors).length > 0) return { errors, result: null, formError: null };

  try {
    const result = def.calculate(new Inputs(def, state));
    if (looksBroken(result)) return { errors, result: null, formError: TOO_LARGE };
    return { errors, result, formError: null };
  } catch (error) {
    if (error instanceof CalcInputError) {
      if (error.field)
        return { errors: { [error.field]: error.message }, result: null, formError: null };
      return { errors, result: null, formError: error.message };
    }
    if (error instanceof RangeError) return { errors, result: null, formError: TOO_LARGE };
    throw error;
  }
}

/** Build the form state for a worked example. */
export function exampleState(def: CalculatorDefinition, example: CalculatorExample): FormState {
  const state = initialState(def, '2000-01-01');
  for (const [id, value] of Object.entries(example.values)) {
    if (typeof value === 'string') {
      state.values[id] = value;
    } else {
      state.values[id] = value.value;
      state.units[id] = value.unit;
    }
  }
  return state;
}

/** Plain-text version of a result, used by the copy button. */
export function resultToText(title: string, result: CalcResult): string {
  const lines = [`${title}: ${result.summary}`];
  for (const detail of result.details ?? []) lines.push(`${detail.label}: ${detail.value}`);
  if (result.lines?.length) lines.push('', ...result.lines);
  return lines.join('\n');
}
