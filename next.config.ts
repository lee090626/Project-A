import type { NextConfig } from 'next';

const isExport = process.env.IS_EXPORT === 'true';
const exportBasePath = process.env.BASE_PATH || '';
const exportAssetPrefix = exportBasePath ? `${exportBasePath}/` : undefined;
const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.gstatic.com https://*.doubleclick.net https://sdk.crazygames.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: http: ws: wss: blob:",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' https:",
  "manifest-src 'self'",
].join('; ');

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: cspReportOnly,
  },
];

const nextConfig: NextConfig = {
  // Cloudflare OpenNext requires 'standalone'
  // GitHub Pages / Itch.io requires 'export'
  output: isExport ? 'export' : 'standalone',

  // GitHub Pages: use /drilling-rpg
  // Itch.io / Cloudflare: use empty paths
  // CrazyGames: keep Next defaults here, then rewrite static export paths post-build.
  basePath: isExport ? exportBasePath : '',
  assetPrefix: isExport ? exportAssetPrefix : undefined,

  // trailingSlash: true 옵션은 Cloudflare Pages의 index 서빙과 충돌할 수 있어 비활성화합니다.
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  ...(isExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/:path*',
              headers: securityHeaders,
            },
          ];
        },
      }),
};

export default nextConfig;
