import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const basePath = process.env.BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages: use /drilling-rpg
  // Itch.io: must use empty or relative paths
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : './',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
