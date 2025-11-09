'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PopupWindowProps extends PropsWithChildren {
  isOpen: boolean;
  alwaysOnTop?: boolean;
  ariaLabel?: string;
}

export function PopupWindow({
  children,
  isOpen,
  alwaysOnTop = true,
  ariaLabel = 'ポップアップウィンドウ',
}: PopupWindowProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.dataset.popupRoot = 'true';
    document.body.appendChild(el);
    setContainer(el);
    return () => {
      document.body.removeChild(el);
      setContainer(null);
    };
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(
    <div
      aria-label={ariaLabel}
      aria-hidden={!isOpen}
      className={`fixed right-6 bottom-6 w-full max-w-sm transition-opacity ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ zIndex: alwaysOnTop ? 9999 : undefined }}
    >
      {children}
    </div>,
    container,
  );
}
