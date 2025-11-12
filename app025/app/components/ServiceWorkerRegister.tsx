'use client';

/**
 * Service Worker登録コンポーネント
 * Phase 12-4: Service Workerをブラウザに登録
 */

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Service Workerがサポートされているかチェック
    if ('serviceWorker' in navigator) {
      // ページロード完了後に登録
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope);

            // 更新チェック
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 New Service Worker available');
                    // 必要に応じてユーザーに更新を通知
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error);
          });
      });
    } else {
      console.warn('⚠️ Service Worker is not supported');
    }
  }, []);

  return null; // UIを持たないコンポーネント
}
