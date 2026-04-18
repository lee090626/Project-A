#!/usr/bin/env node
/**
 * @fileoverview 빌드/개발 서버 시작 전 public/sw.js를 자동 생성합니다.
 * CACHE_VERSION에 현재 타임스탬프를 하드코딩하여 배포마다 캐시를 자동 갱신합니다.
 *
 * 실행 시점:
 *   - `npm run dev`   → predev 훅
 *   - `npm run build` → prebuild 훅
 */

const fs = require('fs');
const path = require('path');

const version = Date.now().toString();
const outPath = path.join(__dirname, '../public/sw.js');

const content = `// ⚠️ 이 파일은 scripts/generate-sw.js에 의해 자동 생성됩니다. 직접 편집하지 마세요.
// Generated at: ${new Date().toISOString()}

const CACHE_NAME = 'game-assets-${version}';
const ASSET_PATTERNS = [
  /\\/assets\\/.*\\.webp$/,
  /\\/assets\\/game-atlas.*\\.json$/,
  /\\/assets\\/manifest\\.json$/,
];

/** 설치 즉시 활성화 (기존 SW 대기 없이 교체) */
self.addEventListener('install', () => {
  self.skipWaiting();
});

/** 구버전 캐시 정리 후 모든 클라이언트 즉시 제어 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

/**
 * Cache-First 전략:
 *   에셋 파일은 캐시에서 우선 반환, 없으면 네트워크 fetch 후 캐싱.
 *   에셋 외 요청은 SW가 개입하지 않음.
 */
self.addEventListener('fetch', (e) => {
  if (!ASSET_PATTERNS.some((p) => p.test(e.request.url))) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(e.request);
      if (cached) return cached;

      const response = await fetch(e.request);
      if (response.ok) {
        cache.put(e.request, response.clone());
      }
      return response;
    })
  );
});
`;

fs.writeFileSync(outPath, content, 'utf-8');
console.log(`[generate-sw] public/sw.js generated (version: ${version})`);
