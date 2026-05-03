import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import atlasManifest from '../../public/assets/manifest.json';
import { CORE_DATA_FILES } from '@/shared/config/coreDataFiles';
import { validateAtlasManifest } from '@/shared/config/assetConfigValidation.mjs';
import { getBasePath, withBasePath } from '@/shared/lib/basePath';
import './globals.css';

const isCrazyGamesBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames';
const shouldRegisterServiceWorker = process.env.NODE_ENV === 'production' && !isCrazyGamesBuild;

const geistSans = localFont({
  src: '../../public/fonts/geist-latin.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: '../../public/fonts/geist-mono-latin.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  ...(isCrazyGamesBuild
    ? {}
    : { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') }),
  title: 'Drilling RPG | Web-based Deep Mining Action & Exploration',
  description:
    'Explore the endless abyss in Drilling RPG. A free-to-play web-based top-down mining action survival game. Gather minerals, craft items, upgrade your drill, and defeat giant bosses.',
  keywords: [
    'drilling rpg',
    'mining game',
    'web game',
    'browser game',
    'survival rpg',
    'incremental mining',
    'free web game',
    '드릴게임',
    '광부 게임',
    '웹 게임',
  ],
  authors: [{ name: 'Drilling RPG Dev' }],
  ...(isCrazyGamesBuild
    ? {}
    : {
        openGraph: {
          title: 'Drilling RPG - Deep Mining Action',
          description:
            'Explore the endless abyss in Drilling RPG. A free-to-play web-based top-down mining game.',
          siteName: 'Drilling RPG',
          images: [
            {
              url: '/icon.png',
              width: 512,
              height: 512,
              alt: 'Drilling RPG Icon',
            },
          ],
          locale: 'en_US',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Drilling RPG | Mining Exploration',
          description: 'Explore the endless abyss. Play the ultimate free web-based mining RPG!',
          images: ['/icon.png'],
        },
      }),
  icons: {
    icon: '/icon.png',
  },
};

/**
 * 어플리케이션의 루트 레이아웃입니다.
 * 폰트 설정 및 기본 HTML 구조를 정의합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = getBasePath();
  const atlasFiles = validateAtlasManifest(atlasManifest).atlasFiles;
  const swPath = withBasePath('/sw.js');

  return (
    <html lang="en">
      <head>
        {/* 게임 에셋 preload: JS 실행 전부터 병렬 다운로드 시작 */}
        {/* 아틀라스 이미지 (가장 크고 무거운 파일 → 최우선) */}
        {atlasFiles.map((atlasJsonFile) => (
          <link
            key={`atlas-image-${atlasJsonFile}`}
            rel="preload"
            href={`${basePath}/assets/${atlasJsonFile.replace('.json', '.webp')}`}
            as="image"
            type="image/webp"
          />
        ))}

        {/* 아틀라스 JSON (이미지와 함께 쓰이는 메타데이터) */}
        {atlasFiles.map((atlasJsonFile) => (
          <link
            key={`atlas-json-${atlasJsonFile}`}
            rel="preload"
            href={`${basePath}/assets/${atlasJsonFile}`}
            as="fetch"
            crossOrigin="anonymous"
          />
        ))}

        {/* 게임 초기 데이터 (엔진 init에 즉시 사용) */}
        {CORE_DATA_FILES.map((filePath) => (
          <link
            key={`core-data-${filePath}`}
            rel="preload"
            href={withBasePath(filePath)}
            as="fetch"
            crossOrigin="anonymous"
          />
        ))}

        {isCrazyGamesBuild && (
          <Script
            id="crazygames-sdk"
            src="https://sdk.crazygames.com/crazygames-sdk-v3.js"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <div id="drilling-game-root">{children}</div>
        {shouldRegisterServiceWorker ? (
          <Script id="register-sw" strategy="afterInteractive">
            {`
            if ('serviceWorker' in navigator) {
              const swPath = '${swPath}';
              window.addEventListener('load', function() {
                navigator.serviceWorker.register(swPath).catch(function(err) {
                  // 등록 실패 시 게임은 정상 동작 (HTTP 캐시로 폴백)
                  console.warn('[SW] Registration failed, falling back to HTTP cache:', err);
                });
              });
            }
          `}
          </Script>
        ) : (
          <Script id="unregister-sw-dev" strategy="afterInteractive">
            {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                registrations.forEach(function(registration) {
                  registration.unregister();
                });
              });
            }
            if ('caches' in window) {
              caches.keys().then(function(keys) {
                keys
                  .filter(function(key) { return key.indexOf('game-assets-') === 0; })
                  .forEach(function(key) { caches.delete(key); });
              });
            }
          `}
          </Script>
        )}
      </body>
    </html>
  );
}
