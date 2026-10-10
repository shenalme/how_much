const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(minDecimals: number, maxDecimals: number): Intl.NumberFormat {
  const key = `${minDecimals}-${maxDecimals}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** Numbers at or above this magnitude are shown in scientific notation. */
const SCIENTIFIC_THRESHOLD = 1e15;

/**
 * Format a number for display with thousands separators.
 * Rounds half away from zero to `maxDecimals` and trims trailing zeros
 * (unless `minDecimals` asks to keep them).
 */
export function formatNumber(value: number, maxDecimals = 2, minDecimals = 0): string {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= SCIENTIFIC_THRESHOLD)
    return value.toExponential(3).replace('e+', ' × 10^');
  // Strip floating-point dust (31.249999999999996 → 31.25) so halves round as people expect.
  const clean = Number(value.toPrecision(12));
  const formatted = getFormatter(minDecimals, Math.max(minDecimals, maxDecimals)).format(clean);
  // Avoid "-0" after rounding tiny negatives.
  return /^-0(\.0+)?$/.test(formatted) ? formatted.slice(1) : formatted;
}

/**
 * Format with a fixed number of significant digits (used by unit converters),
 * without switching to scientific notation for everyday magnitudes.
 */
export function formatSignificant(value: number, significant = 6): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= SCIENTIFIC_THRESHOLD) return formatNumber(value);
  if (abs < 1e-6) return value.toExponential(significant - 1).replace('e-', ' × 10^-');
  const integerDigits = abs >= 1 ? Math.floor(Math.log10(abs)) + 1 : 0;
  const leadingZeros = abs < 1 ? -Math.floor(Math.log10(abs)) - 1 : 0;
  const decimals = Math.min(10, Math.max(0, significant - integerDigits + leadingZeros));
  return formatNumber(value, decimals);
}

/** Round to a fixed number of decimal places, half away from zero. */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const scaled = Number((Math.abs(value) * factor).toPrecision(12));
  const rounded = (Math.sign(value) * Math.round(scaled)) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function formatPercent(value: number, maxDecimals = 2): string {
  return `${formatNumber(value, maxDecimals)}%`;
}

/** Currency-neutral money formatting: two decimals with separators, no symbol. */
export function formatMoney(value: number): string {
  return formatNumber(value, 2, 2);
}

/** "1 bag" / "3 bags". */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

/** Hours (decimal) → "3 h 25 min". */
export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours)) return '—';
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const h = Math.floor((totalMinutes % (24 * 60)) / 60);
  const m = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${formatNumber(days, 0)} ${plural(days, 'day')}`);
  if (h > 0) parts.push(`${h} h`);
  if (m > 0 || parts.length === 0) parts.push(`${m} min`);
  return parts.join(' ');
}
