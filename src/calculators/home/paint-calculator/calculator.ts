import { CalcInputError } from '../../engine';
import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { convert, fromBase } from '../../../utils/units';
import { ceilCount } from '../../shared/volume';

/** Typical opening sizes: a 3 × 7 ft door and a 3 × 5 ft window. */
export const DOOR_AREA_M2 = convert(21, 'ft2', 'm2');
export const WINDOW_AREA_M2 = convert(15, 'ft2', 'm2');

const roomField = (id: string, label: string, value: string) => ({
  id,
  kind: 'unit' as const,
  label,
  dimension: 'length' as const,
  units: ['ft', 'm', 'in', 'cm'],
  defaultUnit: 'ft',
  default: value,
  exclusiveMin: true,
  showWhen: { field: 'mode', equals: ['room'] },
});

export const calculator: CalculatorDefinition = {
  slug: 'paint-calculator',
  intro:
    'Enter your room size, openings and number of coats to see how much paint to buy. Use the coverage printed on your can for the best estimate.',
  fields: [
    {
      id: 'mode',
      kind: 'select',
      label: 'What are you painting?',
      options: [
        { value: 'room', label: 'A room (I’ll enter its size)' },
        { value: 'walls', label: 'Walls (I know the total wall area)' },
      ],
      default: 'room',
      wide: true,
    },
    roomField('length', 'Room length', '12'),
    roomField('width', 'Room width', '10'),
    roomField('height', 'Wall height', '8'),
    {
      id: 'ceiling',
      kind: 'select',
      label: 'Paint the ceiling too?',
      options: [
        { value: 'no', label: 'No, walls only' },
        { value: 'yes', label: 'Yes, same paint' },
      ],
      default: 'no',
      showWhen: { field: 'mode', equals: ['room'] },
    },
    {
      id: 'wallArea',
      kind: 'unit',
      label: 'Total wall area',
      dimension: 'area',
      units: ['ft2', 'm2'],
      defaultUnit: 'ft2',
      default: '400',
      exclusiveMin: true,
      showWhen: { field: 'mode', equals: ['walls'] },
    },
    { id: 'doors', kind: 'number', label: 'Doors', default: '1', integer: true, max: 1000 },
    { id: 'windows', kind: 'number', label: 'Windows', default: '2', integer: true, max: 1000 },
    {
      id: 'coats',
      kind: 'number',
      label: 'Number of coats',
      help: 'Two coats is standard for an even finish.',
      default: '2',
      integer: true,
      min: 1,
      max: 10,
    },
    {
      id: 'coverage',
      kind: 'number',
      label: 'Coverage',
      help: 'Check the can. Many interior paints cover 350–400 ft² per US gallon (about 8.5–10 m² per liter).',
      default: '350',
      exclusiveMin: true,
      max: 100000,
    },
    {
      id: 'coverageUnit',
      kind: 'select',
      label: 'Coverage unit',
      options: [
        { value: 'ft2gal', label: 'ft² per US gallon' },
        { value: 'm2l', label: 'm² per liter' },
      ],
      default: 'ft2gal',
    },
  ],
  calculate(inputs) {
    let walls: number;
    let ceiling = 0;
    if (inputs.select('mode') === 'room') {
      const l = inputs.unit('length');
      const w = inputs.unit('width');
      walls = 2 * (l + w) * inputs.unit('height');
      if (inputs.select('ceiling') === 'yes') ceiling = l * w;
    } else {
      walls = inputs.unit('wallArea');
    }
    const openings = inputs.num('doors') * DOOR_AREA_M2 + inputs.num('windows') * WINDOW_AREA_M2;
    const paintedWalls = walls - openings;
    if (paintedWalls <= 0) {
      throw new CalcInputError(
        'The doors and windows add up to more than the wall area.',
        'windows',
      );
    }
    const area = paintedWalls + ceiling;
    const coats = inputs.num('coats');
    const coverageMetric = inputs.select('coverageUnit') === 'm2l';
    const coveragePerLiter = coverageMetric
      ? inputs.num('coverage')
      : convert(inputs.num('coverage'), 'ft2', 'm2') / convert(1, 'galUS', 'l');
    const liters = (area * coats) / coveragePerLiter;
    const gallons = convert(liters, 'l', 'galUS');

    const headline = coverageMetric
      ? { value: formatNumber(liters, 2), unit: 'liters' }
      : { value: formatNumber(gallons, 2), unit: 'gallons' };
    const other = coverageMetric
      ? `${formatNumber(gallons, 2)} US gal`
      : `${formatNumber(liters, 2)} L`;
    const purchase = coverageMetric
      ? { label: 'Tins of 2.5 L', count: ceilCount(liters / 2.5), noun: 'tin' }
      : { label: 'Gallon cans', count: ceilCount(gallons), noun: 'can' };
    const areaText = (m2: number) =>
      `${formatNumber(fromBase(m2, 'ft2'), 0)} ft² (${formatNumber(m2, 1)} m²)`;

    return {
      headline,
      summary: `You need about ${headline.value} ${headline.unit} (${other}) of paint for ${formatNumber(coats, 0)} ${plural(coats, 'coat')}.`,
      details: [
        { label: 'Wall area', value: areaText(walls) },
        { label: 'Doors and windows', value: `− ${areaText(openings)}` },
        ...(ceiling > 0 ? [{ label: 'Ceiling', value: areaText(ceiling) }] : []),
        { label: 'Area to paint (one coat)', value: areaText(area) },
        {
          label: purchase.label,
          value: `${formatNumber(purchase.count, 0)} ${plural(purchase.count, purchase.noun)}`,
        },
      ],
      notes: [
        'Doors count as 21 ft² (2 m²) and windows as 15 ft² (1.4 m²) each.',
        'Rough, porous or dark surfaces, and big colour changes, can need more paint or a primer coat.',
      ],
    };
  },
  content: {
    howItWorks: [
      'The wall area of a rectangular room is its perimeter multiplied by the wall height: 2 × (length + width) × height. The calculator subtracts a typical area for each door and window, adds the ceiling if you are painting it, and multiplies by the number of coats.',
      'Dividing that total by the paint’s coverage gives the amount of paint. Coverage varies between products, so the calculator uses the figure you enter and shows the result in both US gallons and liters.',
    ],
    formula: [
      { label: 'Wall area', expression: 'Walls = 2 × (Length + Width) × Height' },
      {
        label: 'Area to paint',
        expression: 'Area = Walls − Doors × 21 ft² − Windows × 15 ft² (+ Ceiling)',
      },
      { label: 'Paint', expression: 'Paint = Area × Coats ÷ Coverage' },
    ],
    assumptions: [
      'Door and window areas are typical sizes (3 × 7 ft doors, 3 × 5 ft windows). For large windows or sliding doors, use the “total wall area” option and subtract them yourself.',
      'Coverage on the can assumes a smooth, primed surface. Textured walls, bare plaster and new drywall usually take more.',
      'Trim, skirting boards and doors themselves are not included.',
    ],
    examples: [
      {
        title: 'A 12 × 10 ft bedroom with 8 ft walls',
        values: {
          mode: 'room',
          length: { value: '12', unit: 'ft' },
          width: { value: '10', unit: 'ft' },
          height: { value: '8', unit: 'ft' },
          ceiling: 'no',
          doors: '1',
          windows: '2',
          coats: '2',
          coverage: '350',
          coverageUnit: 'ft2gal',
        },
        steps: [
          'Walls = 2 × (12 + 10) × 8 = 352 ft²',
          'Openings = 1 × 21 + 2 × 15 = 51 ft²',
          'Area = 352 − 51 = 301 ft²',
          'Paint = 301 × 2 coats ÷ 350 = 1.72 gallons, so buy 2 gallon cans',
        ],
        expected: '1.72',
      },
    ],
    faq: [
      {
        question: 'How much area does a gallon of paint cover?',
        answer:
          'Many interior wall paints are rated for about 350 to 400 square feet per US gallon for one coat on a smooth, primed surface. Check the label of the paint you are using.',
      },
      {
        question: 'Do I need two coats of paint?',
        answer:
          'Two coats give a more even, durable finish and are standard practice, especially when changing colour. One coat can be enough when repainting the same colour with a good-quality paint.',
      },
      {
        question: 'Should I include primer?',
        answer:
          'Primer is a separate product. Run the calculator again with one coat and the primer’s coverage to estimate how much primer to buy.',
      },
    ],
  },
};
