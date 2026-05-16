# 배포

---
status: canonical
owner: engineering
last_reviewed: 2026-05-16
source_paths:
  - package.json
  - next.config.ts
  - wrangler.toml
  - open-next.config.ts
  - scripts/generate-sw.js
  - scripts/prepare-crazygames-build.js
  - scripts/zip-crazygames-build.js
  - src/shared/lib/basePath.ts
  - src/shared/lib/crazyGamesSdk.ts
  - src/shared/lib/googleH5Ads.ts
  - src/shared/config/coreDataFiles.ts
  - src/shared/config/coreDataFiles.json
  - src/app/layout.tsx
  - src/app/sitemap.ts
  - public/robots.txt
  - public/ads.txt
  - public/_headers
  - .gitignore
---

## 목적

이 문서는 Drilling RPG의 빌드 타깃, 배포 명령, 산출물, 배포별 예외 처리를 설명합니다. 개발 중 실행과 검증 절차는 `DEVELOPMENT_WORKFLOW.md`, 에셋 생성은 `ASSET_PIPELINE.md`, 런타임 구조는 `ARCHITECTURE.md`를 함께 확인합니다.

## 배포 타깃 요약

현재 `package.json` 기준 배포 타깃은 네 가지입니다.

| 타깃 | 명령 | 산출물 | 기준 경로 | 비고 |
|---|---|---|---|---|
| GitHub Pages | `npm run deploy` | `out/**`를 `gh-pages`로 publish | `/drilling-rpg` | `.nojekyll`을 생성한 뒤 `gh-pages -t -d out` 실행 |
| Cloudflare Pages | `npm run deploy:cf` | `out/**` | `/` | `wrangler pages deploy out` 실행 |
| Itch.io | `npm run build:itch` | `out/**` | `/` | 정적 export 결과를 수동 업로드하는 흐름 |
| CrazyGames | `npm run package:crazygames` | `drilling-rpg-crazygames.zip` | 상대 경로 | 정적 export 후 업로드용 검증/경로 재작성/zip 생성 |

`npm run build`는 배포용 정적 export가 아니라 기본 Next.js build입니다. `IS_EXPORT`가 없으면 `next.config.ts`의 `output`은 `standalone`이 되며, 산출물은 `.next/**` 중심입니다.

## 빌드 명령

`package.json`의 배포 관련 script:

| 명령 | 실제 흐름 |
|---|---|
| `npm run build` | `prebuild`로 `npm run gen:sw` 실행 후 `next build` |
| `npm run build:gh` | `IS_EXPORT=true`, `BASE_PATH=/drilling-rpg`, `NEXT_PUBLIC_BASE_PATH=/drilling-rpg`로 서비스워커 생성 후 정적 export |
| `npm run build:itch` | `IS_EXPORT=true`, base path 빈 값으로 서비스워커 생성 후 정적 export |
| `npm run build:cf` | `IS_EXPORT=true`, base path 빈 값으로 서비스워커 생성 후 정적 export |
| `npm run build:crazygames` | CrazyGames 환경변수로 서비스워커 생성, 정적 export, `prepare-crazygames-build.js` 실행 |
| `npm run package:crazygames` | `build:crazygames` 후 `zip-crazygames-build.js`로 zip 생성 |
| `npm run deploy` | `build:gh`, `touch out/.nojekyll`, `gh-pages -t -d out` |
| `npm run deploy:cf` | `build:cf`, `wrangler pages deploy out` |

`build:gh`, `build:itch`, `build:cf`, `build:crazygames`는 `next build`를 직접 호출하므로 `prebuild`에 의존하지 않고 각 script 안에서 `npm run gen:sw`를 먼저 실행합니다.

## 환경변수 경계

| 변수 | 사용 위치 | 의미 |
|---|---|---|
| `IS_EXPORT` | `next.config.ts` | `true`이면 `output: 'export'`, 아니면 `output: 'standalone'` |
| `BASE_PATH` | `next.config.ts` | 정적 export의 Next `basePath`와 `assetPrefix` 기준 |
| `NEXT_PUBLIC_BASE_PATH` | `src/shared/lib/basePath.ts`, `scripts/generate-sw.js`, `src/app/layout.tsx` | 클라이언트 런타임과 서비스워커 pre-cache URL 기준 |
| `BUILD_TARGET` | `package.json` script | 빌드 타깃 표식. 현재 CrazyGames script에서 설정 |
| `NEXT_PUBLIC_BUILD_TARGET` | `src/app/layout.tsx`, `src/shared/lib/crazyGamesSdk.ts`, `src/shared/lib/googleH5Ads.ts` | 클라이언트에서 CrazyGames 전용 분기 판단 |
| `NEXT_PUBLIC_SITE_URL` | `src/app/layout.tsx`, `src/app/sitemap.ts` | metadata base와 sitemap URL 기준 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | `src/app/layout.tsx` | Google H5 Ads client id. 기본값은 `ca-pub-8319588891960553` |
| `NEXT_PUBLIC_GOOGLE_H5_AD_TEST_MODE` | `src/app/layout.tsx` | `on`이면 광고 test mode attribute를 추가 |
| `NEXT_PUBLIC_GOOGLE_H5_AD_DEBUG` | `src/shared/lib/googleH5Ads.ts` | `on`이면 Google H5 Ads debug 로그 출력 |
| `SW_VERSION` | `scripts/generate-sw.js` | 서비스워커 캐시 버전 강제 지정 |

