import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatMoney, formatNumber, plural } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import { areaFields, measuredInMetric, readArea } from '../../shared/area';
import { ceilCount } from '../../shared/volume';

export const calculator: CalculatorDefinition = {
  slug: 'flooring-calculator',
  intro:
    'Enter your room size, waste allowance and the coverage of one box to see how much flooring to order and what it will cost.',
  fields: [
    ...areaFields({
      noun: 'room',
      shapes: ['rectangle', 'area'],
      length: '12',
      width: '10',
      area: '120',
    }),
    {
      id: 'waste',
      kind: 'number',
      label: 'Extra for waste',
      help: 'About 10% for straight installs; 15% or more for diagonal or herringbone patterns.',
      default: '10',
      suffix: '%',
      max: 100,
    },
    {
      id: 'box',
      kind: 'unit',
      label: 'Coverage per box',
      help: 'Printed on the box or product page.',
      dimension: 'area',
      units: ['ft2', 'm2'],
      defaultUnit: 'ft2',
      default: '20',
      exclusiveMin: true,
    },
    {
      id: 'price',
      kind: 'number',
      label: 'Price per box',
      default: '',
      optional: true,
      placeholder: 'e.g. 45.99',
    },
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const waste = inputs.num('waste');
    const needed = area * (1 + waste / 100);
    const boxArea = inputs.unit('box');
    const boxes = ceilCount(needed / boxArea);
    const purchased = boxes * boxArea;
    const metric = measuredInMetric(inputs) || isMetric(inputs.unitOf('box'));
    const areaText = (m2: number) =>
      metric ? `${formatNumber(m2, 2)} m²` : `${formatNumber(fromBase(m2, 'ft2'), 1)} ft²`;
    const headline = metric
      ? { value: formatNumber(needed, 2), unit: 'square meters' }
      : { value: formatNumber(fromBase(needed, 'ft2'), 1), unit: 'square feet' };

    const details: ResultDetail[] = [
      { label: 'Room area', value: areaText(area) },
      { label: `Area with ${formatNumber(waste, 1)}% waste`, value: areaText(needed) },
      { label: 'Boxes', value: `${formatNumber(boxes, 0)} ${plural(boxes, 'box', 'boxes')}` },
      { label: 'Area in those boxes', value: areaText(purchased) },
    ];
    const price = inputs.optionalNum('price');
    if (price !== null) details.push({ label: 'Total cost', value: formatMoney(boxes * price) });

    return {
      headline,
      summary: `You need about ${headline.value} ${headline.unit} of flooring: ${formatNumber(boxes, 0)} ${plural(boxes, 'box', 'boxes')}.`,
      details,
      notes: ['Buy all boxes from the same batch or dye lot so the colour matches.'],
    };
  },
  content: {
    howItWorks: [
      'The calculator finds the floor area (length × width, or the area you enter), adds a waste allowance for cuts and offcuts, then divides by the coverage of one box and rounds up to whole boxes.',
      'Waste covers boards cut to length at walls, pieces lost to damage and pattern matching. Straight installs in simple rooms waste the least; diagonal and herringbone layouts and rooms with many corners waste more.',
    ],
    formula: [
      { label: 'Area needed', expression: 'Area needed = Room area × (1 + Waste % ÷ 100)' },
      { label: 'Boxes', expression: 'Boxes = Area needed ÷ Coverage per box, rounded up' },
      { label: 'Cost', expression: 'Cost = Boxes × Price per box' },
    ],
    assumptions: [
      'The room is measured wall to wall. Add closets and doorways separately if they are being floored.',
      'Underlayment, transition strips and skirting are not included.',
    ],
    examples: [
      {
        title: 'A 12 × 10 ft room with 20 ft² boxes',
        values: {
          shape: 'rectangle',
          length: { value: '12', unit: 'ft' },
          width: { value: '10', unit: 'ft' },
          waste: '10',
          box: { value: '20', unit: 'ft2' },
        },
        steps: [
          'Room area = 12 × 10 = 120 ft²',
          'With 10% waste: 120 × 1.10 = 132 ft²',
          'Boxes = 132 ÷ 20 = 6.6, rounded up to 7 boxes',
        ],
        expected: '132',
      },
    ],
    faq: [
      {
        question: 'How much extra flooring should I buy?',
        answer:
          'About 10% extra is a common allowance for straight installations. Use 15% or more for diagonal or herringbone patterns, or rooms with lots of angles. Keeping a spare box is also useful for future repairs.',
      },
      {
        question: 'How do I measure a room for flooring?',
        answer:
          'Measure the length and width at the widest points and multiply. For L-shaped rooms, split the room into rectangles, add the areas and use the “I know the area” option.',
      },
      {
        question: 'Should flooring acclimate before installation?',
        answer:
          'Many wood and laminate products recommend leaving the boxes in the room for a period before installing. Follow the manufacturer’s instructions for your product.',
      },
    ],
  },
};
