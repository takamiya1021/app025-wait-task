'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
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
  const popupRef = useRef<HTMLDivElement>(null);

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

  // alwaysOnTop有効時は定期的にフォーカスとスクロール位置を維持
  useEffect(() => {
    if (!alwaysOnTop || !isOpen || !popupRef.current) return;

    const popup = popupRef.current;
    let focusIntervalId: ReturnType<typeof setInterval> | null = null;

    // フォーカスを維持する関数
    const maintainFocus = () => {
      if (popup && document.activeElement !== popup && !popup.contains(document.activeElement)) {
        // ポップアップまたはその子要素にフォーカスがない場合、フォーカスを戻す
        const focusableElement = popup.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
          focusableElement.focus({ preventScroll: true });
        }
      }
    };

    // 初回フォーカス
    maintainFocus();

    // 定期的にフォーカスを維持（2秒ごと）
    focusIntervalId = setInterval(maintainFocus, 2000);

    return () => {
      if (focusIntervalId) {
        clearInterval(focusIntervalId);
      }
    };
  }, [alwaysOnTop, isOpen]);

  if (!container) {
    return null;
  }

  // z-indexの最大値を使用（alwaysOnTop有効時）
  const maxZIndex = 2147483647;
  const overlayZIndex = alwaysOnTop ? maxZIndex - 1 : 9998;
  const popupZIndex = alwaysOnTop ? maxZIndex : 9999;

  return createPortal(
    <>
      {/* 背景オーバーレイ（スマホ用） */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity pointer-events-none ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: overlayZIndex }}
        aria-hidden="true"
      />

      {/* ポップアップコンテンツ */}
      <div
        ref={popupRef}
        aria-label={ariaLabel}
        aria-hidden={!isOpen}
        tabIndex={-1}
        className={`fixed right-6 bottom-6 w-full max-w-sm rounded-2xl bg-white shadow-lg transition-opacity ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ zIndex: popupZIndex }}
      >
        {children}
      </div>
    </>,
    container,
  );
}
