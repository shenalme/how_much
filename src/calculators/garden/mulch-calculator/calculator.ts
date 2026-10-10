import type { CalculatorDefinition } from '../../types';
import { areaFields, measuredInMetric, readArea, SHORT_LENGTH_UNITS } from '../../shared/area';
import {
  areaDetails,
  bagsDetail,
  bagsNeeded,
  bagSizeField,
  parseBagSize,
  volumeDetails,
  volumeHeadline,
} from '../../shared/volume';

const TWO_INCHES = 0.0508;
const FOUR_INCHES = 0.1016;

export const calculator: CalculatorDefinition = {
  slug: 'mulch-calculator',
  intro:
    'Calculate how much mulch you need based on the area you want to cover and your desired depth.',
  fields: [
    ...areaFields({ noun: 'bed' }),
    {
      id: 'depth',
      kind: 'unit',
      label: 'Mulch depth',
      help: 'Most beds need 2–4 inches (5–10 cm).',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '3',
      exclusiveMin: true,
      max: 100,
    },
    bagSizeField(),
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const depth = inputs.unit('depth');
    const volume = area * depth;
    const metric = measuredInMetric(inputs);
    const headline = volumeHeadline(volume, metric);
    const bag = parseBagSize(inputs.select('bag'));
    const bags = bagsNeeded(volume, bag.m3);

    const notes: string[] = [];
    if (depth > FOUR_INCHES) {
      notes.push(
        'Layers deeper than about 4 inches (10 cm) can keep air and water from reaching roots.',
      );
    } else if (depth < TWO_INCHES) {
      notes.push('Layers thinner than about 2 inches (5 cm) suppress weeds less effectively.');
    }
    notes.push('Bag counts are rounded up to whole bags.');

    return {
      headline,
      summary: `You need approximately ${headline.value} ${headline.unit} of mulch.`,
      details: [...areaDetails(area), ...volumeDetails(volume), bagsDetail(bags, bag.label)],
      notes,
    };
  },
  content: {
    howItWorks: [
      'Mulch is sold by volume, so the calculator multiplies the area of your bed by the depth of mulch you want. The area comes from length × width for rectangular beds, or π × radius² for round ones.',
      'Depth is usually measured in inches or centimeters while the area is in feet or meters, so the depth is converted to the same unit before multiplying. The volume is then shown in cubic yards (the usual unit for bulk delivery in the US), cubic feet, cubic meters and liters, along with the number of bags of your chosen size.',
    ],
    formula: [
      { label: 'Volume', expression: 'Volume = Area × Depth' },
      {
        label: 'Rectangular bed, in feet and inches',
        expression: 'Cubic feet = Length (ft) × Width (ft) × Depth (in) ÷ 12',
      },
      { label: 'Converting to cubic yards', expression: 'Cubic yards = Cubic feet ÷ 27' },
      { label: 'Bags', expression: 'Bags = Cubic feet ÷ Bag size (cu ft), rounded up' },
    ],
    assumptions: [
      'The bed is treated as flat with an even depth of mulch.',
      'No allowance is added for settling. Fresh mulch compacts a little after watering, so you may want 5–10% extra.',
      'Bag counts use the nominal volume printed on the bag.',
    ],
    examples: [
      {
        title: 'A 20 × 15 ft bed at 3 inches deep',
        values: {
          shape: 'rectangle',
          length: { value: '20', unit: 'ft' },
          width: { value: '15', unit: 'ft' },
          depth: { value: '3', unit: 'in' },
        },
        steps: [
          'Area = 20 ft × 15 ft = 300 ft²',
          'Depth = 3 in ÷ 12 = 0.25 ft',
          'Volume = 300 ft² × 0.25 ft = 75 ft³',
          '75 ft³ ÷ 27 = 2.78 yd³, or 38 bags of 2 cu ft (37.5 rounded up)',
        ],
        expected: '2.78',
      },
      {
        title: 'A 4 × 2.5 m border at 7.5 cm deep',
        values: {
          shape: 'rectangle',
          length: { value: '4', unit: 'm' },
          width: { value: '2.5', unit: 'm' },
          depth: { value: '7.5', unit: 'cm' },
          bag: 'l:50',
        },
        steps: [
          'Area = 4 m × 2.5 m = 10 m²',
          'Depth = 7.5 cm = 0.075 m',
          'Volume = 10 m² × 0.075 m = 0.75 m³ = 750 L',
          '750 L ÷ 50 L per bag = 15 bags',
        ],
        expected: '0.75',
      },
    ],
    faq: [
      {
        question: 'How deep should mulch be?',
        answer:
          'For most flower beds and shrub borders, 2 to 4 inches (5 to 10 cm) is enough to suppress weeds and hold moisture. Keep mulch a few inches away from plant stems and tree trunks, because mulch piled against bark can encourage rot.',
      },
      {
        question: 'How many bags of mulch are in a cubic yard?',
        answer:
          'A cubic yard is 27 cubic feet, so it takes 13.5 bags of 2 cubic feet or 9 bags of 3 cubic feet to make one cubic yard.',
      },
      {
        question: 'How much area does one cubic yard of mulch cover?',
        answer:
          'Divide 324 by the depth in inches. One cubic yard covers about 162 square feet at 2 inches, 108 square feet at 3 inches and 81 square feet at 4 inches.',
      },
      {
        question: 'Do I need to remove old mulch first?',
        answer:
          'Not usually. Measure how deep the existing layer is and enter only the extra depth you need to reach your target. If old mulch has matted into a crust, loosen it with a rake first.',
      },
    ],
  },
};
