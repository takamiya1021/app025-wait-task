import { test, expect } from '@playwright/test';

test('タスク追加からタイマー開始までの基本フロー', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="task-form"]');

  // タスクを追加
  await page.getByLabel('タスク名').fill('ストレッチ');
  await page.getByLabel('所要時間 (分)').fill('3');
  await page.getByRole('button', { name: 'タスクを追加' }).click();

  await expect(page.getByText('ストレッチ')).toBeVisible();

  // タイマー開始
  await page.getByTestId('start-timer-button').click();
  await expect(page.getByText('一時停止')).toBeVisible();

  // ポップアップでタスクが提示される
  await expect(page.getByLabel('タイマーポップアップ')).toBeVisible();
  const zIndex = await page.$eval('[aria-label="タイマーポップアップ"]', el =>
    window.getComputedStyle(el).zIndex,
  );
  const parsed = zIndex === 'auto' ? 0 : Number(zIndex);
  expect(parsed).toBeGreaterThanOrEqual(9999);
});
