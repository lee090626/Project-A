import Link from 'next/link';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/guide', label: 'Guide' },
  { href: '/changelog', label: 'Updates' },
  { href: '/contact', label: 'Contact' },
] as const;

const POLICY_ITEMS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

export function PublisherLayout({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath?: string;
}) {
  return (
    <div className="min-h-screen bg-[#090a08] text-[#f4dfb8] selection:bg-[#2c8f87] selection:text-white">
      <header className="border-b-2 pixel-divider bg-[#11130f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="pixel-font text-2xl font-black text-[#fff1bf]">
            Drilling RPG
          </Link>
          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pixel-button px-3 py-2 text-sm font-bold ${
                  currentPath === item.href ? 'pixel-button-active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/play" className="pixel-button pixel-button-action px-3 py-2 text-sm font-bold">
              Play
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t-2 pixel-divider bg-[#11130f]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-3">
            <p className="pixel-font text-lg font-black text-[#fff1bf]">Drilling RPG</p>
            <p className="max-w-2xl text-sm leading-6 text-[#d0b886]">
              A free browser mining RPG about drilling through pixel strata, crafting circle gear,
              and fighting bosses that guard the lower depths.
            </p>
            <p className="text-xs text-[#a89065]">
              © {new Date().getFullYear()} Drilling RPG. All rights reserved.
            </p>
          </div>
          <nav aria-label="Policy navigation" className="flex flex-wrap gap-2 md:justify-end">
            {POLICY_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="pixel-button px-3 py-2 text-sm font-bold">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function PublisherHero({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b-2 pixel-divider">
      <div className="pixel-hero-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,10,8,0.28),#090a08)]" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <p className="pixel-font mb-4 text-sm font-black text-[#38d5e8]">{eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-black leading-tight text-[#fff1bf] md:text-6xl">
          {title}
        </h1>
        <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-[#d0b886]">{children}</div>
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function PublisherSection({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-7">
        <h2 className="text-3xl font-black text-[#fff1bf]">{title}</h2>
        {intro ? <p className="mt-3 max-w-3xl text-base leading-7 text-[#d0b886]">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="pixel-card p-6">
      <h3 className="mb-3 text-xl font-black text-[#fff1bf]">{title}</h3>
      <div className="space-y-3 text-sm leading-6 text-[#d0b886]">{children}</div>
    </article>
  );
}
