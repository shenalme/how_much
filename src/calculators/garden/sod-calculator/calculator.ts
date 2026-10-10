import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { convert, fromBase } from '../../../utils/units';
import { areaFields, measuredInMetric, readArea } from '../../shared/area';
import { ceilCount } from '../../shared/volume';

/** Piece sizes in m². */
const PIECES: Record<string, { label: string; m2: number }> = {
  '16x24in': { label: '16 × 24 in piece (2.67 ft²)', m2: convert(16 * 24, 'in2', 'm2') },
  '2x5ft': { label: '2 × 5 ft roll (10 ft²)', m2: convert(10, 'ft2', 'm2') },
  '1m2': { label: '1 m² roll (10.76 ft²)', m2: 1 },
};

export const calculator: CalculatorDefinition = {
  slug: 'sod-calculator',
  intro:
    'Enter the size of your lawn to see how many pieces or rolls of sod to order, with extra for trimming around edges and curves.',
  fields: [
    ...areaFields({ noun: 'lawn' }),
    {
      id: 'piece',
      kind: 'select',
      label: 'Piece or roll size',
      options: [
        ...Object.entries(PIECES).map(([value, p]) => ({ value, label: p.label })),
        { value: 'custom', label: 'Other size' },
      ],
      default: '16x24in',
      wide: true,
    },
    {
      id: 'pieceArea',
      kind: 'unit',
      label: 'Area of one piece',
      help: 'Ask your supplier, or multiply the piece length by its width.',
      dimension: 'area',
      units: ['ft2', 'm2', 'yd2'],
      defaultUnit: 'ft2',
      default: '9',
      exclusiveMin: true,
      showWhen: { field: 'piece', equals: ['custom'] },
    },
    {
      id: 'waste',
      kind: 'number',
      label: 'Extra for cutting and waste',
      help: '5% for simple shapes; 10% or more for curves and many edges.',
      default: '5',
      suffix: '%',
      max: 100,
    },
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const waste = inputs.num('waste');
    const toOrder = area * (1 + waste / 100);
    const preset = PIECES[inputs.select('piece')];
    const pieceM2 = preset ? preset.m2 : inputs.unit('pieceArea');
    const pieces = ceilCount(toOrder / pieceM2);
    const metric = measuredInMetric(inputs);
    const areaText = (m2: number) =>
      metric ? `${formatNumber(m2, 2)} m²` : `${formatNumber(fromBase(m2, 'ft2'), 1)} ft²`;

    return {
      headline: { value: formatNumber(pieces, 0), unit: plural(pieces, 'piece') },
      summary: `Order ${formatNumber(pieces, 0)} ${plural(pieces, 'piece')} of sod to cover ${areaText(area)} with ${formatNumber(waste, 1)}% extra.`,
      details: [
        {
          label: 'Lawn area',
          value: `${formatNumber(fromBase(area, 'ft2'), 1)} ft² (${formatNumber(area, 2)} m²)`,
        },
        {
          label: 'Area to order',
          value: `${formatNumber(fromBase(toOrder, 'ft2'), 1)} ft² (${formatNumber(toOrder, 2)} m²)`,
        },
        {
          label: 'Area of one piece',
          value: `${formatNumber(fromBase(pieceM2, 'ft2'), 2)} ft² (${formatNumber(pieceM2, 3)} m²)`,
        },
        { label: 'Square yards', value: `${formatNumber(fromBase(toOrder, 'yd2'), 1)} yd²` },
      ],
      notes: ['Pieces are rounded up. Sod is perishable, so plan to lay it the day it arrives.'],
    };
  },
  content: {
    howItWorks: [
      'The calculator finds the lawn area, adds your waste allowance, then divides by the area of one piece and rounds up to whole pieces.',
      'Sod is cut to fit at edges, curves, paths and beds, and those offcuts are rarely usable elsewhere. A small allowance avoids running short on installation day.',
    ],
    formula: [
      { label: 'Area to order', expression: 'Area to order = Lawn area × (1 + Waste % ÷ 100)' },
      { label: 'Pieces', expression: 'Pieces = Area to order ÷ Area of one piece, rounded up' },
    ],
    assumptions: [
      'Piece sizes vary by farm and region. Common US pieces are 16 × 24 inches or 2 × 5 foot rolls; UK turf is often sold in rolls of about 1 m². Check with your supplier.',
      'Pallets hold different amounts depending on the supplier, so convert pieces to pallets using the coverage your supplier quotes.',
    ],
    examples: [
      {
        title: 'A 20 × 15 ft lawn with 16 × 24 inch pieces',
        values: {
          shape: 'rectangle',
          length: { value: '20', unit: 'ft' },
          width: { value: '15', unit: 'ft' },
          piece: '16x24in',
          waste: '5',
        },
        steps: [
          'Lawn area = 20 × 15 = 300 ft²',
          'With 5% extra: 300 × 1.05 = 315 ft²',
          'One piece = 16 × 24 in = 384 in² = 2.667 ft²',
          '315 ÷ 2.667 = 118.1, rounded up to 119 pieces',
        ],
        expected: '119',
      },
    ],
    faq: [
      {
        question: 'How many square feet are in a pallet of sod?',
        answer:
          'It varies by supplier and piece size. Many US pallets cover somewhere around 400 to 500 square feet, but ask your supplier for the exact coverage before you order.',
      },
      {
        question: 'Should I order extra sod?',
        answer:
          'Yes, a little. About 5% is usually enough for a simple rectangle; lawns with curved beds, trees or lots of edges can need 10% or more.',
      },
      {
        question: 'Is sod or seed cheaper?',
        answer:
          'Seed costs much less per square foot, but sod gives an instant lawn and is less sensitive to weeds and erosion while it establishes. Use the Grass Seed Calculator to compare the quantity of seed for the same area.',
      },
    ],
  },
};
