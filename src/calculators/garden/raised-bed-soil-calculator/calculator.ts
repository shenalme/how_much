import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { fromBase } from '../../../utils/units';
import { areaFields, measuredInMetric, readArea, SHORT_LENGTH_UNITS } from '../../shared/area';
import {
  bagsDetail,
  bagsNeeded,
  bagSizeField,
  parseBagSize,
  volumeDetails,
  volumeHeadline,
} from '../../shared/volume';

export const calculator: CalculatorDefinition = {
  slug: 'raised-bed-soil-calculator',
  intro:
    'Enter the size of your raised beds to see how much soil it takes to fill them, and how to split that between topsoil and compost.',
  fields: [
    ...areaFields({
      noun: 'bed',
      shapes: ['rectangle', 'circle'],
      length: '8',
      width: '4',
      diameter: '4',
    }),
    {
      id: 'height',
      kind: 'unit',
      label: 'Soil depth in the bed',
      help: 'Usually the height of the bed minus an inch or two at the top.',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '12',
      exclusiveMin: true,
      max: 1000,
    },
    {
      id: 'beds',
      kind: 'number',
      label: 'Number of beds',
      default: '1',
      integer: true,
      min: 1,
      max: 10000,
    },
    {
      id: 'compost',
      kind: 'number',
      label: 'Compost share of the mix',
      help: 'Set to 0 if you are buying a ready-mixed raised bed soil.',
      default: '30',
      suffix: '%',
      min: 0,
      max: 100,
    },
    bagSizeField(),
  ],
  calculate(inputs) {
    const perBed = readArea(inputs) * inputs.unit('height');
    const beds = inputs.num('beds');
    const total = perBed * beds;
    const compostShare = inputs.num('compost') / 100;
    const metric = measuredInMetric(inputs);
    const headline = volumeHeadline(total, metric);
    const bag = parseBagSize(inputs.select('bag'));
    const bags = bagsNeeded(total, bag.m3);
    const perBedHeadline = volumeHeadline(perBed, metric);
    const describe = (m3: number) =>
      metric
        ? `${formatNumber(m3, 2)} m³ (${formatNumber(fromBase(m3, 'l'), 0)} L)`
        : `${formatNumber(fromBase(m3, 'ft3'), 1)} ft³ (${formatNumber(fromBase(m3, 'yd3'), 2)} yd³)`;

    const details = [
      { label: 'Per bed', value: `${perBedHeadline.value} ${perBedHeadline.unit}` },
      ...volumeDetails(total),
      bagsDetail(bags, bag.label),
    ];
    if (compostShare > 0) {
      details.push(
        { label: 'Topsoil', value: describe(total * (1 - compostShare)) },
        { label: 'Compost', value: describe(total * compostShare) },
      );
    }

    return {
      headline,
      summary: `You need approximately ${headline.value} ${headline.unit} of soil to fill ${formatNumber(beds, 0)} ${plural(beds, 'bed')}.`,
      details,
      notes: ['Bag counts are rounded up to whole bags.'],
    };
  },
  content: {
    howItWorks: [
      'A raised bed is a box, so the soil it holds is its inside length × inside width × the depth of soil. For round beds the area is π × radius². The volume of one bed is multiplied by the number of beds.',
      'If you are mixing your own soil, the compost share splits the total into topsoil and compost. Many gardeners use somewhere between a quarter and a half compost; set it to whatever blend you prefer.',
    ],
    formula: [
      { label: 'Rectangular bed', expression: 'Volume = Length × Width × Depth × Number of beds' },
      { label: 'Round bed', expression: 'Volume = π × (Diameter ÷ 2)² × Depth × Number of beds' },
      { label: 'Mix', expression: 'Compost = Volume × Compost %, Topsoil = Volume − Compost' },
    ],
    assumptions: [
      'Use inside dimensions. Board thickness can make a noticeable difference on small beds.',
      'New beds settle as the soil is watered. Some gardeners fill slightly above the target depth or top up after a few weeks.',
      'If you fill the bottom of a deep bed with other material, enter only the depth of soil.',
    ],
    examples: [
      {
        title: 'Two 8 × 4 ft beds, 12 inches deep',
        values: {
          shape: 'rectangle',
          length: { value: '8', unit: 'ft' },
          width: { value: '4', unit: 'ft' },
          height: { value: '12', unit: 'in' },
          beds: '2',
          compost: '30',
        },
        steps: [
          'One bed = 8 ft × 4 ft × 1 ft = 32 ft³',
          'Two beds = 64 ft³',
          '64 ft³ ÷ 27 = 2.37 yd³',
          'At 30% compost: 19.2 ft³ compost and 44.8 ft³ topsoil',
        ],
        expected: '2.37',
      },
    ],
    faq: [
      {
        question: 'How many bags of soil fill a 4 × 8 raised bed?',
        answer:
          'A 4 × 8 ft bed holds 32 cubic feet of soil per foot of depth. At 12 inches deep that is 16 bags of 2 cubic feet, or about 11 bags of 3 cubic feet (10.7 rounded up).',
      },
      {
        question: 'How deep should a raised bed be?',
        answer:
          'Many vegetables grow well in 8 to 12 inches (20 to 30 cm) of good soil, while deep-rooted crops benefit from more. If the bed sits on open ground, roots can also grow down into the soil beneath.',
      },
      {
        question: 'Can I use only compost in a raised bed?',
        answer:
          'Pure compost can be too rich and tends to shrink as it breaks down, so most guides recommend blending it with topsoil. Check the advice for the plants you intend to grow.',
      },
    ],
  },
};
