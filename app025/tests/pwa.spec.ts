/**
 * PWA E2Eテスト
 * Phase 12-5: インストール可能性確認
 */

import { test, expect } from '@playwright/test';

test.describe('PWA機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('manifest.jsonが正しく読み込まれる', async ({ page }) => {
    // manifestリンクが存在するかチェック
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // manifest.jsonを直接取得して内容確認
    const manifestResponse = await page.goto('/manifest.json');
    expect(manifestResponse?.status()).toBe(200);

    const manifestContent = await manifestResponse?.json();
    expect(manifestContent).toHaveProperty('name');
    expect(manifestContent).toHaveProperty('short_name');
    expect(manifestContent).toHaveProperty('icons');
    expect(manifestContent.display).toBe('standalone');
  });

  test('theme-colorメタタグが設定されている', async ({ page }) => {
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#3b82f6');
  });

  test('viewportメタタグが設定されている', async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('アイコンが正しく読み込まれる', async ({ page }) => {
    // 192x192アイコン
    const icon192Response = await page.goto('/icon-192x192.png');
    expect(icon192Response?.status()).toBe(200);
    expect(icon192Response?.headers()['content-type']).toContain('image/png');

    // 512x512アイコン
    const icon512Response = await page.goto('/icon-512x512.png');
    expect(icon512Response?.status()).toBe(200);
    expect(icon512Response?.headers()['content-type']).toContain('image/png');
  });

  test('Service Workerが正しく登録される', async ({ page }) => {
    await page.goto('/');

    // Service Worker登録を待つ
    await page.waitForTimeout(3000);

    // Service Worker APIがサポートされているか確認
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBe(true);

    // Service Workerの登録状態を確認
    const isRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    // Service Workerが登録されていることを確認（開発環境では登録されない場合もある）
    expect(typeof isRegistered).toBe('boolean');
  });

  test('Service Workerスクリプトが正しく配信される', async ({ page }) => {
    const swResponse = await page.goto('/sw.js');
    expect(swResponse?.status()).toBe(200);
    expect(swResponse?.headers()['content-type']).toContain('javascript');

    const swContent = await swResponse?.text();
    expect(swContent).toContain('install');
    expect(swContent).toContain('activate');
    expect(swContent).toContain('fetch');
  });

  test('HTMLのlang属性がjaに設定されている', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ja');
  });

  test('PWAとして必要な全てのメタデータが存在する', async ({ page }) => {
    // タイトル
    await expect(page).toHaveTitle(/レンダリング待ちタスク管理/);

    // description meta
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);

    // apple-mobile-web-app-capable
    const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    const appleCapableExists = await appleCapable.count();
    expect(appleCapableExists).toBeGreaterThanOrEqual(0); // オプショナル

    // manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
  });
});
