const PATHS = {
  leaf: 'M5 19c0-8.3 5.7-14 14-14 0 8.3-5.7 14-14 14Zm0 0 7-7',
  house: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20',
  brick: 'M3 6h18v12H3zM3 12h18M9 6v6M15 12v6',
  arrows: 'M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4',
  sigma: 'M18 5H6.5l6 7-6 7H18',
  car: 'M4 16.5V13l2-5h12l2 5v3.5M3 13h18M4 16.5h16M6.5 16.5V19M17.5 16.5V19',
  horseshoe: 'M6.5 4v7.5a5.5 5.5 0 0 0 11 0V4M6.5 7h2M15.5 7h2M7 11h2M15 11h2',
  pot: 'M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5ZM2 10h20M9 4.5v2.5M12 3.5V7M15 4.5V7',
  coin: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM14.5 9.2c-.4-.9-1.3-1.4-2.5-1.4-1.5 0-2.5.8-2.5 1.9 0 2.6 5.1 1.3 5.1 4.1 0 1.2-1.1 2-2.6 2-1.3 0-2.3-.6-2.7-1.5M12 6.3v1.5M12 15.8v1.7',
  map: 'M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Zm0 0v14m6-12v14',
  calendar: 'M4 6.5h16V20H4zM4 10.5h16M8.5 4v4M15.5 4v4',
  briefcase: 'M3.5 8h17v11.5h-17zM9 8V5.5h6V8M3.5 13h17',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM20 20l-4.8-4.8',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  reset: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9M4.5 4.5V9H9',
  chevronRight: 'm9.5 6 6 6-6 6',
  chevronDown: 'm6 9.5 6 6 6-6',
  ruler: 'M3 15.5 15.5 3 21 8.5 8.5 21 3 15.5ZM7 11.5l2 2M10 8.5l2 2M13 5.5l2 2',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** Decorative line icon. Always paired with visible text, so hidden from assistive tech. */
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
