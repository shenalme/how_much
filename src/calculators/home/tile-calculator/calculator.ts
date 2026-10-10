import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { fromBase } from '../../../utils/units';
import { areaFields, measuredInMetric, readArea } from '../../shared/area';
import { ceilCount } from '../../shared/volume';

const TILE_UNITS = ['in', 'cm', 'mm'];

export const calculator: CalculatorDefinition = {
  slug: 'tile-calculator',
  intro:
    'Enter the area to tile, your tile size and grout joint to see how many tiles and boxes to buy, including spares for cuts and breakage.',
  fields: [
    ...areaFields({
      noun: 'surface',
      shapes: ['rectangle', 'area'],
      length: '10',
      width: '8',
      area: '80',
    }),
    {
      id: 'tileLength',
      kind: 'unit',
      label: 'Tile length',
      dimension: 'length',
      units: TILE_UNITS,
      defaultUnit: 'in',
      default: '12',
      exclusiveMin: true,
    },
    {
      id: 'tileWidth',
      kind: 'unit',
      label: 'Tile width',
      dimension: 'length',
      units: TILE_UNITS,
      defaultUnit: 'in',
      default: '12',
      exclusiveMin: true,
    },
    {
      id: 'grout',
      kind: 'unit',
      label: 'Grout joint width',
      help: 'Fractions work too, e.g. 1/8.',
      dimension: 'length',
      units: ['in', 'mm'],
      defaultUnit: 'in',
      default: '1/8',
      max: 100,
    },
    {
      id: 'waste',
      kind: 'number',
      label: 'Extra for cuts and breakage',
      help: '10% is typical; 15% or more for diagonal layouts or large tiles.',
      default: '10',
      suffix: '%',
      max: 100,
    },
    {
      id: 'perBox',
      kind: 'number',
      label: 'Tiles per box',
      default: '',
      optional: true,
      integer: true,
      min: 1,
      placeholder: 'e.g. 15',
    },
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const waste = inputs.num('waste');
    const grout = inputs.unit('grout');
    const tileFootprint = (inputs.unit('tileLength') + grout) * (inputs.unit('tileWidth') + grout);
    const exact = area / tileFootprint;
    const tiles = ceilCount(exact * (1 + waste / 100));
    const metric = measuredInMetric(inputs);

    const details: ResultDetail[] = [
      {
        label: 'Area to tile',
        value: metric
          ? `${formatNumber(area, 2)} m²`
          : `${formatNumber(fromBase(area, 'ft2'), 1)} ft²`,
      },
      { label: 'Tiles before waste', value: formatNumber(ceilCount(exact), 0) },
      { label: `Tiles with ${formatNumber(waste, 1)}% extra`, value: formatNumber(tiles, 0) },
    ];
    const perBox = inputs.optionalNum('perBox');
    let boxesText = '';
    if (perBox !== null) {
      const boxes = ceilCount(tiles / perBox);
      details.push({
        label: 'Boxes',
        value: `${formatNumber(boxes, 0)} ${plural(boxes, 'box', 'boxes')}`,
      });
      boxesText = ` (${formatNumber(boxes, 0)} ${plural(boxes, 'box', 'boxes')})`;
    }

    return {
      headline: { value: formatNumber(tiles, 0), unit: plural(tiles, 'tile') },
      summary: `You need about ${formatNumber(tiles, 0)} ${plural(tiles, 'tile')}${boxesText}, including ${formatNumber(waste, 1)}% extra.`,
      details,
      notes: ['Keep a few spare tiles from the same batch for future repairs.'],
    };
  },
  content: {
    howItWorks: [
      'Each tile, together with half the grout joint on every side, takes up (tile length + joint) × (tile width + joint) of floor or wall. Dividing the area by that footprint gives the number of tiles that fit.',
      'Tiles along edges have to be cut, and some break, so a waste allowance is added before rounding up. If you enter the number of tiles per box, the calculator also rounds up to whole boxes.',
    ],
    formula: [
      {
        label: 'Tile footprint',
        expression: 'Footprint = (Tile length + Joint) × (Tile width + Joint)',
      },
      { label: 'Tiles', expression: 'Tiles = Area ÷ Footprint × (1 + Waste % ÷ 100), rounded up' },
      { label: 'Boxes', expression: 'Boxes = Tiles ÷ Tiles per box, rounded up' },
    ],
    assumptions: [
      'The area is a flat rectangle or a known total area. Subtract fixtures, cabinets or bathtubs that won’t be tiled.',
      'Very large tiles and patterns such as herringbone produce more offcuts than the default allowance.',
    ],
    examples: [
      {
        title: 'An 8 × 10 ft floor with 12 × 12 inch tiles',
        values: {
          shape: 'rectangle',
          length: { value: '10', unit: 'ft' },
          width: { value: '8', unit: 'ft' },
          tileLength: { value: '12', unit: 'in' },
          tileWidth: { value: '12', unit: 'in' },
          grout: { value: '1/8', unit: 'in' },
          waste: '10',
        },
        steps: [
          'Area = 10 × 8 = 80 ft² = 11,520 in²',
          'Footprint = 12.125 × 12.125 = 147.02 in²',
          'Tiles = 11,520 ÷ 147.02 = 78.36',
          'With 10% extra: 78.36 × 1.10 = 86.2, rounded up to 87 tiles',
        ],
        expected: '87',
      },
    ],
    faq: [
      {
        question: 'How many 12 × 12 tiles do I need for 100 square feet?',
        answer:
          'Without grout joints, 100 tiles exactly. With a ⅛ inch joint each tile covers slightly more, so about 98 tiles fill the space; adding 10% for cuts brings it to about 108.',
      },
      {
        question: 'How much extra tile should I buy?',
        answer:
          'About 10% is a common allowance for straight layouts. Use 15% or more for diagonal or herringbone patterns, large-format tiles or rooms with many obstacles.',
      },
      {
        question: 'Does grout width really matter?',
        answer:
          'For small tiles it can. Wide joints between mosaic or small subway tiles can noticeably reduce the number of tiles needed. For large tiles the difference is small.',
      },
    ],
  },
};
