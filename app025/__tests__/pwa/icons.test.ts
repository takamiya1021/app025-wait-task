/**
 * PWA Icons テスト
 * Phase 12-2: アイコン読み込みテスト
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('PWA Icons', () => {
  const icon192Path = path.join(__dirname, '../../public/icon-192x192.png');
  const icon512Path = path.join(__dirname, '../../public/icon-512x512.png');

  it('icon-192x192.pngファイルが存在する', () => {
    expect(fs.existsSync(icon192Path)).toBe(true);
  });

  it('icon-512x512.pngファイルが存在する', () => {
    expect(fs.existsSync(icon512Path)).toBe(true);
  });

  it('icon-192x192.pngのファイルサイズが適切である（1KB以上）', () => {
    const stats = fs.statSync(icon192Path);
    expect(stats.size).toBeGreaterThan(1000); // 1KB以上
  });

  it('icon-512x512.pngのファイルサイズが適切である（1KB以上）', () => {
    const stats = fs.statSync(icon512Path);
    expect(stats.size).toBeGreaterThan(1000); // 1KB以上
  });

  it('アイコンファイルはPNG形式である（マジックバイトチェック）', () => {
    const icon192Buffer = fs.readFileSync(icon192Path);
    const icon512Buffer = fs.readFileSync(icon512Path);

    // PNGファイルのマジックバイト: 89 50 4E 47
    const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    expect(icon192Buffer.subarray(0, 4).equals(pngMagicBytes)).toBe(true);
    expect(icon512Buffer.subarray(0, 4).equals(pngMagicBytes)).toBe(true);
  });
});
