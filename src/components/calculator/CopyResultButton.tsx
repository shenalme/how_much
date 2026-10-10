import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';

interface CopyResultButtonProps {
  text: string;
  onCopied?: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy method.
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

export function CopyResultButton({ text, onCopied }: CopyResultButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async () => {
    const ok = await copyText(text);
    setStatus(ok ? 'copied' : 'failed');
    if (ok) onCopied?.();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <button type="button" className="button button--secondary" onClick={handleClick}>
      <Icon name={status === 'copied' ? 'check' : 'copy'} size={18} />
      <span aria-live="polite">
        {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy result'}
      </span>
    </button>
  );
}
