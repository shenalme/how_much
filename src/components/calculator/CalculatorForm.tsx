import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { analytics } from '../../analytics';
import {
  evaluate,
  initialState,
  isFieldVisible,
  resultToText,
  type FormState,
} from '../../calculators/engine';
import type { CalculatorDefinition } from '../../calculators/types';
import { todayISO } from '../../utils/dates';
import { getRenderDate } from '../../utils/renderDate';
import { FieldControl } from './FieldControl';
import { ResetButton } from './ResetButton';
import { ResultCard } from './ResultCard';

interface CalculatorFormProps {
  calculator: CalculatorDefinition;
  title: string;
}

/** Typing that is still in progress shouldn't flash an error. */
function isPartialEntry(value: string): boolean {
  return /^[-+.,]$|\/$|\s$/.test(value);
}

/** Apply "today" defaults and ?field=value&field_unit=unit from the URL. */
function hydrateClientState(calculator: CalculatorDefinition, state: FormState): FormState {
  const next: FormState = { values: { ...state.values }, units: { ...state.units } };
  const today = todayISO();
  const params = new URLSearchParams(window.location.search);
  for (const field of calculator.fields) {
    if (field.kind === 'date' && field.default === 'today') {
      const current = next.values[field.id];
      if (!current || current === getRenderDate()) next.values[field.id] = today;
    }
    const fromUrl = params.get(field.id);
    if (fromUrl !== null && fromUrl.length <= 500) next.values[field.id] = fromUrl;
    const unitFromUrl = params.get(`${field.id}_unit`);
    if (field.kind === 'unit' && unitFromUrl && field.units.includes(unitFromUrl)) {
      next.units[field.id] = unitFromUrl;
    }
  }
  return next;
}

export function CalculatorForm({ calculator, title }: CalculatorFormProps) {
  const formId = `calc-${calculator.slug}`;
  const [state, setState] = useState<FormState>(() => initialState(calculator, getRenderDate()));
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const resultRef = useRef<HTMLElement>(null);

  // Client-only defaults run after hydration so the prerendered HTML matches.
  useEffect(() => {
    setState((current) => hydrateClientState(calculator, current));
  }, [calculator]);

  const evaluation = useMemo(() => evaluate(calculator, state), [calculator, state]);
  const { result, errors, formError } = evaluation;

  const summary = result?.summary ?? '';
  useEffect(() => {
    if (!interacted) return undefined;
    const timer = window.setTimeout(() => setAnnouncement(summary), 900);
    return () => window.clearTimeout(timer);
  }, [summary, interacted]);

  useEffect(() => {
    if (!interacted || !result) return undefined;
    const timer = window.setTimeout(
      () => analytics.trackCalculationCompleted(calculator.slug),
      1500,
    );
    return () => window.clearTimeout(timer);
  }, [result, interacted, calculator.slug]);

  const visibleFields = calculator.fields.filter((field) => isFieldVisible(field, state));

  const shownError = (fieldId: string): string | undefined => {
    const error = errors[fieldId];
    if (!error) return undefined;
    const value = state.values[fieldId] ?? '';
    if (showAllErrors || touched.has(fieldId)) return error;
    if (value.trim() !== '' && !isPartialEntry(value)) return error;
    return undefined;
  };

  const update = (fieldId: string, value: string) => {
    setInteracted(true);
    setState((current) => ({ ...current, values: { ...current.values, [fieldId]: value } }));
  };

  const updateUnit = (fieldId: string, unit: string) => {
    setInteracted(true);
    setState((current) => ({ ...current, units: { ...current.units, [fieldId]: unit } }));
  };

  const markTouched = (fieldId: string) => {
    setTouched((current) => (current.has(fieldId) ? current : new Set(current).add(fieldId)));
  };

  const reset = () => {
    setState(hydrateClientState(calculator, initialState(calculator)));
    setTouched(new Set());
    setShowAllErrors(false);
    setAnnouncement('Form reset to default values.');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowAllErrors(true);
    setInteracted(true);
    const firstError = calculator.fields.find((f) => errors[f.id] && isFieldVisible(f, state));
    if (firstError) {
      document.getElementById(`${formId}-${firstError.id}`)?.focus();
      return;
    }
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const hasVisibleErrors = visibleFields.some((f) => shownError(f.id));
  const message = formError
    ? formError
    : hasVisibleErrors
      ? 'Correct the highlighted fields to see the result.'
      : 'Fill in the fields to see the result.';

  return (
    <div className="calculator">
      <form id={formId} className="calculator__form" noValidate onSubmit={handleSubmit}>
        <div className="calculator__fields">
          {visibleFields.map((field) => (
            <FieldControl
              key={field.id}
              formId={formId}
              field={field}
              value={state.values[field.id] ?? ''}
              unit={state.units[field.id]}
              error={shownError(field.id)}
              onChange={(value) => update(field.id, value)}
              onUnitChange={(unit) => updateUnit(field.id, unit)}
              onBlur={() => markTouched(field.id)}
            />
          ))}
        </div>
        <div className="calculator__actions">
          <button type="submit" className="button button--primary">
            Calculate
          </button>
          <ResetButton onReset={reset} />
        </div>
      </form>
      <ResultCard
        ref={resultRef}
        result={result}
        message={message}
        copyText={result ? resultToText(title, result) : ''}
        onCopied={() => analytics.trackCopyResult(calculator.slug)}
        announcement={announcement}
      />
    </div>
  );
}
