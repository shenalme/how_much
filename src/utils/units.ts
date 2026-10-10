/**
 * Unit definitions.
 *
 * Every factor converts ONE of the unit into the dimension's base unit.
 * All imperial/US factors are exact by international definition:
 *   1 inch      = 0.0254 m            (International Yard and Pound Agreement, 1959)
 *   1 foot      = 0.3048 m
 *   1 yard      = 0.9144 m
 *   1 mile      = 1609.344 m
 *   1 pound     = 0.45359237 kg
 *   1 acre      = 4046.8564224 m²     (international acre: 43,560 ft²)
 *   1 US gallon = 3.785411784 L       (231 in³)
 *   1 UK gallon = 4.54609 L
 */
export type Dimension = 'length' | 'area' | 'volume' | 'mass' | 'temperature' | 'density' | 'speed';

export type UnitSystem = 'metric' | 'imperial';

export interface Unit {
  id: string;
  dimension: Dimension;
  /** Short label for selectors, e.g. "ft". */
  symbol: string;
  singular: string;
  plural: string;
  system: UnitSystem;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

function linear(
  id: string,
  dimension: Dimension,
  factor: number,
  symbol: string,
  singular: string,
  plural: string,
  system: UnitSystem,
): Unit {
  return {
    id,
    dimension,
    symbol,
    singular,
    plural,
    system,
    toBase: (v) => v * factor,
    fromBase: (v) => v / factor,
  };
}

const IN = 0.0254;
const FT = 0.3048;
const YD = 0.9144;
const LB = 0.45359237;

const UNIT_LIST: Unit[] = [
  // Length (base: metre)
  linear('mm', 'length', 0.001, 'mm', 'millimeter', 'millimeters', 'metric'),
  linear('cm', 'length', 0.01, 'cm', 'centimeter', 'centimeters', 'metric'),
  linear('m', 'length', 1, 'm', 'meter', 'meters', 'metric'),
  linear('km', 'length', 1000, 'km', 'kilometer', 'kilometers', 'metric'),
  linear('in', 'length', IN, 'in', 'inch', 'inches', 'imperial'),
  linear('ft', 'length', FT, 'ft', 'foot', 'feet', 'imperial'),
  linear('yd', 'length', YD, 'yd', 'yard', 'yards', 'imperial'),
  linear('mi', 'length', 1609.344, 'mi', 'mile', 'miles', 'imperial'),

  // Area (base: square metre)
  linear('m2', 'area', 1, 'm²', 'square meter', 'square meters', 'metric'),
  linear('cm2', 'area', 0.0001, 'cm²', 'square centimeter', 'square centimeters', 'metric'),
  linear('ha', 'area', 10_000, 'ha', 'hectare', 'hectares', 'metric'),
  linear('km2', 'area', 1_000_000, 'km²', 'square kilometer', 'square kilometers', 'metric'),
  linear('in2', 'area', IN * IN, 'in²', 'square inch', 'square inches', 'imperial'),
  linear('ft2', 'area', FT * FT, 'ft²', 'square foot', 'square feet', 'imperial'),
  linear('yd2', 'area', YD * YD, 'yd²', 'square yard', 'square yards', 'imperial'),
  linear('acre', 'area', 4046.8564224, 'acres', 'acre', 'acres', 'imperial'),

  // Volume (base: cubic metre)
  linear('m3', 'volume', 1, 'm³', 'cubic meter', 'cubic meters', 'metric'),
  linear('l', 'volume', 0.001, 'L', 'liter', 'liters', 'metric'),
  linear('ml', 'volume', 0.000001, 'mL', 'milliliter', 'milliliters', 'metric'),
  linear('in3', 'volume', IN * IN * IN, 'in³', 'cubic inch', 'cubic inches', 'imperial'),
  linear('ft3', 'volume', FT * FT * FT, 'ft³', 'cubic foot', 'cubic feet', 'imperial'),
  linear('yd3', 'volume', YD * YD * YD, 'yd³', 'cubic yard', 'cubic yards', 'imperial'),
  linear('galUS', 'volume', 0.003785411784, 'US gal', 'US gallon', 'US gallons', 'imperial'),
  linear('galUK', 'volume', 0.00454609, 'UK gal', 'UK gallon', 'UK gallons', 'imperial'),

  // Mass (base: kilogram)
  linear('g', 'mass', 0.001, 'g', 'gram', 'grams', 'metric'),
  linear('kg', 'mass', 1, 'kg', 'kilogram', 'kilograms', 'metric'),
  linear('t', 'mass', 1000, 't', 'metric ton (tonne)', 'metric tons (tonnes)', 'metric'),
  linear('oz', 'mass', LB / 16, 'oz', 'ounce', 'ounces', 'imperial'),
  linear('lb', 'mass', LB, 'lb', 'pound', 'pounds', 'imperial'),
  linear(
    'ton',
    'mass',
    LB * 2000,
    'US tons',
    'US ton (short ton)',
    'US tons (short tons)',
    'imperial',
  ),

  // Density (base: kg/m³)
  linear(
    'kgm3',
    'density',
    1,
    'kg/m³',
    'kilogram per cubic meter',
    'kilograms per cubic meter',
    'metric',
  ),
  linear(
    'tm3',
    'density',
    1000,
    't/m³',
    'tonne per cubic meter',
    'tonnes per cubic meter',
    'metric',
  ),
  linear(
    'lbft3',
    'density',
    LB / (FT * FT * FT),
    'lb/ft³',
    'pound per cubic foot',
    'pounds per cubic foot',
    'imperial',
  ),
  linear(
    'lbyd3',
    'density',
    LB / (YD * YD * YD),
    'lb/yd³',
    'pound per cubic yard',
    'pounds per cubic yard',
    'imperial',
  ),
  linear(
    'tonyd3',
    'density',
    (LB * 2000) / (YD * YD * YD),
    'US tons/yd³',
    'US ton per cubic yard',
    'US tons per cubic yard',
    'imperial',
  ),

  // Speed (base: metre per second)
  linear(
    'kmh',
    'speed',
    1000 / 3600,
    'km/h',
    'kilometer per hour',
    'kilometers per hour',
    'metric',
  ),
  linear('mph', 'speed', 1609.344 / 3600, 'mph', 'mile per hour', 'miles per hour', 'imperial'),

  // Temperature (base: degree Celsius)
  {
    id: 'c',
    dimension: 'temperature',
    symbol: '°C',
    singular: 'degree Celsius',
    plural: 'degrees Celsius',
    system: 'metric',
    toBase: (v: number) => v,
    fromBase: (v: number) => v,
  },
  {
    id: 'f',
    dimension: 'temperature',
    symbol: '°F',
    singular: 'degree Fahrenheit',
    plural: 'degrees Fahrenheit',
    system: 'imperial',
    toBase: (v: number) => ((v - 32) * 5) / 9,
    fromBase: (v: number) => (v * 9) / 5 + 32,
  },
  {
    id: 'k',
    dimension: 'temperature',
    symbol: 'K',
    singular: 'kelvin',
    plural: 'kelvins',
    system: 'metric',
    toBase: (v: number) => v - 273.15,
    fromBase: (v: number) => v + 273.15,
  },
];

export const UNITS: Record<string, Unit> = Object.fromEntries(UNIT_LIST.map((u) => [u.id, u]));

export function getUnit(id: string): Unit {
  const unit = UNITS[id];
  if (!unit) throw new Error(`Unknown unit "${id}"`);
  return unit;
}

/** Convert a value between two units of the same dimension. */
export function convert(value: number, fromId: string, toId: string): number {
  const from = getUnit(fromId);
  const to = getUnit(toId);
  if (from.dimension !== to.dimension) {
    throw new Error(`Cannot convert ${from.dimension} (${fromId}) to ${to.dimension} (${toId})`);
  }
  if (fromId === toId) return value;
  return to.fromBase(from.toBase(value));
}

export function isMetric(unitId: string): boolean {
  return getUnit(unitId).system === 'metric';
}

/** Convenience: value in base units → value in `toId`. */
export function fromBase(value: number, toId: string): number {
  return getUnit(toId).fromBase(value);
}
