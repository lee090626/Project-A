import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoCard, PublisherHero, PublisherLayout, PublisherSection } from '../_components/PublisherLayout';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Contact | Drilling RPG',
  description:
    'Contact and support information for Drilling RPG, including bug reports, gameplay feedback, and policy-related messages.',
  alternates: { canonical: '/contact' },
};

const GITHUB_ISSUES_URL = 'https://github.com/lee090626/Project-A/issues';

export default function ContactPage() {
  return (
    <PublisherLayout currentPath="/contact">
      <PublisherHero
        eyebrow="Support"
        title="Contact the Drilling RPG project."
        actions={
          <Link href={GITHUB_ISSUES_URL} className="pixel-button pixel-button-active px-5 py-3 font-black">
            Open GitHub Issues
          </Link>
        }
      >
        <p>
          Use this page for support direction, bug reports, policy questions, and gameplay feedback.
          The project currently uses GitHub Issues as its public support and feedback channel.
        </p>
      </PublisherHero>

      <PublisherSection title="Support Topics">
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Bug reports">
            <p>
              Include the route, browser, device, what you expected to happen, and what happened
              instead. Screenshots are helpful for HUD, layout, or rendering bugs.
            </p>
          </InfoCard>
          <InfoCard title="Gameplay feedback">
            <p>
              Feedback about C2 to C4 balance, boss difficulty, equipment pacing, and resource
              clarity helps decide what should be adjusted before opening later circles.
            </p>
          </InfoCard>
          <InfoCard title="Save issues">
            <p>
              Mention whether browser storage was cleared, whether the same browser profile is being
              used, and whether an export save code exists.
            </p>
          </InfoCard>
          <InfoCard title="Policy or publisher questions">
            <p>
              For privacy, terms, or advertising-related questions, open an issue with enough
              context to identify the page and build where the concern appears.
            </p>
          </InfoCard>
        </div>
      </PublisherSection>
    </PublisherLayout>
  );
}