`BASE_PATH`와 `NEXT_PUBLIC_BASE_PATH`는 역할이 다릅니다. `BASE_PATH`는 Next export 경로에 영향을 주고, `NEXT_PUBLIC_BASE_PATH`는 런타임 fetch/preload/service worker 경로에 영향을 줍니다. GitHub Pages처럼 하위 경로에서 서빙하는 배포는 두 값을 같은 `/drilling-rpg`로 맞춰야 합니다.

## Next 설정

`next.config.ts`는 `IS_EXPORT` 여부로 빌드 형태를 바꿉니다.

| 조건 | `output` | `basePath` | `assetPrefix` |
|---|---|---|---|
| `IS_EXPORT=true` | `export` | `BASE_PATH` 값 | `BASE_PATH`가 있으면 `${BASE_PATH}/` |
| 그 외 | `standalone` | 빈 문자열 | `undefined` |

`trailingSlash`는 `false`입니다. 주석 기준으로 Cloudflare Pages의 index serving과 충돌할 수 있어 비활성화되어 있습니다. `images.unoptimized`는 `true`라서 Next Image 최적화 서버에 의존하지 않습니다.

보안 헤더의 정본은 `config/security-headers.json`입니다. `IS_EXPORT`가 없는 standalone 빌드에서는 `next.config.ts`의 `headers()`가 이 JSON을 읽어 낮은 위험 보안 헤더와 `Content-Security-Policy-Report-Only`를 모든 경로에 적용합니다. `IS_EXPORT=true` 정적 export에서는 Next의 `headers()` 기능이 적용되지 않으므로 `scripts/generate-headers.js`가 같은 JSON에서 Cloudflare Pages용 `public/_headers` 파일을 생성합니다.

## 보안 헤더 1차 적용

현재 보안 헤더는 강제 CSP가 아니라 1차 방어선입니다.

| 헤더 | 적용 위치 | 정책 |
|---|---|---|
| `X-Content-Type-Options` | `config/security-headers.json` -> `next.config.ts`, `public/_headers` | `nosniff` |
| `Referrer-Policy` | `config/security-headers.json` -> `next.config.ts`, `public/_headers` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `config/security-headers.json` -> `next.config.ts`, `public/_headers` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `Content-Security-Policy-Report-Only` | `config/security-headers.json` -> `next.config.ts`, `public/_headers` | Google H5 Ads, CrazyGames SDK, worker/blob, atlas/image 로딩을 고려한 관찰 모드 CSP |

`Content-Security-Policy` 강제 모드는 아직 사용하지 않습니다. Google H5 Ads, Web Worker, Service Worker, Itch/CrazyGames iframe 배포가 있으므로 먼저 Report-Only 위반 로그를 확인한 뒤 강제 전환 여부를 판단합니다. `X-Frame-Options`와 `frame-ancestors`도 iframe 배포를 막을 수 있어 1차 적용에서는 제외합니다.

## 서비스워커

`scripts/generate-sw.js`는 `public/sw.js`를 자동 생성합니다. 이 파일은 `.gitignore`에 포함되어 있으며 직접 편집하지 않습니다.

`scripts/generate-headers.js`는 `config/security-headers.json`에서 `public/_headers`를 생성합니다. 보안 헤더를 바꿀 때는 JSON을 수정한 뒤 `npm run gen:headers`를 실행해 정적 export 산출물용 헤더 파일을 갱신합니다.

생성 시점:

| 흐름 | 실행 방식 |
|---|---|
| `npm run dev` | `predev`가 `npm run gen:sw` 실행 |
| `npm run build` | `prebuild`가 `npm run gen:sw` 실행 |
| 정적 배포 script | 각 script가 `next build` 전에 `npm run gen:sw` 직접 실행 |

서비스워커 캐시 버전 우선순위:

