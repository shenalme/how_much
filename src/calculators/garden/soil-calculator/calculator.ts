import type { CalculatorDefinition } from '../../types';
import { formatNumber } from '../../../utils/format';
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

export const calculator: CalculatorDefinition = {
  slug: 'soil-calculator',
  intro:
    'Find out how much topsoil or garden soil to order for a new bed, a lawn area or leveling, from the area and the depth you need to fill.',
  fields: [
    ...areaFields({ noun: 'area' }),
    {
      id: 'depth',
      kind: 'unit',
      label: 'Soil depth',
      help: 'The depth of soil you want once it has settled.',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '4',
      exclusiveMin: true,
      max: 1000,
    },
    {
      id: 'settling',
      kind: 'select',
      label: 'Extra for settling',
      help: 'Loose soil settles after it is watered and walked on.',
      options: [
        { value: '0', label: 'None' },
        { value: '10', label: '10% extra' },
        { value: '15', label: '15% extra' },
        { value: '20', label: '20% extra' },
      ],
      default: '10',
    },
    bagSizeField(),
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const depth = inputs.unit('depth');
    const settling = Number(inputs.select('settling'));
    const baseVolume = area * depth;
    const volume = baseVolume * (1 + settling / 100);
    const metric = measuredInMetric(inputs);
    const headline = volumeHeadline(volume, metric);
    const bag = parseBagSize(inputs.select('bag'));
    const bags = bagsNeeded(volume, bag.m3);
    const baseHeadline = volumeHeadline(baseVolume, metric);

    return {
      headline,
      summary: `You need approximately ${headline.value} ${headline.unit} of soil${
        settling > 0 ? `, including ${settling}% extra for settling` : ''
      }.`,
      details: [
        ...areaDetails(area),
        { label: 'Volume before allowance', value: `${baseHeadline.value} ${baseHeadline.unit}` },
        ...volumeDetails(volume),
        bagsDetail(bags, bag.label),
      ],
      notes:
        settling > 0
          ? [
              `The ${formatNumber(settling, 0)}% allowance is included in every figure above except “Volume before allowance”.`,
            ]
          : undefined,
    };
  },
  content: {
    howItWorks: [
      'Soil is sold by volume. The calculator multiplies the area you are filling by the depth you need, converting the depth to feet or meters first so the units match.',
      'Freshly delivered soil is loose and full of air pockets, so it settles once it is spread, watered and walked on. The settling option adds a percentage on top of the measured volume so that you finish at the depth you wanted. The result is shown in cubic yards (or cubic meters if you measured in metric) and as a number of bags.',
    ],
    formula: [
      { label: 'Volume', expression: 'Volume = Area × Depth × (1 + Settling % ÷ 100)' },
      {
        label: 'Feet and inches',
        expression: 'Cubic yards = Length (ft) × Width (ft) × Depth (in) ÷ 12 ÷ 27',
      },
      { label: 'Bags', expression: 'Bags = Volume ÷ Bag volume, rounded up' },
    ],
    assumptions: [
      'The area is treated as level, with the same depth everywhere. For sloped or uneven ground, measure the average depth.',
      'How much soil settles depends on its moisture, texture and how it is compacted, so the settling allowance is an estimate.',
      'Bag counts use the volume printed on the bag.',
    ],
    examples: [
      {
        title: 'Topping up a 20 × 15 ft area by 4 inches',
        values: {
          shape: 'rectangle',
          length: { value: '20', unit: 'ft' },
          width: { value: '15', unit: 'ft' },
          depth: { value: '4', unit: 'in' },
          settling: '10',
        },
        steps: [
          'Area = 20 ft × 15 ft = 300 ft²',
          'Volume = 300 ft² × (4 ÷ 12) ft = 100 ft³',
          'With 10% for settling: 100 ft³ × 1.10 = 110 ft³',
          '110 ft³ ÷ 27 = 4.07 yd³',
        ],
        expected: '4.07',
      },
    ],
    faq: [
      {
        question: 'How much does a cubic yard of topsoil cover?',
        answer:
          'One cubic yard (27 cubic feet) covers 324 square feet at 1 inch deep, 81 square feet at 4 inches and about 54 square feet at 6 inches. Divide 324 by the depth in inches to get the coverage in square feet.',
      },
      {
        question: 'How deep should topsoil be for a new lawn?',
        answer:
          'Lawn guides commonly suggest around 4 to 6 inches (10 to 15 cm) of good topsoil for new grass. For top-dressing an existing lawn, a much thinner layer of about ¼ to ½ inch is typical.',
      },
      {
        question: 'Is it cheaper to buy soil in bulk or in bags?',
        answer:
          'For more than about a cubic yard, bulk delivery is usually cheaper per unit volume, though delivery fees vary. Compare suppliers using the price per cubic yard or cubic meter: one cubic yard equals 13.5 bags of 2 cubic feet.',
      },
    ],
  },
};
