/**
 * Parse a number typed by a person.
 *
 * Accepts:
 *   "12", "-3.5", "+4", ".5", "1,250" (thousands), "1,250.75", "2,5" (decimal comma),
 *   "1/2", "3 1/4" (fractions, handy for inches), surrounding spaces.
 *
 * A single comma followed by exactly three digits ("1,250") is read as a thousands
 * separator; any other single comma ("2,5" or "0,75") is read as a decimal comma.
 *
 * Returns null when the text is not a valid finite number.
 */
export function parseNumber(input: string): number | null {
  const text = input.trim();
  if (text === '') return null;

  const mixed = /^([+-]?)(\d+)\s+(\d+)\/(\d+)$/.exec(text);
  if (mixed) {
    const [, sign, whole, num, den] = mixed;
    const d = Number(den);
    if (d === 0) return null;
    const value = Number(whole) + Number(num) / d;
    return sign === '-' ? -value : value;
  }

  const fraction = /^([+-]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(text);
  if (fraction) {
    const d = Number(fraction[2]);
    if (d === 0) return null;
    return Number(fraction[1]) / d;
  }

  let normalized = text.replace(/[\s_]/g, '');
  const commaCount = (normalized.match(/,/g) ?? []).length;
  const hasDot = normalized.includes('.');

  if (commaCount > 0) {
    if (hasDot) {
      // "1,250.75": commas are thousands separators.
      if (!/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(normalized)) return null;
      normalized = normalized.replace(/,/g, '');
    } else if (commaCount === 1 && (!/,\d{3}$/.test(normalized) || /^[+-]?0,/.test(normalized))) {
      // "2,5": decimal comma.
      normalized = normalized.replace(',', '.');
    } else {
      if (!/^[+-]?\d{1,3}(,\d{3})+$/.test(normalized)) return null;
      normalized = normalized.replace(/,/g, '');
    }
  }

  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Parse a list of numbers separated by commas, semicolons, spaces or new lines. */
export function parseNumberList(input: string): { values: number[]; invalid: string[] } {
  const tokens = input
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t !== '');
  const values: number[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const n = /^[+-]?(\d+\.?\d*|\.\d+)$/.test(token) ? Number(token) : NaN;
    if (Number.isFinite(n)) values.push(n);
    else invalid.push(token);
  }
  return { values, invalid };
}
