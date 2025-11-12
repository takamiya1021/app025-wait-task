#!/usr/bin/env node
/**
 * PWA Icon Generator
 * 192x192と512x512のPNGアイコンを生成
 */

import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

interface IconConfig {
  size: number;
  filename: string;
}

const ICONS: IconConfig[] = [
  { size: 192, filename: 'icon-192x192.png' },
  { size: 512, filename: 'icon-512x512.png' },
];

const THEME_COLOR = { r: 59, g: 130, b: 246 }; // #3b82f6 (blue-500)
const ACCENT_COLOR = { r: 99, g: 102, b: 241 }; // #6366f1 (indigo-500)

/**
 * グラデーション背景を持つアイコンを生成
 */
function createIcon(size: number): PNG {
  const png = new PNG({ width: size, height: size });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // グラデーション計算
      const gradientFactor = y / size;
      const r = Math.round(THEME_COLOR.r * (1 - gradientFactor) + ACCENT_COLOR.r * gradientFactor);
      const g = Math.round(THEME_COLOR.g * (1 - gradientFactor) + ACCENT_COLOR.g * gradientFactor);
      const b = Math.round(THEME_COLOR.b * (1 - gradientFactor) + ACCENT_COLOR.b * gradientFactor);

      // 角丸処理
      const centerX = size / 2;
      const centerY = size / 2;
      const distX = Math.abs(x - centerX);
      const distY = Math.abs(y - centerY);
      const maxDist = size / 2;
      const cornerRadius = size * 0.1; // 10% corner radius

      let alpha = 255;
      if (distX > maxDist - cornerRadius && distY > maxDist - cornerRadius) {
        const cornerDistX = distX - (maxDist - cornerRadius);
        const cornerDistY = distY - (maxDist - cornerRadius);
        const cornerDist = Math.sqrt(cornerDistX * cornerDistX + cornerDistY * cornerDistY);
        if (cornerDist > cornerRadius) {
          alpha = 0;
        } else {
          alpha = Math.round(255 * (1 - cornerDist / cornerRadius));
        }
      }

      // 中央に時計アイコンを描画
      const centerDist = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const clockRadius = size * 0.35;
      const clockBorder = size * 0.03;

      if (centerDist < clockRadius && centerDist > clockRadius - clockBorder) {
        // 時計の外枠（白）
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      } else if (
        // 時計の針（縦線）
        Math.abs(x - centerX) < size * 0.015 &&
        y < centerY &&
        y > centerY - clockRadius * 0.6
      ) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      } else if (
        // 時計の針（横線）
        Math.abs(y - centerY) < size * 0.015 &&
        x > centerX &&
        x < centerX + clockRadius * 0.4
      ) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      } else {
        // 背景グラデーション
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = alpha;
      }
    }
  }

  return png;
}

/**
 * アイコンを生成して保存
 */
async function generateIcons(): Promise<void> {
  const publicDir = path.join(__dirname, '../public');

  console.log('🎨 PWAアイコンを生成中...');

  for (const icon of ICONS) {
    const outputPath = path.join(publicDir, icon.filename);
    const png = createIcon(icon.size);

    await new Promise<void>((resolve, reject) => {
      png
        .pack()
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', () => {
          console.log(`✅ ${icon.filename} (${icon.size}x${icon.size}) を生成しました`);
          resolve();
        })
        .on('error', reject);
    });
  }

  console.log('🎉 すべてのアイコンが生成されました！');
}

// 実行
generateIcons().catch((error) => {
  console.error('❌ アイコン生成エラー:', error);
  process.exit(1);
});
