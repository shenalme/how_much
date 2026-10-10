import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { parseNumber } from '../../../utils/parse';

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 1 / 2,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅕': 1 / 5,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
};
const FRAC = Object.keys(UNICODE_FRACTIONS).join('');
const NUMBER = `(?:\\d+\\s+\\d+/\\d+|\\d+/\\d+|\\d+(?:\\.\\d+)?(?:\\s?[${FRAC}])?|\\.\\d+|[${FRAC}])`;
const LINE = new RegExp(
  `^(\\s*(?:[-•*]\\s*)?)(${NUMBER})(?:(\\s*(?:-|–|to)\\s*)(${NUMBER}))?(.*)$`,
);

export function parseQuantity(token: string): number | null {
  const unicode = [...token].find((ch) => ch in UNICODE_FRACTIONS);
  if (unicode) {
    const whole = token.replace(unicode, '').trim();
    return (whole ? Number(whole) : 0) + (UNICODE_FRACTIONS[unicode] ?? 0);
  }
  return parseNumber(token);
}

const NICE_FRACTIONS: [number, string][] = [
  [1 / 8, '1/8'],
  [1 / 4, '1/4'],
  [1 / 3, '1/3'],
  [3 / 8, '3/8'],
  [1 / 2, '1/2'],
  [5 / 8, '5/8'],
  [2 / 3, '2/3'],
  [3 / 4, '3/4'],
  [7 / 8, '7/8'],
];

/** 2.25 → "2 1/4", 0.333 → "1/3", 1.37 → "1.37". */
export function formatQuantity(value: number): string {
  let whole = Math.floor(value + 1e-9);
  const fraction = value - whole;
  if (fraction < 0.01) return formatNumber(whole, 0);
  if (fraction > 0.99) return formatNumber(whole + 1, 0);
  const match = NICE_FRACTIONS.find(([f]) => Math.abs(fraction - f) < 0.004);
  if (!match) return formatNumber(value, 2);
  if (whole === 0) return match[1];
  if (match[0] === 1) whole += 1;
  return `${formatNumber(whole, 0)} ${match[1]}`;
}

export function scaleLine(line: string, factor: number): { text: string; scaled: boolean } {
  const match = LINE.exec(line);
  if (!match) return { text: line.trim(), scaled: false };
  const [, prefix = '', first = '', separator, second, rest = ''] = match;
  const a = parseQuantity(first);
  if (a === null) return { text: line.trim(), scaled: false };
  let quantity = formatQuantity(a * factor);
  if (second) {
    const b = parseQuantity(second);
    if (b !== null) quantity += `${separator ?? '-'}${formatQuantity(b * factor)}`;
  }
  return {
    text: `${prefix.trim() ? `${prefix.trim()} ` : ''}${quantity}${rest}`.trim(),
    scaled: true,
  };
}

export const calculator: CalculatorDefinition = {
  slug: 'recipe-scaler',
  intro:
    'Enter how many servings the recipe makes and how many you need, then paste the ingredients. Every quantity at the start of a line is scaled.',
  fields: [
    {
      id: 'original',
      kind: 'number',
      label: 'Recipe serves',
      default: '4',
      exclusiveMin: true,
      max: 10000,
    },
    {
      id: 'desired',
      kind: 'number',
      label: 'I want to serve',
      default: '6',
      exclusiveMin: true,
      max: 10000,
    },
    {
      id: 'ingredients',
      kind: 'text',
      label: 'Ingredients',
      help: 'One ingredient per line, quantity first. Fractions like 1 1/2 and ½ work.',
      default: '2 cups flour\n1 1/2 tsp salt\n3 eggs\n½ cup milk\n2-3 tbsp butter',
      rows: 7,
    },
  ],
  calculate(inputs) {
    const original = inputs.num('original');
    const desired = inputs.num('desired');
    const factor = desired / original;
    const lines = inputs
      .text('ingredients')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    const scaled = lines.map((line) => scaleLine(line, factor));
    const unchanged = scaled.filter((l) => !l.scaled).length;

    return {
      headline: { value: `× ${formatNumber(factor, 3)}`, unit: 'scale factor' },
      summary: `Multiply every quantity by ${formatNumber(factor, 3)} to go from ${formatNumber(original, 2)} to ${formatNumber(desired, 2)} ${plural(desired, 'serving')}.`,
      lines: scaled.map((l) => l.text),
      notes: [
        ...(unchanged > 0
          ? [
              `${unchanged} ${plural(unchanged, 'line has', 'lines have')} no quantity at the start and ${unchanged === 1 ? 'was' : 'were'} left as written.`,
            ]
          : []),
        'Baking times, pan sizes and leavening may need adjusting for large changes.',
      ],
    };
  },
  content: {
    howItWorks: [
      'The scale factor is the number of servings you want divided by the number the recipe makes. Every quantity is multiplied by that factor.',
      'Quantities are shown as kitchen-friendly fractions (halves, thirds, quarters and eighths) when the result is close to one, and as decimals otherwise. Ranges such as 2-3 tbsp are scaled at both ends.',
    ],
    formula: [
      { label: 'Scale factor', expression: 'Factor = Servings wanted ÷ Recipe servings' },
      { label: 'New quantity', expression: 'New quantity = Original quantity × Factor' },
    ],
    assumptions: [
      'Only the number at the start of each line is changed. Quantities in the middle of a line, such as “1 (14 oz) can”, keep their inner numbers.',
      'Some ingredients do not scale linearly. Salt, spices, yeast and baking powder may need less than a straight multiplication in very large batches; taste and adjust.',
    ],
    examples: [
      {
        title: 'From 4 to 6 servings',
        values: {
          original: '4',
          desired: '6',
          ingredients: '2 cups flour\n1 1/2 tsp salt\n3 eggs',
        },
        steps: [
          'Factor = 6 ÷ 4 = 1.5',
          '2 cups × 1.5 = 3 cups',
          '1 1/2 tsp × 1.5 = 2 1/4 tsp',
          '3 eggs × 1.5 = 4 1/2 eggs (use 4 large or 5 small)',
        ],
        expected: '× 1.5',
      },
    ],
    faq: [
      {
        question: 'How do I halve a recipe?',
        answer:
          'Set the servings you want to half the original. Every quantity is multiplied by 0.5, so 3/4 cup becomes 3/8 cup (6 tablespoons).',
      },
      {
        question: 'What do I do with half an egg?',
        answer:
          'Beat the egg and use about half of it by volume (roughly 2 tablespoons for a large egg), or round to a whole egg if the recipe is forgiving.',
      },
      {
        question: 'Do cooking times change when I scale a recipe?',
        answer:
          'Often. A larger batch in a bigger pan may take longer, and a deeper dish cooks more slowly in the middle. Check for doneness rather than relying on the original time.',
      },
    ],
  },
};
