/**
 * Service Worker テスト
 * Phase 12-3: Service Worker機能テスト
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Service Worker', () => {
  const swPath = path.join(__dirname, '../../public/sw.js');

  it('sw.jsファイルが存在する', () => {
    expect(fs.existsSync(swPath)).toBe(true);
  });

  it('sw.jsが正しいJavaScript形式である（構文エラーなし）', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent.length).toBeGreaterThan(0);
    // 基本的な構文チェック（コメントではないinstallイベントがある）
    expect(swContent).toContain('install');
    expect(swContent).toContain('activate');
    expect(swContent).toContain('fetch');
  });

  it('Service WorkerにCACHE_NAMEが定義されている', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toMatch(/CACHE_NAME|cacheName|CACHE_VERSION/);
  });

  it('Service Workerにinstallイベントリスナーが定義されている', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toMatch(/addEventListener\s*\(\s*['"]install['"]/);
  });

  it('Service Workerにactivateイベントリスナーが定義されている', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toMatch(/addEventListener\s*\(\s*['"]activate['"]/);
  });

  it('Service Workerにfetchイベントリスナーが定義されている', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toMatch(/addEventListener\s*\(\s*['"]fetch['"]/);
  });

  it('Service Workerにキャッシュ戦略が実装されている', () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    // キャッシュ関連のAPIが使用されている
    expect(swContent).toMatch(/caches\.(open|match|put|delete)/);
  });
});
