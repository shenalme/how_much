/**
 * Consent state for analytics and advertising.
 *
 * Nothing in the site asks for consent yet because nothing is tracked. When you
 * add analytics or ads, connect your consent banner / CMP to `setConsent` so that
 * events only flow once the visitor has agreed (required in the UK/EEA).
 */
export type ConsentState = 'granted' | 'denied' | 'unknown';

const STORAGE_KEY = 'hm-consent';
type Listener = (state: ConsentState) => void;
const listeners = new Set<Listener>();

export function getConsent(): ConsentState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unknown';
  } catch {
    return 'unknown';
  }
}

export function setConsent(state: Exclude<ConsentState, 'unknown'>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Storage blocked: consent applies to this page view only.
  }
  listeners.forEach((listener) => listener(state));
}

export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
