import type { ReactNode } from 'react';

interface FieldShellProps {
  inputId: string;
  label: string;
  help?: string;
  error?: string;
  wide?: boolean;
  children: (describedBy: string | undefined) => ReactNode;
}

/** Label, help text and inline error around a control, wired up for screen readers. */
export function FieldShell({ inputId, label, help, error, wide, children }: FieldShellProps) {
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${wide ? ' field--wide' : ''}${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      {children(describedBy)}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
      {help && (
        <p className="field__help" id={helpId}>
          {help}
        </p>
      )}
    </div>
  );
}
