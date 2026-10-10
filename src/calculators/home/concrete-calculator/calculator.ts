import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { convert, fromBase, isMetric } from '../../../utils/units';
import { circleArea, LENGTH_UNITS, SHORT_LENGTH_UNITS } from '../../shared/area';
import { ceilCount, volumeDetails, volumeHeadline } from '../../shared/volume';

/**
 * Typical yields of premixed concrete bags (as printed by major US brands):
 * 40 lb ≈ 0.30 ft³, 60 lb ≈ 0.45 ft³, 80 lb ≈ 0.60 ft³.
 * Metric bags are estimated from the same yield per kilogram.
 */
const YIELD_M3_PER_KG = convert(0.6, 'ft3', 'm3') / convert(80, 'lb', 'kg');
export const BAGS = [
  { label: '80 lb bags', m3: convert(0.6, 'ft3', 'm3') },
  { label: '60 lb bags', m3: convert(0.45, 'ft3', 'm3') },
  { label: '40 lb bags', m3: convert(0.3, 'ft3', 'm3') },
  { label: '25 kg bags (approx.)', m3: 25 * YIELD_M3_PER_KG },
  { label: '20 kg bags (approx.)', m3: 20 * YIELD_M3_PER_KG },
];

const show = (shapes: string[]) => ({ field: 'shape', equals: shapes });

