import type { Metadata } from 'next';
import { InfoCard, PublisherHero, PublisherLayout, PublisherSection } from '../_components/PublisherLayout';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy Policy | Drilling RPG',
  description:
    'Privacy policy for Drilling RPG, including local save data, browser storage, third-party advertising notes, and contact information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <PublisherLayout currentPath="/privacy">
      <PublisherHero eyebrow="Policy" title="Privacy Policy">
        <p>Last updated: May 23, 2026.</p>
        <p>
          Drilling RPG is a browser game. The site is designed to let players read about the game
          and play without creating an account.
        </p>
      </PublisherHero>

      <PublisherSection title="What We Store">
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Local game save">
            <p>
              The game stores progress in the player&apos;s browser, including inventory,
              equipment, position, unlocked waypoints, boss encounters, and effect stacks. This data
              remains on the device/browser profile unless the player exports it or clears browser
              storage.
            </p>
          </InfoCard>
          <InfoCard title="Settings">
            <p>
              Display and gameplay preferences may be stored locally so the browser can restore the
              player&apos;s preferred settings in future sessions.
            </p>
          </InfoCard>
          <InfoCard title="Server accounts">
            <p>
              Drilling RPG does not currently provide user accounts, account registration, payment
              accounts, or cloud save accounts on this site.
            </p>
          </InfoCard>
          <InfoCard title="Analytics and ads">
            <p>
              Google H5 Ads code is not loaded by default in normal builds. If future builds enable
              Google advertising after approval, Google may process ad-related data according to
              Google&apos;s publisher and advertising policies.
            </p>
          </InfoCard>
        </div>
      </PublisherSection>

      <PublisherSection title="Player Choices">
        <div className="pixel-panel p-7">
          <ul className="list-disc space-y-3 pl-5 text-[#d0b886]">
            <li>Players can clear local save data through their browser storage controls.</li>
            <li>Players can use export/import save tools when available before changing devices.</li>
            <li>Players can block third-party cookies or personalized ads through browser and Google settings.</li>
          </ul>
        </div>
      </PublisherSection>
    </PublisherLayout>
  );
}

