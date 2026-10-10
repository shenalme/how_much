import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatNumber } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import { circleArea, LENGTH_UNITS, rectangleArea, triangleArea } from '../../shared/area';

const lengthField = (
  id: string,
  label: string,
  value: string,
  shapes: string[],
  help?: string,
) => ({
  id,
  kind: 'unit' as const,
  label,
  help,
  dimension: 'length' as const,
  units: LENGTH_UNITS,
  defaultUnit: 'ft',
  default: value,
  exclusiveMin: true,
  showWhen: { field: 'shape', equals: shapes },
});

export const calculator: CalculatorDefinition = {
  slug: 'garden-area-calculator',
  intro:
    'Measure your bed, border or lawn and get its area in square feet, square meters and acres. Split irregular spaces into simple shapes and add the results.',
  fields: [
    {
      id: 'shape',
      kind: 'select',
      label: 'Shape',
      options: [
        { value: 'rectangle', label: 'Rectangle or square' },
        { value: 'circle', label: 'Circle' },
        { value: 'triangle', label: 'Triangle' },
      ],
      default: 'rectangle',
      wide: true,
    },
    lengthField('length', 'Length', '20', ['rectangle']),
    lengthField('width', 'Width', '15', ['rectangle']),
    lengthField(
      'diameter',
      'Diameter',
      '10',
      ['circle'],
      'The distance straight across through the center.',
    ),
    lengthField('base', 'Base', '12', ['triangle'], 'The length of any one side.'),
    lengthField(
      'height',
      'Height',
      '8',
      ['triangle'],
      'The perpendicular distance from the base to the opposite corner.',
    ),
  ],
  calculate(inputs) {
    const shape = inputs.select('shape');
    let area: number;
    let perimeter: number | null = null;
    let unitId: string;
    if (shape === 'circle') {
      const d = inputs.unit('diameter');
      area = circleArea(d);
      perimeter = Math.PI * d;
      unitId = inputs.unitOf('diameter');
    } else if (shape === 'triangle') {
      area = triangleArea(inputs.unit('base'), inputs.unit('height'));
      unitId = inputs.unitOf('base');
    } else {
      const l = inputs.unit('length');
      const w = inputs.unit('width');
      area = rectangleArea(l, w);
      perimeter = 2 * (l + w);
      unitId = inputs.unitOf('length');
    }
    const metric = isMetric(unitId);
    const ft2 = fromBase(area, 'ft2');
    const headline = metric
      ? { value: formatNumber(area, 2), unit: 'square meters' }
      : { value: formatNumber(ft2, 2), unit: 'square feet' };
    const other = metric ? `${formatNumber(ft2, 2)} ft²` : `${formatNumber(area, 2)} m²`;

    const details: ResultDetail[] = [
      { label: 'Square feet', value: `${formatNumber(ft2, 2)} ft²` },
      { label: 'Square meters', value: `${formatNumber(area, 2)} m²` },
      { label: 'Square yards', value: `${formatNumber(fromBase(area, 'yd2'), 2)} yd²` },
      { label: 'Acres', value: formatNumber(fromBase(area, 'acre'), 4) },
      { label: 'Hectares', value: formatNumber(fromBase(area, 'ha'), 4) },
    ];
    if (perimeter !== null) {
      details.push({
        label: shape === 'circle' ? 'Circumference (for edging)' : 'Perimeter (for edging)',
        value: metric
          ? `${formatNumber(perimeter, 2)} m`
          : `${formatNumber(fromBase(perimeter, 'ft'), 2)} ft`,
      });
    }

    return {
      headline,
      summary: `The area is ${headline.value} ${headline.unit} (${other}).`,
      details,
    };
  },
  content: {
    howItWorks: [
      'Each shape has its own area formula. A rectangle is length × width. A circle is π × radius², where the radius is half the diameter. A triangle is half of base × height, where the height is measured at a right angle to the base.',
      'For an irregular garden, divide it into rectangles, circles and triangles, calculate each one and add the areas together. Measurements in different units are converted before multiplying, so you can mix feet and inches or meters and centimeters.',
    ],
    formula: [
      { label: 'Rectangle', expression: 'Area = Length × Width' },
      { label: 'Circle', expression: 'Area = π × (Diameter ÷ 2)²' },
      { label: 'Triangle', expression: 'Area = Base × Height ÷ 2' },
      { label: 'Square meters', expression: '1 m² = 10.7639 ft²' },
      { label: 'Acres and hectares', expression: '1 acre = 43,560 ft², 1 hectare = 10,000 m²' },
    ],
    examples: [
      {
        title: 'A 20 × 15 ft rectangular bed',
        values: {
          shape: 'rectangle',
          length: { value: '20', unit: 'ft' },
          width: { value: '15', unit: 'ft' },
        },
        steps: ['Area = 20 ft × 15 ft = 300 ft²', 'Perimeter = 2 × (20 + 15) = 70 ft'],
        expected: '300',
      },
      {
        title: 'A round bed 10 ft across',
        values: { shape: 'circle', diameter: { value: '10', unit: 'ft' } },
        steps: ['Radius = 10 ÷ 2 = 5 ft', 'Area = π × 5² = 78.54 ft²'],
        expected: '78.54',
      },
    ],
    faq: [
      {
        question: 'How do I measure an irregular garden?',
        answer:
          'Split it into simple shapes: rectangles for the main areas, triangles for angled corners and circles or half-circles for curves. Calculate each part and add them. For a half-circle, calculate the full circle and halve it.',
      },
      {
        question: 'How many square feet are in an acre?',
        answer: 'An acre is exactly 43,560 square feet, or about 4,046.86 square meters.',
      },
      {
        question: 'How do I convert square feet to square meters?',
        answer: 'Multiply square feet by 0.09290304, or divide by about 10.764.',
      },
    ],
  },
};
