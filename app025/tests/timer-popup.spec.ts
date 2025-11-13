import { test, expect } from '@playwright/test';

test('タイマーとポップアップシナリオ', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForSelector('[data-testid="task-form"]');

  await page.getByTestId('start-timer-button').click();
  await expect(page.getByText('一時停止')).toBeVisible();

  await expect(page.getByLabel('タイマーポップアップ')).toBeVisible();

  // 最小化前はコンテンツが表示されている
  await expect(page.getByLabel('ポップアップ進捗')).toBeVisible();

  // 最小化ボタンをクリック
  await page.getByLabel('タイマーポップアップ').getByRole('button', { name: '最小化' }).click();

  // 最小化後はヘッダーは表示されたままだが、コンテンツは非表示
  await expect(page.getByLabel('タイマーポップアップ').getByRole('button', { name: '展開' })).toBeVisible();
  await expect(page.getByLabel('ポップアップ進捗')).not.toBeVisible();

  // 展開ボタンをクリック
  await page.getByLabel('タイマーポップアップ').getByRole('button', { name: '展開' }).click();

  // 展開後はコンテンツが再表示される
  await expect(page.getByLabel('ポップアップ進捗')).toBeVisible();
});
