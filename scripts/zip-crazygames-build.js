#!/usr/bin/env node
/**
 * @fileoverview CrazyGames에 업로드할 out 디렉터리 zip 파일을 생성합니다.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const outDir = path.join(__dirname, '../out');
const zipPath = path.join(__dirname, '../drilling-rpg-crazygames.zip');

function main() {
  if (!fs.existsSync(path.join(outDir, 'index.html'))) {
    throw new Error('[crazygames] out/index.html is missing. Run npm run build:crazygames first.');
  }

  fs.rmSync(zipPath, { force: true });

  try {
    execFileSync('zip', ['-qr', zipPath, '.'], { cwd: outDir, stdio: 'inherit' });
  } catch (err) {
    throw new Error(
      `[crazygames] Failed to create zip. Make sure the zip command is available. ${err}`,
    );
  }

  console.log(`[crazygames] Package created: ${zipPath}`);
}

main();
