import { useEffect, useRef } from 'react';
import { siteConfig } from '../../config/site';

/**
 * Reserved advertising position.
 *
 * Renders nothing while siteConfig.ads.enabled is false (the default), so there is
 * no empty box and no layout shift. When enabled it reserves a fixed minimum height
 * (preventing CLS), labels the slot as an advertisement and keeps it visually
 * separate from calculator controls. See README "Adding AdSense".
 *
 * Placements used by the layout:
 *   tool-content  between the explanation and the FAQ on tool pages (never beside inputs)
 *   tool-rail     in the right-hand column on wide screens
 *   category      below the tool grid on category pages
 */
export type AdPlacement = 'tool-content' | 'tool-rail' | 'category';

/** Map each placement to an AdSense ad unit ID ("data-ad-slot") once you create them. */
const AD_UNIT_IDS: Record<AdPlacement, string> = {
  'tool-content': '',
  'tool-rail': '',
  category: '',
};

type AdsWindow = Window & { adsbygoogle?: unknown[] };

export function AdSlot({ placement }: { placement: AdPlacement }) {
  const ref = useRef<HTMLModElement>(null);
  const { enabled, adsenseClientId } = siteConfig.ads;
  const unitId = AD_UNIT_IDS[placement];
  const active = enabled && Boolean(adsenseClientId) && Boolean(unitId);

  useEffect(() => {
    if (!active || !ref.current || ref.current.dataset.loaded) return;
    ref.current.dataset.loaded = 'true';
    try {
      const w = window as AdsWindow;
      (w.adsbygoogle = w.adsbygoogle ?? []).push({});
    } catch {
      // Ad blockers or consent tools may prevent loading; the page must keep working.
    }
  }, [active]);

  if (!active) return null;
  return (
    <aside className={`ad-slot ad-slot--${placement}`} aria-label="Advertisement">
      <p className="ad-slot__label">Advertisement</p>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseClientId}
        data-ad-slot={unitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
