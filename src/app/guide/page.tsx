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
  title: 'Drilling RPG Guide | Mining, Gear, Bosses, and Progression',
  description:
    'Learn how to play Drilling RPG: mining depth, Survey X, equipment crafting, C2 to C4 progression, bosses, saving, and browser game systems.',
  alternates: { canonical: '/guide' },
};

const GUIDE_STEPS = [
  {
    title: '1. Mine the local ore',
    body: 'Each circle introduces a small set of collectible ores. Start by breaking the easiest ore in the current circle, then use the stronger local ores for the next equipment piece.',
  },
  {
    title: '2. Craft the drill first',
    body: 'The drill controls mining power and also contributes to monster damage. If a new circle feels slow, the local drill is usually the first item to target.',
  },
  {
    title: '3. Add survival gear',
    body: 'Helmets, armor, and boots raise maximum HP, defense, movement, or a mix of those stats. Craft them when monsters begin to force frequent returns to base.',
  },
  {
    title: '4. Defeat the circle boss',
    body: 'Bosses appear near the lower part of their circle. Clearing the boss grants a large gold reward plus essence and relic items that support the next circle.',
  },
] as const;

const CIRCLE_GUIDE = [
  {
    title: 'Circle 2: Lust',
    body: 'Mine Crimsonstone, Galestone, and Fervorstone. Craft Crimson Fang as the first power milestone, then fill defensive pieces before fighting Asmodeus.',
  },
  {
    title: 'Circle 3: Gluttony',
    body: 'Mine Moldstone, Sludgestone, and Rotstone. Void Crusher is the main power spike. Cerberus introduces stronger warning patterns and rewards Gluttony essence.',
  },
  {
    title: 'Circle 4: Greed',
    body: 'Mine Goldstone, Luststone, and Midasite. Crown gear stabilizes Greed mining and prepares the player for the next unreleased circle once C5 is opened.',
  },
] as const;

const SYSTEMS = [
  {
    title: 'Survey X and Depth',
    body: 'Survey X tracks horizontal exploration while Depth tracks descent. The game is designed for wide horizontal movement and deeper circle progression, so these two values are enough to describe the current exploration state.',
  },
  {
    title: 'Inventory and effects',
    body: 'Ores are stored in inventory. Essence and relic items are stored as effect stacks, which can permanently improve stats such as power, HP, luck, or circle-specific defense ignore.',
  },
  {
    title: 'Waypoints',
    body: 'Waypoints let players return to previously reached depth milestones. They reduce repetition after the player has already proven they can reach a section.',
  },
  {
    title: 'Autosave',
    body: 'Progress is saved locally in the browser. Clearing site data or changing browser profiles can remove local save data, so exported save codes should be used before wiping storage.',
  },
] as const;

export default function GuidePage() {
  return (
    <PublisherLayout currentPath="/guide">
      <PublisherHero
        eyebrow="Player guide"
        title="How to progress through the current Drilling RPG build."
        actions={
          <>
            <Link href="/play" className="pixel-button pixel-button-active px-5 py-3 font-black">
              Play
            </Link>
            <Link href="/changelog" className="pixel-button px-5 py-3 font-black">
              See Updates
            </Link>
          </>
        }
      >
        <p>
          This guide explains the current public progression path. It covers the game loop,
          currently playable circles, resource goals, equipment decisions, boss milestones, and
          save behavior.
        </p>
      </PublisherHero>

      <PublisherSection
        title="Core Progression Loop"
        intro="The game is structured around a repeatable loop: mine, craft, survive, defeat the boss, then descend."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {GUIDE_STEPS.map((step) => (
            <InfoCard key={step.title} title={step.title}>
              <p>{step.body}</p>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>

      <PublisherSection
        title="Circle Route"
        intro="Circle 2 to Circle 4 are the current finished gameplay arc. Circle 5 and later are not presented as normal progression yet."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {CIRCLE_GUIDE.map((circle) => (
            <InfoCard key={circle.title} title={circle.title}>
              <p>{circle.body}</p>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>

      <PublisherSection title="Systems Reference">
        <div className="grid gap-5 md:grid-cols-2">
          {SYSTEMS.map((system) => (
            <InfoCard key={system.title} title={system.title}>
              <p>{system.body}</p>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>

      <PublisherSection
        title="Recommended First Session"
        intro="A practical route for a fresh save."
      >
        <div className="pixel-panel p-7">
          <ol className="list-decimal space-y-3 pl-5 text-[#d0b886]">
            <li>Collect enough Crimsonstone and Galestone to craft Crimson Fang.</li>
            <li>Use the stronger drill to collect Fervorstone and complete defensive Crimson gear.</li>
            <li>Push toward the lower Lust section and fight Asmodeus once survival feels stable.</li>
            <li>Move into Gluttony, craft Void Crusher, and repeat the pattern for Cerberus.</li>
            <li>Enter Greed only after the Gluttony drill and enough HP/defense are in place.</li>
          </ol>
        </div>
      </PublisherSection>
    </PublisherLayout>
  );
}
