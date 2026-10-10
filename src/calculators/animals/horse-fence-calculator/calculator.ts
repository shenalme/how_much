import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import { fenceMaterials } from '../../shared/fence';

const len = (id: string, label: string, value: string, shapes?: string[], help?: string) => ({
  id,
  kind: 'unit' as const,
  label,
  help,
  dimension: 'length' as const,
  units: ['ft', 'm', 'yd'],
  defaultUnit: 'ft',
  default: value,
  exclusiveMin: true,
  showWhen: shapes ? { field: 'shape', equals: shapes } : undefined,
});

export const calculator: CalculatorDefinition = {
  slug: 'horse-fence-calculator',
  intro:
    'Enter the size of your paddock or its perimeter to estimate fence posts and the total length of rails, boards or electric tape.',
  fields: [
    {
      id: 'shape',
      kind: 'select',
      label: 'Paddock shape',
      options: [
        { value: 'rectangle', label: 'Rectangle (enter length and width)' },
        { value: 'perimeter', label: 'Any shape (enter the perimeter)' },
      ],
      default: 'rectangle',
      wide: true,
    },
    len('length', 'Length', '300', ['rectangle']),
    len('width', 'Width', '200', ['rectangle']),
    len(
      'perimeter',
      'Perimeter',
      '1000',
      ['perimeter'],
      'The total distance around the fence line.',
    ),
    {
      id: 'lines',
      kind: 'number',
      label: 'Rails, boards or strands',
      help: 'Horse fences commonly use 3 or 4 lines.',
      default: '3',
      integer: true,
      min: 1,
      max: 20,
    },
    {
      ...len(
        'spacing',
        'Post spacing',
        '8',
        undefined,
        'Board fences are commonly 8 ft (2.4 m); tape and wire can be wider.',
      ),
      units: ['ft', 'm'],
    },
    {
      id: 'gates',
      kind: 'number',
      label: 'Number of gates',
      default: '1',
      integer: true,
      max: 100,
    },
    {
      ...len(
        'gateWidth',
        'Width of each gate',
        '12',
        undefined,
        'Wide enough for a tractor if you need one; 12 ft (3.6 m) is common.',
      ),
      units: ['ft', 'm'],
    },
  ],
  calculate(inputs) {
    const rectangle = inputs.select('shape') === 'rectangle';
    const perimeter = rectangle
      ? 2 * (inputs.unit('length') + inputs.unit('width'))
      : inputs.unit('perimeter');
    const lines = inputs.num('lines');
    const fence = fenceMaterials({
      lengthM: perimeter,
      spacingM: inputs.unit('spacing'),
      closed: true,
      gates: inputs.num('gates'),
      gateWidthM: inputs.unit('gateWidth'),
      rails: lines,
    });
    const metric = isMetric(inputs.unitOf(rectangle ? 'length' : 'perimeter'));
    const len = (m: number) =>
      metric ? `${formatNumber(m, 1)} m` : `${formatNumber(fromBase(m, 'ft'), 1)} ft`;
    const fenceLine = metric ? fence.fencedLengthM : fromBase(fence.fencedLengthM, 'ft');

    const details: ResultDetail[] = [
      { label: 'Perimeter', value: len(perimeter) },
      { label: 'Fence line (excluding gates)', value: len(fence.fencedLengthM) },
      { label: 'Posts', value: formatNumber(fence.posts, 0) },
      {
        label: `Rail, board or tape (${formatNumber(lines, 0)} ${plural(lines, 'line')})`,
        value: len(fence.railLengthM),
      },
      {
        label: 'Rail or board pieces (one per section per line)',
        value: formatNumber(fence.railPieces, 0),
      },
    ];
    if (rectangle) {
      const area = inputs.unit('length') * inputs.unit('width');
      details.push({
        label: 'Enclosed area',
        value: `${formatNumber(fromBase(area, 'acre'), 2)} acres (${formatNumber(fromBase(area, 'ha'), 2)} ha)`,
      });
    }

    return {
      headline: {
        value: formatNumber(fenceLine, 1),
        unit: metric ? 'm of fence line' : 'ft of fence line',
      },
      summary: `You need about ${formatNumber(fence.posts, 0)} posts and ${len(fence.railLengthM)} of rail, board or tape for ${formatNumber(lines, 0)} ${plural(lines, 'line')}.`,
      details,
      notes: [
        'Add posts where the fence changes direction if a corner does not fall on the spacing.',
        'For electric fencing, also plan insulators, an energizer and grounding.',
      ],
    };
  },
  content: {
    howItWorks: [
      'A paddock fence is a closed loop, so it needs one post per section: the perimeter (minus gate openings) divided by the post spacing, rounded up. Each gate splits the loop and adds one post.',
      'The total length of rail, board or tape is the fence line multiplied by the number of lines. Rail or board pieces are counted as one per section per line, which matches boards cut to the post spacing.',
    ],
    formula: [
      { label: 'Perimeter of a rectangle', expression: 'Perimeter = 2 × (Length + Width)' },
      { label: 'Fence line', expression: 'Fence line = Perimeter − Gates × Gate width' },
      { label: 'Posts', expression: 'Posts = Fence line ÷ Post spacing, rounded up, + Gates' },
      { label: 'Rail or tape', expression: 'Total length = Fence line × Number of lines' },
    ],
    assumptions: [
      'Many equine extension guides recommend a fence top height of about 54 to 60 inches (1.4 to 1.5 m) for horses, with highly visible materials. Barbed wire is widely discouraged for horses.',
      'Wire and tape are sold by the roll; add extra for tensioning, wrapping around end posts and joins.',
      'Corner bracing, gate hardware and electric fence components are not included.',
    ],
    examples: [
      {
        title: 'A 300 × 200 ft paddock with 3 rails and one 12 ft gate',
        values: {
          shape: 'rectangle',
          length: { value: '300', unit: 'ft' },
          width: { value: '200', unit: 'ft' },
          lines: '3',
          spacing: { value: '8', unit: 'ft' },
          gates: '1',
          gateWidth: { value: '12', unit: 'ft' },
        },
        steps: [
          'Perimeter = 2 × (300 + 200) = 1,000 ft',
          'Fence line = 1,000 − 12 = 988 ft',
          'Sections = 988 ÷ 8 = 123.5, rounded up to 124; posts = 124 + 1 gate = 125',
          'Rail = 988 ft × 3 lines = 2,964 ft',
          'Enclosed area = 60,000 ft² = 1.38 acres',
        ],
        expected: '988',
      },
    ],
    faq: [
      {
        question: 'How tall should a horse fence be?',
        answer:
          'Commonly recommended heights are around 54 to 60 inches (1.4 to 1.5 m) at the top rail, and higher for stallions or horses that jump. The bottom line should be low enough to stop a horse reaching under, but high enough to avoid trapped hooves.',
      },
      {
        question: 'How far apart should horse fence posts be?',
        answer:
          'Wooden post-and-board fences are usually built with posts about 8 feet (2.4 m) apart. Electric tape and wire systems can use wider spacing, as specified by the manufacturer.',
      },
      {
        question: 'How much fencing do I need for one acre?',
        answer:
          'A square acre is about 208.7 feet on each side, so its perimeter is about 835 feet. A long, narrow acre has a longer perimeter and needs more fencing.',
      },
    ],
  },
};
