// ⚠️ 이 파일은 scripts/generate-sw.js에 의해 자동 생성됩니다. 직접 편집하지 마세요.
// Generated at: 2026-04-23T08:31:09.479Z

const CACHE_NAME = 'game-assets-1776933069479';

/**
 * Cache-First 대상 패턴
 * - 게임 에셋: WebP 이미지, 아틀라스 JSON
 * - 게임 데이터: 맵 레이아웃, 엔티티, 초기 데이터
 * - Next.js 정적 파일: JS/CSS 번들 (콘텐츠 해시로 영구 캐싱 안전)
 */
const CACHE_FIRST_PATTERNS = [
  /\/assets\/.*\.webp$/,
  /\/assets\/game-atlas.*\.json$/,
  /\/assets\/manifest\.json$/,
  /\/baseLayout\.json$/,
  /\/entities\.json$/,
  /\/game-init-data\.json$/,
  /\/_next\/static\/.+\.(js|css)$/,
];

/**
 * 설치 시 즉시 pre-cache할 정적 게임 데이터 파일 목록.
 * 첫 방문 시에도 두 번째 방문과 같은 속도를 보장합니다.
 */
const PRECACHE_URLS = [
  '/baseLayout.json',
  '/entities.json',
  '/game-init-data.json',
];

/** 설치 즉시 pre-cache 후 활성화 (기존 SW 대기 없이 교체) */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static game data...');
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // pre-cache 실패는 게임 동작에 영향 없음 (요청 시 캐시로 폴백)
        console.warn('[SW] Pre-cache partial failure (non-fatal):', err);
      });
    }).then(() => self.skipWaiting())
  );
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
 *   매칭되는 파일은 캐시에서 우선 반환, 없으면 네트워크 fetch 후 캐싱.
 *   Next.js 정적 파일은 콘텐츠 해시 기반이므로 영구 캐싱 안전.
 *   매칭되지 않는 요청(API, HTML)은 SW가 개입하지 않음.
 */
self.addEventListener('fetch', (e) => {
  if (!CACHE_FIRST_PATTERNS.some((p) => p.test(e.request.url))) return;

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
