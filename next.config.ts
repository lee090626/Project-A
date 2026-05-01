import type { NextConfig } from 'next';

const isExport = process.env.IS_EXPORT === 'true';
const exportBasePath = process.env.BASE_PATH || '';
const exportAssetPrefix = exportBasePath ? `${exportBasePath}/` : undefined;

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
};

export default nextConfig;
