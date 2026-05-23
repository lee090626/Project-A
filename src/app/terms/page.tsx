import type { Metadata } from 'next';
import { InfoCard, PublisherHero, PublisherLayout, PublisherSection } from '../_components/PublisherLayout';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Terms of Use | Drilling RPG',
  description:
    'Terms of use for Drilling RPG, a free browser-based mining RPG with local save data and public game content.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PublisherLayout currentPath="/terms">
      <PublisherHero eyebrow="Policy" title="Terms of Use">
        <p>Last updated: May 23, 2026.</p>
        <p>
          By using this site or playing Drilling RPG, you agree to use the game and website in a
          lawful, non-abusive manner.
        </p>
      </PublisherHero>

      <PublisherSection title="Use of the Game">
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Free browser play">
            <p>
              Drilling RPG is offered as a free browser game. The public build may change as the
              game is balanced, updated, or prepared for additional distribution channels.
            </p>
          </InfoCard>
          <InfoCard title="Local save responsibility">
            <p>
              Save data is stored locally in the player&apos;s browser. Players are responsible for
              exporting save data before clearing browser storage or changing devices.
            </p>
          </InfoCard>
          <InfoCard title="Fair use">
            <p>
              Do not attack, scrape, overload, abuse, or attempt to interfere with the website,
              build files, game assets, or deployment infrastructure.
            </p>
          </InfoCard>
          <InfoCard title="No warranty">
            <p>
              The game is provided as-is. Bugs, balance changes, content locks, or save format
              updates may occur while the project is under active development.
            </p>
          </InfoCard>
        </div>
      </PublisherSection>
    </PublisherLayout>
  );
}

