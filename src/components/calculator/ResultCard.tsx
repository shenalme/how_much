import { forwardRef } from 'react';
import type { CalcResult } from '../../calculators/types';
import { CopyResultButton } from './CopyResultButton';

interface ResultCardProps {
  result: CalcResult | null;
  /** Shown when there is no result because inputs are missing or invalid. */
  message: string;
  copyText: string;
  onCopied?: () => void;
  /** Debounced text for screen readers. */
  announcement: string;
}

export const ResultCard = forwardRef<HTMLElement, ResultCardProps>(function ResultCard(
  { result, message, copyText, onCopied, announcement },
  ref,
) {
  return (
    <section ref={ref} className="result" aria-labelledby="result-heading" tabIndex={-1}>
      <h2 id="result-heading" className="result__heading">
        Result
      </h2>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {result ? (
        <>
          <div className="result__band">
            <p className="result__figure">
              <span className="result__value">{result.headline.value}</span>
              {result.headline.unit && (
                <span className="result__unit"> {result.headline.unit}</span>
              )}
            </p>
          </div>
          <p className="result__summary">{result.summary}</p>
          {result.details && result.details.length > 0 && (
            <dl className="result__details">
              {result.details.map((detail) => (
                <div key={detail.label} className="result__row">
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {result.lines && result.lines.length > 0 && (
            <ul className="result__lines">
              {result.lines.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          )}
          {result.notes && result.notes.length > 0 && (
            <ul className="result__notes">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
          <div className="result__actions">
            <CopyResultButton text={copyText} onCopied={onCopied} />
          </div>
        </>
      ) : (
        <p className="result__empty">{message}</p>
      )}
    </section>
  );
});