export const calculator: CalculatorDefinition = {
  slug: 'concrete-calculator',
  intro:
    'Enter the size of your slab, footing or post holes to find how much concrete to order as ready-mix or how many premixed bags to buy.',
  fields: [
    {
      id: 'shape',
      kind: 'select',
      label: 'What are you pouring?',
      options: [
        { value: 'slab', label: 'Slab, patio or rectangular footing' },
        { value: 'round', label: 'Round post hole or column' },
      ],
      default: 'slab',
      wide: true,
    },
    {
      id: 'length',
      kind: 'unit',
      label: 'Length',
      dimension: 'length',
      units: LENGTH_UNITS,
      defaultUnit: 'ft',
      default: '10',
      exclusiveMin: true,
      showWhen: show(['slab']),
    },
    {
      id: 'width',
      kind: 'unit',
      label: 'Width',
      dimension: 'length',
      units: LENGTH_UNITS,
      defaultUnit: 'ft',
      default: '10',
      exclusiveMin: true,
      showWhen: show(['slab']),
    },
    {
      id: 'thickness',
      kind: 'unit',
      label: 'Thickness',
      help: 'Patios and walkways are commonly 4 in (10 cm) thick.',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '4',
      exclusiveMin: true,
      showWhen: show(['slab']),
    },
    {
      id: 'diameter',
      kind: 'unit',
      label: 'Hole diameter',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '10',
      exclusiveMin: true,
      showWhen: show(['round']),
    },
    {
      id: 'depth',
      kind: 'unit',
      label: 'Hole depth',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '36',
      exclusiveMin: true,
      showWhen: show(['round']),
    },
    {
      id: 'quantity',
      kind: 'number',
      label: 'How many',
      default: '1',
      integer: true,
      min: 1,
      max: 100000,
    },
    {
      id: 'waste',
      kind: 'number',
      label: 'Extra for waste and spillage',
      help: '5–10% is typical for uneven ground and spillage.',
      default: '10',
      suffix: '%',
      max: 100,
    },
  ],
  calculate(inputs) {
    const round = inputs.select('shape') === 'round';
    const each = round
      ? circleArea(inputs.unit('diameter')) * inputs.unit('depth')
      : inputs.unit('length') * inputs.unit('width') * inputs.unit('thickness');
    const quantity = inputs.num('quantity');
    const waste = inputs.num('waste');
    const volume = each * quantity * (1 + waste / 100);
    const metric = isMetric(inputs.unitOf(round ? 'diameter' : 'length'));
    const headline = volumeHeadline(volume, metric);
    const bags = (metric ? BAGS.slice(3) : BAGS.slice(0, 3)).map((bag) => {
      const count = ceilCount(volume / bag.m3);
      return { label: bag.label, value: `${formatNumber(count, 0)} ${plural(count, 'bag')}` };
    });

    return {
      headline,
      summary: `You need approximately ${headline.value} ${headline.unit} of concrete${waste > 0 ? `, including ${formatNumber(waste, 1)}% extra` : ''}.`,
      details: [
        ...volumeDetails(volume).slice(0, 3),
        ...bags,
        ...(quantity > 1
          ? [
              {
                label: 'Per item, without extra',
                value: `${formatNumber(fromBase(each, 'ft3'), 2)} ft³ (${formatNumber(each, 3)} m³)`,
              },
            ]
          : []),
      ],
      notes: [
        'Bag yields vary by product; check the yield printed on the bag.',
        'Ready-mix suppliers often have a minimum order, so small jobs are usually done with bags.',
      ],
    };
  },
  content: {
    howItWorks: [
      'Concrete is ordered by volume. A slab or rectangular footing is length × width × thickness; a round post hole or column is π × radius² × depth. The calculator converts every measurement to the same unit first, so you can mix feet and inches.',
      'The volume is multiplied by the number of items and a waste allowance for spillage, uneven ground and over-excavation. The result is given in cubic yards (the usual US ready-mix unit) or cubic meters, and in bags of premixed concrete based on typical bag yields.',
    ],
    formula: [
      { label: 'Slab or footing', expression: 'Volume = Length × Width × Thickness' },
      { label: 'Round hole or column', expression: 'Volume = π × (Diameter ÷ 2)² × Depth' },
      { label: 'Total', expression: 'Total = Volume × Quantity × (1 + Waste % ÷ 100)' },
      { label: 'Cubic yards', expression: 'Cubic yards = Cubic feet ÷ 27' },
    ],
    assumptions: [
      'Bag yields: 80 lb ≈ 0.60 ft³, 60 lb ≈ 0.45 ft³, 40 lb ≈ 0.30 ft³. Metric bag counts are estimated from the same yield per kilogram; check your product.',
      'For post holes, the volume of the post itself is not subtracted, which leaves a small margin.',
      'This estimates material only. Slab thickness, reinforcement and footing sizes should follow local building codes.',
    ],
    examples: [
      {
        title: 'A 10 × 10 ft patio slab, 4 inches thick',
        values: {
          shape: 'slab',
          length: { value: '10', unit: 'ft' },
          width: { value: '10', unit: 'ft' },
          thickness: { value: '4', unit: 'in' },
          quantity: '1',
          waste: '10',
        },
        steps: [
          'Volume = 10 × 10 × (4 ÷ 12) = 33.33 ft³',
          'With 10% extra: 33.33 × 1.10 = 36.67 ft³',
          '36.67 ÷ 27 = 1.36 yd³',
          '80 lb bags: 36.67 ÷ 0.60 = 61.1, rounded up to 62 bags',
        ],
        expected: '1.36',
      },
      {
        title: 'Eight fence post holes, 10 in wide and 36 in deep',
        values: {
          shape: 'round',
          diameter: { value: '10', unit: 'in' },
          depth: { value: '36', unit: 'in' },
          quantity: '8',
          waste: '10',
        },
        steps: [
          'One hole = π × 5² × 36 = 2,827 in³ = 1.64 ft³',
          'Eight holes = 13.09 ft³; with 10% extra = 14.40 ft³',
          '14.40 ÷ 27 = 0.53 yd³, or 24 bags of 80 lb',
        ],
        expected: '0.53',
      },
    ],
    faq: [
      {
        question: 'How many 80 lb bags of concrete are in a cubic yard?',
        answer:
          'At a typical yield of 0.60 cubic feet per bag, one cubic yard (27 cubic feet) takes 45 bags of 80 lb, 60 bags of 60 lb or 90 bags of 40 lb.',
      },
      {
        question: 'How thick should a concrete slab be?',
        answer:
          'Patios and walkways are commonly 4 inches (10 cm) thick, and driveways often 4 to 6 inches. Requirements depend on loads, soil and local codes.',
      },
      {
        question: 'Should I order extra concrete?',
        answer:
          'Yes. Running short during a pour causes weak joints, so most people add 5 to 10% for uneven subgrade, spillage and form flex.',
      },
    ],
  },
};
