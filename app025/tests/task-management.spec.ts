import { test, expect } from '@playwright/test';

test('タスクリスト操作シナリオ', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForSelector('[data-testid="task-form"]');

  await page.getByLabel('タスク名').fill('メール返信');
  await page.getByLabel('所要時間 (分)').fill('4');
  await page.getByRole('button', { name: 'タスクを追加' }).click();

  await page.getByLabel('タスク名').fill('ストレッチ');
  await page.getByLabel('所要時間 (分)').fill('2');
  await page.getByRole('button', { name: 'タスクを追加' }).click();

  await expect(page.getByText('メール返信')).toBeVisible();
  await expect(page.getByText('ストレッチ')).toBeVisible();

  await page.getByRole('checkbox', { name: 'メール返信 を完了' }).check();
  await expect(page.getByText('メール返信')).toHaveClass(/line-through/);

  await page.getByRole('button', { name: 'ストレッチ を削除' }).click();
  await expect(page.locator('text=ストレッチ')).toHaveCount(0);
});
