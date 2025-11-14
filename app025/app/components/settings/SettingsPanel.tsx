'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  type NotificationPermissionState,
} from '@/app/lib/notificationManager';

const permissionLabel = (state: NotificationPermissionState) => {
  switch (state) {
    case 'granted':
      return '許可済み';
    case 'denied':
      return '拒否されています';
    case 'default':
      return '未確認';
    default:
      return '未対応ブラウザ';
  }
};

export function SettingsPanel() {
  const settings = useTaskStore(state => state.settings);
  const updateSettings = useTaskStore(state => state.updateSettings);
  const reset = useTaskStore(state => state.reset);
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [requesting, setRequesting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermissionState());
  }, []);

  const toggleSound = () => updateSettings({ notificationSound: !settings.notificationSound });
  const toggleAlwaysOnTop = () => updateSettings({ alwaysOnTop: !settings.alwaysOnTop });
  const toggleShowPopup = () => updateSettings({ showPopup: !settings.showPopup });
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ geminiApiKey: e.target.value || undefined });
  };

  const handleRequestPermission = async () => {
    setRequesting(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setRequesting(false);
  };

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
      alert('全てのデータがリセットされました');
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm" aria-label="設定">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-500">STEP 7</p>
        <h2 className="text-2xl font-bold text-slate-900">通知と表示の設定</h2>
        <p className="text-sm text-slate-500">サウンド通知やポップアップ表示をカスタマイズ</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2" data-testid="settings-panel">
        <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
          <div>
            <p className="font-semibold text-slate-900">タイマー完了時に通知</p>
            <p className="text-sm text-slate-500">サウンドとデスクトップ通知を有効化します</p>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              settings.notificationSound ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {settings.notificationSound ? 'ON' : 'OFF'}
          </button>
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
          <div>
            <p className="font-semibold text-slate-900">ポップアップを常に前面表示</p>
            <p className="text-sm text-slate-500">他のウィンドウの背後に隠れにくくします</p>
          </div>
          <button
            type="button"
            onClick={toggleAlwaysOnTop}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              settings.alwaysOnTop ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {settings.alwaysOnTop ? 'ON' : 'OFF'}
          </button>
        </label>

        <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
          <div>
            <p className="font-semibold text-slate-900">ポップアップを自動表示</p>
            <p className="text-sm text-slate-500">タイマー開始時にポップアップを表示します</p>
          </div>
          <button
            type="button"
            onClick={toggleShowPopup}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              settings.showPopup ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {settings.showPopup ? 'ON' : 'OFF'}
          </button>
        </label>

        <div className="rounded-2xl border border-slate-100 p-4">
          <label htmlFor="gemini-api-key">
            <p className="font-semibold text-slate-900">Gemini API キー</p>
            <p className="text-sm text-slate-500">AI機能を使用するためのAPIキー（ローカルストレージに保存）</p>
          </label>
          <input
            id="gemini-api-key"
            type="password"
            value={settings.geminiApiKey || ''}
            onChange={handleApiKeyChange}
            placeholder="AIzaSy..."
            className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-100 p-4">
          <p className="font-semibold text-slate-900">通知許可</p>
          <p className="text-sm text-slate-500">現在の状態: {permissionLabel(permission)}</p>
          <button
            type="button"
            onClick={handleRequestPermission}
            disabled={requesting || permission === 'granted' || permission === 'unsupported'}
            className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500"
          >
            {permission === 'granted' ? '許可済み' : '通知を許可する'}
          </button>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="font-semibold text-red-900">データリセット</p>
          <p className="text-sm text-red-700">全てのタスク・統計・設定をリセットします（元に戻せません）</p>
          <button
            type="button"
            onClick={handleReset}
            className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold transition ${
              showResetConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-red-300 bg-white text-red-600 hover:bg-red-50'
            }`}
          >
            {showResetConfirm ? '本当にリセットする' : 'データをリセット'}
          </button>
          {showResetConfirm && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="ml-2 mt-3 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
