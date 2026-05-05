#!/usr/bin/env node
/**
 * @fileoverview CrazyGames upload용 정적 export 결과를 검증하고 상대 경로로 정리합니다.
 */

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const allowedExternalUrls = new Set(['https://sdk.crazygames.com/crazygames-sdk-v3.js']);
const crazyGamesSdkScript =
  '<script id="crazygames-sdk" src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>';
const turbopackChunkPrefix = './_next/static/chunks/';
const rootTurbopackChunkPrefix = '/_next/static/chunks/';
const allowedExternalUrlPrefixes = ['http://www.w3.org/'];
const internalRootFiles = [
  'baseLayout.json',
  'entities.json',
  'game-init-data.json',
  'icon.png',
  'sw.js',
];
const textExtensions = new Set(['.css', '.html', '.js', '.txt']);
const markupRewriteExtensions = new Set(['.html', '.txt']);
const coreDataFileNames = ['baseLayout.json', 'entities.json', 'game-init-data.json'];
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

/** Rewrites Next.js runtime public paths used for dynamic chunk loading. */
function rewriteWebpackPublicPath(content, relPath) {
  let nextContent = rewriteTurbopackRuntimePaths(content);
  const publicPathPattern = /(\.p=)"(?:\/_next\/|\.\/_next\/)"/g;

  if (isWorkerRuntimeChunk(nextContent)) {
    return nextContent.replace(publicPathPattern, '$1"../../"');
  }

  if (isNextWebpackRuntime(relPath)) {
    return nextContent.replace(publicPathPattern, '$1"./_next/"');
  }

  return nextContent;
}

/** Rewrites Turbopack runtime paths so static uploads can boot from any host path. */
function rewriteTurbopackRuntimePaths(content) {
  let nextContent = content.replace(
    'var l=new URL(s[a],location.origin);',
    `var c=s[a];c.startsWith("${turbopackChunkPrefix}")?c=c.slice("${turbopackChunkPrefix}".length):c.startsWith("${rootTurbopackChunkPrefix}")&&(c=c.slice("${rootTurbopackChunkPrefix}".length));var l=new URL(c,location.href);`,
  );

  if (!nextContent.includes('globalThis.TURBOPACK')) return nextContent;

  nextContent = nextContent.replace(/let t="\/_next\/"/g, 'let t="./_next/"');
  nextContent = nextContent.replace(
    /new URL\((\w+)\((\w+)\),location\.origin\)/g,
    'new URL($1($2),location.href)',
  );
  nextContent = nextContent.replace(
    'self.TURBOPACK_NEXT_CHUNK_URLS.push(t),importScripts(t)',
    `self.TURBOPACK_NEXT_CHUNK_URLS.push(t),importScripts(t.startsWith("${turbopackChunkPrefix}")?t.slice("${turbopackChunkPrefix}".length):t)`,
  );

  return nextContent;
}

/** Rewrites root-absolute CSS url() assets relative to the CSS file location. */
function rewriteCssAssetPaths(content, relPath) {
  const cssDir = path.posix.dirname(toPosixPath(relPath));

  return content.replace(
    /url\((["']?)\/((?:_next\/static\/media|assets)\/[^"')]+)\1\)/g,
    (_match, quote, targetPath) => `url(${quote}${relativeUrlFrom(cssDir, targetPath)}${quote})`,
  );
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

  if (!indexHtml.includes(crazyGamesSdkScript)) {
    throw new Error('[crazygames] CrazyGames SDK script tag is missing from index.html.');
  }

  for (const filePath of files) {
    if (!textExtensions.has(path.extname(filePath))) continue;

    const relPath = path.relative(outDir, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (adPattern.test(content)) {
      throw new Error(`[crazygames] ad reference found in ${relPath}.`);
    }

    if (path.extname(filePath) === '.js' && isNextChunk(relPath)) {
      assertTurbopackRuntimePathsWereRewritten(content, relPath);
      assertCoreDataPathsWereNotRewritten(content, relPath);
      assertWorkerPublicPathIsRelativeToChunk(content, relPath);
    }

    if (path.extname(filePath) === '.css') {
      assertCssDoesNotUseRootAbsoluteAssets(content, relPath);
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

function assertCssDoesNotUseRootAbsoluteAssets(content, relPath) {
  if (/url\((["']?)\/(?:_next|assets)\//.test(content)) {
    throw new Error(`[crazygames] root-absolute CSS asset reference found in ${relPath}.`);
  }
}

function assertCoreDataPathsWereNotRewritten(content, relPath) {
  for (const fileName of coreDataFileNames) {
    const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rewrittenCoreDataPattern = new RegExp(`["']\\./${escaped}["']`);
    if (rewrittenCoreDataPattern.test(content)) {
      throw new Error(`[crazygames] rewritten core data path found in ${relPath}: ./${fileName}`);
    }
  }
}

function assertTurbopackRuntimePathsWereRewritten(content, relPath) {
  if (content.includes('let t="/_next/"')) {
    throw new Error(`[crazygames] root-absolute Turbopack public path found in ${relPath}.`);
  }

  if (content.includes('var l=new URL(s[a],location.origin);')) {
    throw new Error(`[crazygames] root-origin Turbopack worker bootstrap path found in ${relPath}.`);
  }
}

function assertWorkerPublicPathIsRelativeToChunk(content, relPath) {
  if (!isWorkerRuntimeChunk(content)) return;

  if (/\.p="\.\/_next\/"/.test(content)) {
    throw new Error(`[crazygames] worker chunk has page-relative public path in ${relPath}.`);
  }
}

function isNextChunk(relPath) {
  return toPosixPath(relPath).startsWith('_next/static/chunks/');
}

function isNextWebpackRuntime(relPath) {
  return /^_next\/static\/chunks\/webpack-[\w-]+\.js$/.test(toPosixPath(relPath));
}

function isWorkerRuntimeChunk(content) {
  return (
    content.includes('importScripts') &&
    /\.p="(?:\/_next\/|\.\/_next\/|\.\.\/\.\.\/)"/.test(content)
  );
}

function isAllowedExternalUrl(url) {
  return (
    allowedExternalUrls.has(url) ||
    allowedExternalUrlPrefixes.some((allowedPrefix) => url.startsWith(allowedPrefix))
  );
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function relativeUrlFrom(fromDir, targetPath) {
  const relativePath = path.posix.relative(fromDir, targetPath);
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
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
    const extension = path.extname(filePath);
    const relPath = path.relative(outDir, filePath);
    const rewritten = markupRewriteExtensions.has(extension)
      ? rewriteStaticPaths(content)
      : extension === '.css'
        ? rewriteCssAssetPaths(content, relPath)
        : rewriteWebpackPublicPath(content, relPath);

    if (rewritten !== content) {
      fs.writeFileSync(filePath, rewritten, 'utf-8');
    }
  }

  assertCrazyGamesOutput(listFiles(outDir));
  console.log('[crazygames] Static export prepared for direct file upload.');
}

main();
