export const DEFAULT_SITE_URL = 'https://drilling-rpg.pages.dev';

export function resolveSiteUrl(rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL): string {
  const siteUrl = rawSiteUrl?.trim() || DEFAULT_SITE_URL;
  return new URL(siteUrl).toString().replace(/\/$/, '');
}

export const SITE_URL = resolveSiteUrl();
