import type { ReactNode } from 'react';

interface AlertProps {
  tone?: 'info' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
}

export function Alert({ tone = 'info', title, children }: AlertProps) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {title && <p className="alert__title">{title}</p>}
      <div className="alert__body">{children}</div>
    </div>
  );
}
