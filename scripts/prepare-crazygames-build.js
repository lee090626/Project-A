#!/usr/bin/env node
/**
 * @fileoverview CrazyGames zip upload용 정적 export 결과를 검증하고 상대 경로로 정리합니다.
 */

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const allowedExternalUrls = new Set(['https://sdk.crazygames.com/crazygames-sdk-v3.js']);
const allowedExternalUrlPrefixes = ['http://www.w3.org/'];
const internalRootFiles = [
  'baseLayout.json',
  'entities.json',
  'game-init-data.json',
  'icon.png',
  'sw.js',
];
const textExtensions = new Set(['.html', '.js', '.txt']);
const adPattern =
  /adsbygoogle|googlesyndication|google-adsense|AdSense|ca-pub|pub-8319588891960553|google\.com,\s*pub/i;

/** Recursively lists all files under a directory. */
function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

/** Rewrites only known static asset paths that CrazyGames serves beside index.html. */
function rewriteStaticPaths(content) {
  let nextContent = content.replace(/(["'=])\/(_next\/)/g, '$1./$2');
  nextContent = nextContent.replace(/(["'=])\/(assets\/)/g, '$1./$2');

  for (const fileName of internalRootFiles) {
    const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    nextContent = nextContent.replace(new RegExp(`(["'=])/${escaped}`, 'g'), `$1./${fileName}`);
  }

  return nextContent;
}

/** Fails the build if a CrazyGames zip requirement is violated. */
function assertCrazyGamesOutput(files) {
  const indexPath = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('[crazygames] out/index.html is missing.');
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  if (!indexHtml.includes('drilling-game-root') || !indexHtml.includes('Deep Abyss Exploration')) {
    throw new Error('[crazygames] index.html does not look like the playable game entry.');
  }

  for (const filePath of files) {
    if (!textExtensions.has(path.extname(filePath))) continue;

    const relPath = path.relative(outDir, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (adPattern.test(content)) {
      throw new Error(`[crazygames] ad reference found in ${relPath}.`);
    }

    if (path.extname(filePath) === '.html') {
      for (const match of content.matchAll(/(?:href|src)=["'](https?:\/\/[^"']+)["']/g)) {
        const url = match[1];
        if (!isAllowedExternalUrl(url)) {
          throw new Error(`[crazygames] disallowed external resource in ${relPath}: ${url}`);
        }
      }
    }

    if (
      /(?:href|src)=["']\/(?:_next|assets|baseLayout\.json|entities\.json|game-init-data\.json|icon\.png|sw\.js)/.test(
        content,
      )
    ) {
      throw new Error(`[crazygames] root-absolute static reference found in ${relPath}.`);
    }
  }
}

function isAllowedExternalUrl(url) {
  return (
    allowedExternalUrls.has(url) ||
    allowedExternalUrlPrefixes.some((allowedPrefix) => url.startsWith(allowedPrefix))
  );
}

function main() {
  if (!fs.existsSync(outDir)) {
    throw new Error('[crazygames] out directory is missing. Run next build first.');
  }

  for (const filePath of listFiles(outDir)) {
    if (path.basename(filePath) === '.DS_Store') {
      fs.rmSync(filePath);
    }
  }

  const adTextPath = path.join(outDir, 'ads.txt');
  if (fs.existsSync(adTextPath)) {
    fs.rmSync(adTextPath);
  }

  const files = listFiles(outDir);
  for (const filePath of files) {
    if (!textExtensions.has(path.extname(filePath))) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const rewritten = rewriteStaticPaths(content);
    if (rewritten !== content) {
      fs.writeFileSync(filePath, rewritten, 'utf-8');
    }
  }

  assertCrazyGamesOutput(listFiles(outDir));
  console.log('[crazygames] Static export prepared for zip upload.');
}

main();
