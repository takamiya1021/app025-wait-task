import { test, expect } from '@playwright/test';

test('AI提案シナリオ', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForSelector('[data-testid="task-form"]');

  await page.getByLabel('タスク名').fill('資料整理');
  await page.getByLabel('所要時間 (分)').fill('5');
  await page.getByRole('button', { name: 'タスクを追加' }).click();

  await page.getByLabel('タスク名').fill('ストレッチ');
  await page.getByLabel('所要時間 (分)').fill('3');
  await page.getByRole('button', { name: 'タスクを追加' }).click();

  await page.getByRole('button', { name: 'AIに聞いてみる' }).click();
  await expect(page.getByTestId('ai-suggestions')).toBeVisible();
});
