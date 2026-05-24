import { MetadataRoute } from 'next';
import { SITE_URL } from '@/shared/config/siteMetadata';

export const dynamic = 'force-static';

const SITEMAP_ENTRIES = [
  {
    path: '/',
    lastModified: '2026-05-23',
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    path: '/guide',
    lastModified: '2026-05-23',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/changelog',
    lastModified: '2026-05-24',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/privacy',
    lastModified: '2026-05-23',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/terms',
    lastModified: '2026-05-23',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/contact',
    lastModified: '2026-05-23',
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    path: '/play',
    lastModified: '2026-05-23',
    changeFrequency: 'daily',
    priority: 0.8,
  },
] as const satisfies readonly {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[];

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: new Date(`${entry.lastModified}T00:00:00.000Z`),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