1. `SW_VERSION`
2. CI commit SHA 환경변수: `GITHUB_SHA`, `CI_COMMIT_SHA`, `CF_PAGES_COMMIT_SHA`, `VERCEL_GIT_COMMIT_SHA`, `COMMIT_SHA`
3. `git rev-parse --short HEAD`
4. timestamp fallback

pre-cache 대상은 `src/shared/config/coreDataFiles.json`의 `coreDataFiles`입니다. 현재 목록은 `/baseLayout.json`, `/entities.json`, `/game-init-data.json`입니다. 이 목록은 `assetConfigValidation.mjs` 검증을 통과해야 서비스워커가 생성됩니다.

`src/app/layout.tsx`는 production이면서 CrazyGames 빌드가 아닐 때만 서비스워커를 등록합니다. 개발 환경과 CrazyGames 빌드에서는 기존 service worker registration과 `game-assets-*` cache를 해제합니다.

## 정적 데이터와 preload

`src/app/layout.tsx`는 HTML head에서 아래 리소스를 preload합니다.

| 대상 | 기준 |
|---|---|
| 아틀라스 이미지 | `public/assets/manifest.json`의 atlas JSON 이름을 `.webp`로 바꾼 경로 |
| 아틀라스 JSON | `public/assets/manifest.json`의 atlas JSON 경로 |
| core data | `CORE_DATA_FILES` 목록 |

preload 경로에는 `getBasePath()`와 `withBasePath()`가 사용됩니다. base path를 바꾸면 HTML preload, 런타임 fetch, service worker pre-cache가 함께 맞아야 합니다.

## GitHub Pages

GitHub Pages 흐름은 `npm run deploy`입니다.

```bash
npm run deploy
```

내부 흐름:

1. `npm run build:gh`
2. `touch out/.nojekyll`
3. `gh-pages -t -d out`

`build:gh`는 `BASE_PATH=/drilling-rpg`와 `NEXT_PUBLIC_BASE_PATH=/drilling-rpg`를 사용합니다. GitHub Pages 경로가 바뀌면 두 환경변수를 같이 바꿔야 합니다.

## Cloudflare Pages

Cloudflare Pages 흐름은 `npm run deploy:cf`입니다.

```bash
npm run deploy:cf
```

내부 흐름:

1. `npm run build:cf`
2. `wrangler pages deploy out`

`wrangler.toml`의 현재 기준:

| 항목 | 값 |
|---|---|
| project name | `drilling-rpg` |
| compatibility date | `2024-12-30` |
| compatibility flags | `nodejs_compat` |
| pages output | `out` |
| observability | enabled |

`open-next.config.ts`는 존재하지만 현재 `package.json`의 Cloudflare 배포 script는 OpenNext 산출물을 사용하지 않습니다. 현재 실행 경로는 `IS_EXPORT=true` 정적 export 후 `out`을 Pages에 올리는 방식입니다. OpenNext 기반 배포로 바꾸려면 script, 산출물 경로, RAG 문서, 검증 명령을 함께 갱신해야 합니다.

## Itch.io

Itch 빌드는 `npm run build:itch`입니다.

```bash
npm run build:itch
```

`BASE_PATH`와 `NEXT_PUBLIC_BASE_PATH`가 빈 값이므로 정적 export는 루트 기준 경로를 사용합니다. 업로드 방식 자체를 자동화하는 script는 현재 없습니다. 업로드 전에는 `out/index.html`과 `_next`, `assets`, core data 파일이 함께 포함되는지 확인합니다.

## CrazyGames

CrazyGames 패키징은 `npm run package:crazygames`입니다.

```bash
npm run package:crazygames
```

내부 흐름:

1. `BUILD_TARGET=crazygames`, `NEXT_PUBLIC_BUILD_TARGET=crazygames`로 `npm run gen:sw`
2. 같은 환경변수로 `next build`
3. `scripts/prepare-crazygames-build.js`
4. `scripts/zip-crazygames-build.js`

CrazyGames 빌드의 차이:

| 항목 | 처리 |
|---|---|
| SDK | `layout.tsx`가 `https://sdk.crazygames.com/crazygames-sdk-v3.js` script를 삽입 |
| Gameplay event | `crazyGamesSdk.ts`가 `loadingStart`, `loadingStop`, `gameplayStart`를 SDK에 전달 |
| Google H5 Ads | `layout.tsx`와 `googleH5Ads.ts`에서 CrazyGames 빌드일 때 비활성화 |
| Service worker | CrazyGames 빌드에서는 등록하지 않고 기존 registration/cache를 제거 |
| 정적 경로 | `prepare-crazygames-build.js`가 root-absolute 경로를 상대 경로로 재작성 |
| zip | `zip-crazygames-build.js`가 `out` 내용을 `drilling-rpg-crazygames.zip`으로 압축 |

