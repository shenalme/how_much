/**
 * The date used for "today" defaults during the first render.
 *
 * Prerendered pages are built on one day and viewed on another. To keep the
 * client's first render identical to the static HTML (required for hydration),
 * both use the build date, stored on #root as data-today. The form then switches
 * to the visitor's real date immediately after hydrating.
 */
let serverDate: string | undefined;

export function setRenderDate(date: string | undefined): void {
  serverDate = date;
}

export function getRenderDate(): string | undefined {
  if (serverDate) return serverDate;
  if (typeof document === 'undefined') return undefined;
  return document.getElementById('root')?.dataset.today || undefined;
}
