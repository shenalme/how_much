import type { Inputs } from '../engine';
import type { Field, SelectField } from '../types';
import { isMetric } from '../../utils/units';

export const LENGTH_UNITS = ['ft', 'in', 'yd', 'm', 'cm'];
export const SHORT_LENGTH_UNITS = ['in', 'cm', 'mm', 'ft', 'm'];
export const AREA_UNITS = ['ft2', 'yd2', 'm2', 'acre', 'ha'];

export function rectangleArea(length: number, width: number): number {
  return length * width;
}

export function circleArea(diameter: number): number {
  return Math.PI * (diameter / 2) ** 2;
}

export function triangleArea(base: number, height: number): number {
  return (base * height) / 2;
}

export type AreaShape = 'rectangle' | 'circle' | 'area';

interface AreaFieldOptions {
  /** Label for the thing being measured, e.g. "bed". */
  noun?: string;
  length?: string;
  width?: string;
  diameter?: string;
  area?: string;
  unit?: string;
  areaUnit?: string;
  shapes?: AreaShape[];
}

const SHAPE_LABELS: Record<AreaShape, string> = {
  rectangle: 'Rectangle or square',
  circle: 'Circle',
  area: 'I know the area',
};

/**
 * The standard "what area are you covering?" fields: a shape selector plus
 * length/width, diameter or a known area. Read the result with `readArea`.
 */
export function areaFields(options: AreaFieldOptions = {}): Field[] {
  const shapes = options.shapes ?? ['rectangle', 'circle', 'area'];
  const unit = options.unit ?? 'ft';
  const shapeField: SelectField = {
    id: 'shape',
    kind: 'select',
    label: `Shape of the ${options.noun ?? 'area'}`,
    options: shapes.map((s) => ({ value: s, label: SHAPE_LABELS[s] })),
    default: shapes[0] ?? 'rectangle',
    wide: true,
  };
  const fields: Field[] = [];
  if (shapes.length > 1) fields.push(shapeField);
  if (shapes.includes('rectangle')) {
    fields.push(
      {
        id: 'length',
        kind: 'unit',
        label: 'Length',
        dimension: 'length',
        units: LENGTH_UNITS,
        defaultUnit: unit,
        default: options.length ?? '20',
        exclusiveMin: true,
        showWhen: shapes.length > 1 ? { field: 'shape', equals: ['rectangle'] } : undefined,
      },
      {
        id: 'width',
        kind: 'unit',
        label: 'Width',
        dimension: 'length',
        units: LENGTH_UNITS,
        defaultUnit: unit,
        default: options.width ?? '15',
        exclusiveMin: true,
        showWhen: shapes.length > 1 ? { field: 'shape', equals: ['rectangle'] } : undefined,
      },
    );
  }
  if (shapes.includes('circle')) {
    fields.push({
      id: 'diameter',
      kind: 'unit',
      label: 'Diameter',
      help: 'The distance straight across the circle through its center.',
      dimension: 'length',
      units: LENGTH_UNITS,
      defaultUnit: unit,
      default: options.diameter ?? '10',
      exclusiveMin: true,
      showWhen: { field: 'shape', equals: ['circle'] },
    });
  }
  if (shapes.includes('area')) {
    fields.push({
      id: 'area',
      kind: 'unit',
      label: 'Area',
      dimension: 'area',
      units: AREA_UNITS,
      defaultUnit: options.areaUnit ?? 'ft2',
      default: options.area ?? '300',
      exclusiveMin: true,
      showWhen: { field: 'shape', equals: ['area'] },
    });
  }
  return fields;
}

/** Area in square metres from the standard area fields. */
export function readArea(inputs: Inputs): number {
  const shape = inputsShape(inputs);
  if (shape === 'circle') return circleArea(inputs.unit('diameter'));
  if (shape === 'area') return inputs.unit('area');
  return rectangleArea(inputs.unit('length'), inputs.unit('width'));
}

function inputsShape(inputs: Inputs): AreaShape {
  try {
    return inputs.select('shape') as AreaShape;
  } catch {
    return 'rectangle';
  }
}

/** Whether the person is working in metric, judged from the unit they measured with. */
export function measuredInMetric(inputs: Inputs): boolean {
  const shape = inputsShape(inputs);
  if (shape === 'circle') return isMetric(inputs.unitOf('diameter'));
  if (shape === 'area') return isMetric(inputs.unitOf('area'));
  return isMetric(inputs.unitOf('length'));
}
