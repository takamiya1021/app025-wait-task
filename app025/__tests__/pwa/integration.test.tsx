/**
 * PWA統合テスト
 * Phase 12-4: Next.js PWA統合テスト
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('PWA Integration', () => {
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');

  it('layout.tsxにPWAメタデータが含まれている', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

    // manifest linkが含まれている、またはmetadataにmanifestが設定されている
    expect(
      layoutContent.includes('manifest') || layoutContent.includes('/manifest.json')
    ).toBe(true);
  });

  it('layout.tsxにtheme-colorメタデータが設定されている', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toMatch(/theme.*color|themeColor/i);
  });

  it('layout.tsxにviewportメタデータが設定されている', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toMatch(/viewport/i);
  });

  it('Service Worker登録スクリプトが存在する', () => {
    const swRegisterPath = path.join(__dirname, '../../app/components/ServiceWorkerRegister.tsx');
    const appDirFiles = fs.readdirSync(path.join(__dirname, '../../app'), { recursive: true });

    // ServiceWorker登録関連のファイルまたはコードが存在する
    const hasSWRegistration = appDirFiles.some((file) => {
      if (typeof file !== 'string') return false;
      if (file.includes('ServiceWorker') || file.includes('sw-register')) {
        return true;
      }
      // layout.tsxやpage.tsxにService Worker登録コードがあるかチェック
      if (file === 'layout.tsx' || file === 'page.tsx') {
        const filePath = path.join(__dirname, '../../app', file);
        const content = fs.readFileSync(filePath, 'utf-8');
        return content.includes('serviceWorker') || content.includes('sw.js');
      }
      return false;
    });

    expect(hasSWRegistration).toBe(true);
  });

  it('metadataにアプリ名と説明が設定されている', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    // デフォルトの"Create Next App"ではなく、カスタムタイトルが設定されている
    expect(layoutContent).not.toContain('Create Next App');
    expect(layoutContent).toMatch(/title.*[:=]/);
  });

  it('langがjaに設定されている', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain('lang="ja"');
  });
});
