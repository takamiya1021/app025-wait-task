/**
 * PWA Manifest テスト
 * Phase 12-1: manifest.json読み込みテスト
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest', () => {
  const manifestPath = path.join(__dirname, '../../public/manifest.json');

  it('manifest.jsonファイルが存在する', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('manifest.jsonが正しいJSONフォーマットである', () => {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    expect(() => JSON.parse(manifestContent)).not.toThrow();
  });

  it('manifest.jsonに必須フィールドが含まれている', () => {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    // 必須フィールド
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
    expect(manifest.display).toBeDefined();
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);
  });

  it('manifest.jsonのdisplayがstandaloneである', () => {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    expect(manifest.display).toBe('standalone');
  });

  it('manifest.jsonにtheme_colorとbackground_colorが設定されている', () => {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    expect(manifest.theme_color).toBeDefined();
    expect(manifest.background_color).toBeDefined();
  });

  it('manifest.jsonのiconsに192x192と512x512が含まれている', () => {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });
});
