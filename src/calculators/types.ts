import type { CategoryId } from '../data/categories';
import type { Dimension } from '../utils/units';
import type { Inputs } from './engine';

/* ---------------------------------------------------------------------------
 * Tool metadata (meta.ts)
 *
 * Loaded eagerly for every tool: powers search, navigation, category pages,
 * related tools, the sitemap and page <head>. Keep it small.
 * ------------------------------------------------------------------------- */
export interface ToolMeta {
  /** URL segment, unique across the whole site. Permanent once published. */
  slug: string;
  /** Primary category; also the first URL segment: /<category>/<slug>. */
  category: CategoryId;
  /** H1 and display name, e.g. "Mulch Calculator". */
  title: string;
  /** Optional <title> text (the brand is appended automatically). Defaults to `title`. */
  seoTitle?: string;
  /** Meta description and card text. Aim for 110–160 characters. */
  description: string;
  /** Words people use for this tool, used by search. */
  keywords: string[];
  /** Other names for the tool, e.g. "topsoil calculator". Weighted higher than keywords. */
  aliases?: string[];
  /** Slugs of related tools, in display order. Unknown slugs fail the tests. */
  related: string[];
  /** Additional categories the tool is listed in (it keeps its primary URL). */
  alsoIn?: CategoryId[];
  /** ISO date the tool was first published. Drives "Recently added" and sitemap <lastmod>. */
  added: string;
  /** ISO date of the last meaningful content or formula change. */
  updated?: string;
  /** Lower numbers appear first in "Popular tools". Omit to exclude. */
  popularity?: number;
}

/* ---------------------------------------------------------------------------
 * Calculator definition (calculator.ts)
 *
 * Loaded on demand when a tool page is opened.
 * ------------------------------------------------------------------------- */
export interface ShowWhen {
  field: string;
  equals: string[];
}

interface BaseField {
  id: string;
  label: string;
  /** Short help text displayed under the field. */
  help?: string;
  /** Only show (and validate) this field when another field has one of these values. */
  showWhen?: ShowWhen;
  /** Optional fields may be left blank. */
  optional?: boolean;
  /** Span the full width of the form on larger screens. */
  wide?: boolean;
}

interface NumericConstraints {
  /** Minimum allowed value (inclusive unless exclusiveMin). Defaults to 0. Use -Infinity to allow negatives. */
  min?: number;
  exclusiveMin?: boolean;
  /** Maximum allowed value. Defaults to 1,000,000,000. */
  max?: number;
  integer?: boolean;
}

export interface NumberField extends BaseField, NumericConstraints {
  kind: 'number';
  default: string;
  /** Text shown after the input, e.g. "%" or "horses". */
  suffix?: string;
  prefix?: string;
  placeholder?: string;
}

export interface UnitField extends BaseField, NumericConstraints {
  kind: 'unit';
  dimension: Dimension;
  /** Unit ids from utils/units.ts offered in the unit selector. */
  units: string[];
  defaultUnit: string;
  default: string;
  placeholder?: string;
}

export interface SelectField extends BaseField {
  kind: 'select';
  options: { value: string; label: string }[];
  default: string;
}

export interface DateField extends BaseField {
  kind: 'date';
  /** "today" fills in the visitor's local date after the page loads. */
  default: string | 'today';
}

export interface NumberListField extends BaseField {
  kind: 'numberList';
  default: string;
  placeholder?: string;
  minCount?: number;
}

export interface TextField extends BaseField {
  kind: 'text';
  default: string;
  placeholder?: string;
  rows?: number;
}

export type Field = NumberField | UnitField | SelectField | DateField | NumberListField | TextField;

export interface ResultDetail {
  label: string;
  value: string;
}

export interface CalcResult {
  /** The main answer, displayed large. */
  headline: { value: string; unit?: string };
  /** A complete sentence answering the question, e.g. "You need approximately 2.78 cubic yards of mulch." */
  summary: string;
  /** Supporting figures shown as a list under the headline. */
  details?: ResultDetail[];
  /** Line-by-line output, e.g. a scaled recipe. */
  lines?: string[];
  /** Short caveats specific to this result. */
  notes?: string[];
}

export interface ExampleValue {
  value: string;
  unit: string;
}

export interface CalculatorExample {
  title: string;
  /** Field values for the example; fields not listed use their defaults. */
  values: Record<string, string | ExampleValue>;
  /** The worked steps, written out for readers. */
  steps: string[];
  /** The headline value the example must produce. Checked by the test suite. */
  expected: string;
}

export interface ContentTable {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface CalculatorContent {
  /** "How the calculation works": a few short paragraphs. */
  howItWorks: string[];
  /** Formula lines rendered in the Formula section. */
  formula: { label?: string; expression: string }[];
  /** Assumptions and limitations. Required whenever the result is an estimate. */
  assumptions?: string[];
  examples: CalculatorExample[];
  faq: { question: string; answer: string }[];
  tables?: ContentTable[];
}

export interface CalculatorDefinition {
  slug: string;
  /** One or two sentences shown directly under the H1. */
  intro: string;
  fields: Field[];
  /** Pure function: validated inputs in, formatted result out. */
  calculate: (inputs: Inputs) => CalcResult;
  content: CalculatorContent;
}
