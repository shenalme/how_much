import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import { fenceMaterials } from '../../shared/fence';
import { ceilCount } from '../../shared/volume';

export const calculator: CalculatorDefinition = {
  slug: 'fence-calculator',
  intro:
    'Enter the length of your fence and your post spacing to estimate posts, rails and pickets or boards, including gates.',
  fields: [
    {
      id: 'length',
      kind: 'unit',
      label: 'Total fence length',
      help: 'Include gate openings.',
      dimension: 'length',
      units: ['ft', 'yd', 'm'],
      defaultUnit: 'ft',
      default: '150',
      exclusiveMin: true,
    },
    {
      id: 'layout',
      kind: 'select',
      label: 'Layout',
      options: [
        { value: 'open', label: 'Open run (has two ends)' },
        { value: 'closed', label: 'Closed loop (encloses an area)' },
      ],
      default: 'open',
    },
    {
      id: 'spacing',
      kind: 'unit',
      label: 'Post spacing',
      help: '6–8 ft (1.8–2.4 m) is typical for wood fences.',
      dimension: 'length',
      units: ['ft', 'm', 'in', 'cm'],
      defaultUnit: 'ft',
      default: '8',
      exclusiveMin: true,
    },
    {
      id: 'rails',
      kind: 'number',
      label: 'Rails per section',
      help: 'Often 2 for fences up to 4 ft, 3 for taller fences.',
      default: '3',
      integer: true,
      max: 20,
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
      id: 'gateWidth',
      kind: 'unit',
      label: 'Width of each gate',
      dimension: 'length',
      units: ['ft', 'm', 'in', 'cm'],
      defaultUnit: 'ft',
      default: '4',
      exclusiveMin: true,
    },
    {
      id: 'style',
      kind: 'select',
      label: 'Infill',
      options: [
        { value: 'boards', label: 'Pickets or boards' },
        { value: 'none', label: 'None (rail or wire fence)' },
      ],
      default: 'boards',
      wide: true,
    },
    {
      id: 'boardWidth',
      kind: 'unit',
      label: 'Picket or board width',
      help: 'Use the actual width: a “1×6” board is about 5.5 in wide.',
      dimension: 'length',
      units: ['in', 'cm', 'mm'],
      defaultUnit: 'in',
      default: '3.5',
      exclusiveMin: true,
      showWhen: { field: 'style', equals: ['boards'] },
    },
    {
      id: 'gap',
      kind: 'unit',
      label: 'Gap between pickets',
      help: 'Enter 0 for a solid privacy fence.',
      dimension: 'length',
      units: ['in', 'cm', 'mm'],
      defaultUnit: 'in',
      default: '2',
      showWhen: { field: 'style', equals: ['boards'] },
    },
  ],
  calculate(inputs) {
    const fence = fenceMaterials({
      lengthM: inputs.unit('length'),
      spacingM: inputs.unit('spacing'),
      closed: inputs.select('layout') === 'closed',
      gates: inputs.num('gates'),
      gateWidthM: inputs.unit('gateWidth'),
      rails: inputs.num('rails'),
    });
    const metric = isMetric(inputs.unitOf('length'));
    const len = (m: number) =>
      metric ? `${formatNumber(m, 1)} m` : `${formatNumber(fromBase(m, 'ft'), 1)} ft`;

    const details: ResultDetail[] = [
      { label: 'Fenced length (excluding gates)', value: len(fence.fencedLengthM) },
      { label: 'Sections', value: formatNumber(fence.sections, 0) },
      { label: 'Posts', value: formatNumber(fence.posts, 0) },
      {
        label: 'Rails',
        value: `${formatNumber(fence.railPieces, 0)} (${len(fence.railLengthM)} in total)`,
      },
    ];

    let boards = 0;
    if (inputs.select('style') === 'boards') {
      const width = inputs.unit('boardWidth') + inputs.unit('gap');
      boards = ceilCount(fence.fencedLengthM / width);
      details.push({ label: 'Pickets or boards', value: formatNumber(boards, 0) });
    }

    const summaryParts = [
      `${formatNumber(fence.posts, 0)} ${plural(fence.posts, 'post')}`,
      `${formatNumber(fence.railPieces, 0)} ${plural(fence.railPieces, 'rail')}`,
    ];
    if (boards > 0) summaryParts.push(`${formatNumber(boards, 0)} ${plural(boards, 'picket')}`);

    return {
      headline: { value: formatNumber(fence.posts, 0), unit: plural(fence.posts, 'post') },
      summary: `You need about ${summaryParts.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`,
      details,
      notes: [
        'Corner posts are included in the count when they fall on the spacing; add one post for any corner that doesn’t.',
        'Gates themselves (and their hardware) are not included.',
      ],
    };
  },
  content: {
    howItWorks: [
      'The fence line is divided into sections no longer than your post spacing. A straight run needs one more post than it has sections, because there is a post at each end. A closed loop needs exactly one post per section, because the last section ends at the first post.',
      'Each gate opening is subtracted from the length and splits the fence into separate runs, which adds one post per gate. Rails are counted as one per section per rail line. Pickets or boards are the fenced length divided by the width of one picket plus the gap.',
    ],
    formula: [
      {
        label: 'Sections',
        expression: 'Sections = (Length − Gates × Gate width) ÷ Post spacing, rounded up',
      },
      { label: 'Posts, open run', expression: 'Posts = Sections + Gates + 1' },
      { label: 'Posts, closed loop', expression: 'Posts = Sections + Gates' },
      { label: 'Rails', expression: 'Rails = Sections × Rails per section' },
      {
        label: 'Pickets',
        expression: 'Pickets = Fenced length ÷ (Picket width + Gap), rounded up',
      },
    ],
    assumptions: [
      'Sections are spaced evenly along the whole fence. Each corner where the line changes direction needs a post; if a corner doesn’t land on the spacing you may need an extra post.',
      'Concrete, fasteners, gate hardware and post caps are not included.',
      'Check local rules on fence height, boundaries and permits before you build.',
    ],
    examples: [
      {
        title: 'A 150 ft picket fence with one 4 ft gate',
        values: {
          length: { value: '150', unit: 'ft' },
          layout: 'open',
          spacing: { value: '8', unit: 'ft' },
          rails: '3',
          gates: '1',
          gateWidth: { value: '4', unit: 'ft' },
          style: 'boards',
          boardWidth: { value: '3.5', unit: 'in' },
          gap: { value: '2', unit: 'in' },
        },
        steps: [
          'Fenced length = 150 − 4 = 146 ft',
          'Sections = 146 ÷ 8 = 18.25, rounded up to 19',
          'Posts = 19 + 1 gate + 1 = 21',
          'Rails = 19 × 3 = 57',
          'Pickets = 146 ft × 12 ÷ (3.5 + 2) in = 318.5, rounded up to 319',
        ],
        expected: '21',
      },
    ],
    faq: [
      {
        question: 'How far apart should fence posts be?',
        answer:
          'Wood privacy and picket fences commonly use posts 6 to 8 feet (1.8 to 2.4 m) apart. Wire and electric fences can use wider spacing. Follow the manufacturer’s guidance for panels or vinyl fencing, which come in fixed widths.',
      },
      {
        question: 'How deep should fence posts be set?',
        answer:
          'A common rule of thumb is to bury about one third of the post’s above-ground height, and below the frost line where the ground freezes. Local building guidance takes priority.',
      },
      {
        question: 'How many pickets do I need per 8 ft section?',
        answer:
          'Divide 96 inches by the picket width plus the gap. With 3.5 inch pickets and 2 inch gaps, that is 96 ÷ 5.5 = 17.5, so about 18 pickets per section.',
      },
    ],
  },
};