`prepare-crazygames-build.js`는 다음 조건을 검증합니다.

| 검증 | 실패 조건 |
|---|---|
| entry 확인 | `out/index.html`이 없거나 게임 entry로 보이지 않음 |
| SDK 확인 | CrazyGames SDK script tag가 없음 |
| 광고 제거 | `adsbygoogle`, `googlesyndication`, `ca-pub`, `pub-8319588891960553` 등 광고 참조가 남아 있음 |
| 외부 리소스 제한 | 허용되지 않은 `https?://` 리소스가 HTML에 남아 있음 |
| root-absolute 경로 제거 | `/_next`, `/assets`, `/baseLayout.json`, `/entities.json`, `/game-init-data.json`, `/icon.png`, `/sw.js` 참조가 남아 있음 |
| runtime path | Turbopack/Webpack chunk public path가 업로드 환경에서 상대 경로로 동작하지 않음 |
| CSS asset path | CSS `url()`에 root-absolute asset 경로가 남아 있음 |

허용된 외부 URL은 CrazyGames SDK URL뿐입니다. `http://www.w3.org/` prefix는 문서/namespace 형태의 참조를 허용하기 위한 예외입니다.

## 광고와 검색 메타데이터

일반 웹 배포에서는 `src/app/layout.tsx`가 Google H5 Ads script를 삽입합니다. CrazyGames 빌드에서는 광고 script를 넣지 않습니다.

| 파일 | 역할 |
|---|---|
| `public/ads.txt` | Google publisher metadata |
| `public/robots.txt` | crawler 허용과 sitemap 경로 |
| `src/app/sitemap.ts` | `/`와 `/play` sitemap entry 생성 |

`sitemap.ts`는 `NEXT_PUBLIC_SITE_URL`이 없으면 `https://drilling-rpg.pages.dev`를 사용합니다. 실제 canonical domain이 바뀌면 `NEXT_PUBLIC_SITE_URL`, `public/robots.txt`, 배포 문서를 같이 갱신합니다.

## 산출물 관리

`.gitignore` 기준 다음 산출물은 커밋하지 않습니다.

| 경로 | 생성 주체 |
|---|---|
| `.next/**` | `next build` |
| `out/**` | `output: 'export'` 빌드 |
| `.open-next/**` | OpenNext 빌드 |
| `.wrangler/**` | Wrangler |
| `public/sw.js` | `scripts/generate-sw.js` |
| `drilling-rpg-crazygames.zip` | `scripts/zip-crazygames-build.js` |

배포 검증 중 산출물이 생겼다면 commit 전에 `git status --short`로 staged/untracked 범위를 확인합니다.

## 변경 시 체크리스트

배포 설정을 바꿀 때 확인할 것:

| 변경 | 같이 확인할 파일 |
|---|---|
| base path 변경 | `package.json`, `next.config.ts`, `src/shared/lib/basePath.ts`, `scripts/generate-sw.js`, `src/app/layout.tsx` |
| core data 파일 추가/이름 변경 | `src/shared/config/coreDataFiles.json`, `src/shared/config/coreDataFiles.ts`, `scripts/generate-sw.js`, `src/app/layout.tsx` |
| CrazyGames 요구사항 변경 | `src/app/layout.tsx`, `src/shared/lib/crazyGamesSdk.ts`, `scripts/prepare-crazygames-build.js`, `scripts/zip-crazygames-build.js` |
| 광고 정책 변경 | `src/app/layout.tsx`, `src/shared/lib/googleH5Ads.ts`, `public/ads.txt`, CrazyGames 검증 패턴 |
| Cloudflare 배포 방식 변경 | `package.json`, `wrangler.toml`, `open-next.config.ts`, `.gitignore` |
| canonical domain 변경 | `NEXT_PUBLIC_SITE_URL`, `src/app/sitemap.ts`, `public/robots.txt`, README/배포 문서 |

문서만 수정한 경우 최소 검증:

```bash
test -f docs/DEPLOYMENT.md
rg -n "DEPLOYMENT.md|배포" README.md docs/README.md docs/DEPLOYMENT.md
```

배포 로직을 수정한 경우 권장 검증:

```bash
npm run build
npm run build:gh
npm run build:cf
npm run build:itch
npm run package:crazygames
```

모든 타깃을 매번 실행하기 어렵다면 바뀐 파일이 영향을 주는 타깃만 실행하고, 실행하지 못한 타깃은 PR 본문에 명시합니다.
