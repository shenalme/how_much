import type { ReactNode } from 'react';

interface NumberInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  /** Extra control rendered inside the input group (e.g. a unit selector). */
  addon?: ReactNode;
  name?: string;
}

/**
 * Text input tuned for numbers. type="text" with inputMode="decimal" avoids the
 * scroll-wheel, exponent and locale quirks of type="number" while still showing
 * a numeric keypad on phones.
 */
export function NumberInput({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  placeholder,
  prefix,
  suffix,
  addon,
  name,
}: NumberInputProps) {
  return (
    <div className="input-group">
      {prefix && (
        <span className="input-group__affix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        id={id}
        name={name ?? id}
        className="input input--number"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {suffix && (
        <span className="input-group__affix input-group__affix--end" aria-hidden="true">
          {suffix}
        </span>
      )}
      {addon}
    </div>
  );
}
