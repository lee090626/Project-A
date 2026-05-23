import type { Metadata } from 'next';
import Link from 'next/link';
import {
  InfoCard,
  PublisherHero,
  PublisherLayout,
  PublisherSection,
} from '../_components/PublisherLayout';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Drilling RPG Updates | Development Changelog',
  description:
    'Read Drilling RPG update notes covering C2 to C4 content, HUD changes, pixel UI work, survey coordinates, and publisher site improvements.',
  alternates: { canonical: '/changelog' },
};

const UPDATES = [
  {
    date: 'May 23, 2026',
    title: 'Publisher site structure',
    points: [
      'Added crawlable public pages for the game overview, guide, updates, privacy, terms, and contact.',
      'Moved Google H5 Ads loading behind an explicit environment flag while the site is prepared for review.',
      'Expanded sitemap coverage so the site is understandable outside the game canvas.',
    ],
  },
  {
    date: 'May 22, 2026',
    title: 'C2 to C4 progression audit',
    points: [
      'Verified C2, C3, and C4 data links for minerals, monsters, bosses, gear, essences, and relics.',
      'Corrected C3 and C4 mineral depth metadata to match their actual circle ranges.',
      'Confirmed the game boots at the play route with atlas assets and canvas rendering available.',
    ],
  },
  {
    date: 'May 21, 2026',
    title: 'Pixel UI and HUD direction',
    points: [
      'Reworked HUD and modal styling toward a 2D pixel mining RPG identity.',
      'Simplified coordinate display around Survey X and Depth.',
      'Documented hidden content planning around future tower-style exploration.',
    ],
  },
  {
    date: 'May 16, 2026',
    title: 'Circle 4 content ceiling',
    points: [
      'Set Circle 4 Greed as the current playable content ceiling.',
      'Added Greed minerals, monsters, Fafnir boss data, Crown equipment, and Greed essence support.',
      'Kept Circle 5 and later locked until their balance and content are production-ready.',
    ],
  },
] as const;

export default function ChangelogPage() {
  return (
    <PublisherLayout currentPath="/changelog">
      <PublisherHero
        eyebrow="Development updates"
        title="What changed in Drilling RPG."
        actions={
          <Link href="/guide" className="pixel-button pixel-button-active px-5 py-3 font-black">
            Read Guide
          </Link>
        }
      >
        <p>
          This page records visible changes that affect players and reviewers. It focuses on
          playable content, progression, public site structure, and policy-facing changes.
        </p>
      </PublisherHero>

      <PublisherSection title="Update Log">
        <div className="space-y-5">
          {UPDATES.map((update) => (
            <InfoCard key={`${update.date}-${update.title}`} title={`${update.date}: ${update.title}`}>
              <ul className="list-disc space-y-2 pl-5">
                {update.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>
    </PublisherLayout>
  );
}
