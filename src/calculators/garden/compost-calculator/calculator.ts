import type { CalculatorDefinition } from '../../types';
import { formatNumber } from '../../../utils/format';
import { convert, fromBase, isMetric } from '../../../utils/units';
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

/** Depth presets in inches. */
const PRESETS: Record<string, { inches: number; label: string }> = {
  'lawn-quarter': { inches: 0.25, label: 'Lawn top-dressing, ¼ in (6 mm)' },
  'lawn-half': { inches: 0.5, label: 'Lawn top-dressing, ½ in (13 mm)' },
  'bed-1': { inches: 1, label: 'Side-dressing beds, 1 in (2.5 cm)' },
  'bed-2': { inches: 2, label: 'Digging into beds, 2 in (5 cm)' },
  'bed-3': { inches: 3, label: 'Preparing new beds, 3 in (7.5 cm)' },
};

export const calculator: CalculatorDefinition = {
  slug: 'compost-calculator',
  intro:
    'Calculate how much compost to buy for top-dressing a lawn or working into garden beds. Choose a typical depth or enter your own.',
  fields: [
    ...areaFields({ noun: 'area', shapes: ['area', 'rectangle', 'circle'], area: '1000' }),
    {
      id: 'application',
      kind: 'select',
      label: 'How you will use it',
      options: [
        ...Object.entries(PRESETS).map(([value, preset]) => ({ value, label: preset.label })),
        { value: 'custom', label: 'Custom depth' },
      ],
      default: 'lawn-quarter',
      wide: true,
    },
    {
      id: 'depth',
      kind: 'unit',
      label: 'Compost depth',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '1',
      exclusiveMin: true,
      max: 1000,
      showWhen: { field: 'application', equals: ['custom'] },
    },
    bagSizeField(),
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const application = inputs.select('application');
    const preset = PRESETS[application];
    const depth = preset ? convert(preset.inches, 'in', 'm') : inputs.unit('depth');
    const volume = area * depth;
    const metric = measuredInMetric(inputs) || (!preset && isMetric(inputs.unitOf('depth')));
    const headline = volumeHeadline(volume, metric);
    const bag = parseBagSize(inputs.select('bag'));
    const bags = bagsNeeded(volume, bag.m3);
    const depthText = metric
      ? `${formatNumber(depth * 100, 1)} cm`
      : `${formatNumber(fromBase(depth, 'in'), 2)} in`;

    return {
      headline,
      summary: `You need approximately ${headline.value} ${headline.unit} of compost for a ${depthText} layer.`,
      details: [...areaDetails(area), ...volumeDetails(volume), bagsDetail(bags, bag.label)],
      notes: ['Bag counts are rounded up to whole bags.'],
    };
  },
  content: {
    howItWorks: [
      'Compost volume is the area you are covering multiplied by the thickness of the layer. The presets cover the most common jobs: a thin top-dressing that settles into lawn grass, a layer spread around existing plants, and a thicker layer dug into new or tired beds.',
      'The depth is converted to the same unit as the area before multiplying, and the volume is shown in cubic yards or cubic meters, liters and bags.',
    ],
    formula: [
      { label: 'Volume', expression: 'Volume = Area × Depth' },
      {
        label: 'Square feet and inches',
        expression: 'Cubic yards = Area (ft²) × Depth (in) ÷ 12 ÷ 27',
      },
    ],
    assumptions: [
      'The preset depths are common starting points, not prescriptions. Soil tests and local extension advice can tell you how much organic matter your soil actually needs.',
      'Compost is assumed to be spread evenly at the chosen depth.',
    ],
    examples: [
      {
        title: 'Top-dressing a 1,000 ft² lawn with ¼ inch of compost',
        values: {
          shape: 'area',
          area: { value: '1000', unit: 'ft2' },
          application: 'lawn-quarter',
        },
        steps: [
          'Depth = 0.25 in ÷ 12 = 0.02083 ft',
          'Volume = 1,000 ft² × 0.02083 ft = 20.83 ft³',
          '20.83 ft³ ÷ 27 = 0.77 yd³',
        ],
        expected: '0.77',
      },
    ],
    faq: [
      {
        question: 'How thick should compost be when top-dressing a lawn?',
        answer:
          'A thin layer of about ¼ to ½ inch (6 to 13 mm) is typical, so that it settles between the grass blades without smothering them. Raking it in after spreading helps.',
      },
      {
        question: 'How much compost should I add to a garden bed?',
        answer:
          'Gardeners often spread 1 to 3 inches (2.5 to 7.5 cm) of compost and mix it into the top few inches of soil. The right amount depends on your soil; a soil test is the best guide.',
      },
      {
        question: 'How much area does a cubic yard of compost cover?',
        answer:
          'One cubic yard covers about 1,296 square feet at ¼ inch, 648 square feet at ½ inch and 162 square feet at 2 inches.',
      },
    ],
  },
};
