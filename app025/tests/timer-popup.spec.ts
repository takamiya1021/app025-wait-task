import { test, expect } from '@playwright/test';

test('タイマーとポップアップシナリオ', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForSelector('[data-testid="task-form"]');

  await page.getByTestId('start-timer-button').click();
  await expect(page.getByText('一時停止')).toBeVisible();

  await expect(page.getByLabel('タイマーポップアップ')).toBeVisible();
  await page.getByLabel('タイマーポップアップ').getByRole('button', { name: '最小化' }).click();
  await expect(page.getByLabel('タイマーポップアップ')).toHaveAttribute('aria-hidden', 'true');
});
