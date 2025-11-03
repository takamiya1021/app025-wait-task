import { test, expect } from '@playwright/test';

test('タイマー開始導線を表示する', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'レンダリング待ちタスク管理' }),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'タイマーを開始' })).toBeVisible();
});
