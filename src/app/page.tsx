import type { Metadata } from 'next';
import Link from 'next/link';
import { GamePlayShell } from './_components/GamePlayShell';
import {
  InfoCard,
  PublisherHero,
  PublisherLayout,
  PublisherSection,
} from './_components/PublisherLayout';
import { AtlasSprite } from '@/shared/ui/AtlasSprite';
import type { AtlasIconName } from '@/shared/config/atlasMap';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Drilling RPG | Free Browser Mining RPG',
  description:
    'Play Drilling RPG, a free browser-based pixel mining RPG. Mine ores, craft circle gear, defeat bosses, and explore the current C2 to C4 progression.',
  alternates: { canonical: '/' },
};

const HERO_TILES = ['StoneTile', 'CrimsonStoneIcon', 'MoldStoneIcon', 'GoldStoneIcon'] as const;

const CURRENT_CIRCLES = [
  {
    name: 'Circle 2: Lust',
    minerals: 'Crimsonstone, Galestone, Fervorstone',
    enemies: 'Lustful Whisperer, Gale Bat, Wind-torn Soul',
    boss: 'Asmodeus, the Lord of Desire',
    reward: 'Essence of Lust and Asmodeus relic progression',
  },
  {
    name: 'Circle 3: Gluttony',
    minerals: 'Moldstone, Sludgestone, Rotstone',
    enemies: 'Bloated Devourer, Starving Wraith, Greedy Slaughter',
    boss: 'Cerberus, the Hound of Gluttony',
    reward: 'Essence of Gluttony and Cerberus relic progression',
  },
  {
    name: 'Circle 4: Greed',
    minerals: 'Goldstone, Luststone, Midasite',
    enemies: 'Hoarding Specter, Mimic, Avarice Golem',
    boss: 'Fafnir, the Guardian of Gold',
    reward: 'Essence of Greed and Fafnir relic progression',
  },
] as const;

const FEATURE_CARDS = [
  {
    title: 'Mine by depth and circle',
    icon: 'CrimsonFangDrill',
    body: 'Every circle has its own background stratum, mineral set, monster table, and boss gate. The current public build focuses on C2 through C4 so players can follow a readable progression path.',
  },
  {
    title: 'Craft gear from local resources',
    icon: 'CrownPiercer',
    body: 'Drills raise mining power, helmets and armor improve survival, and boots add movement and defense. Each equipment tier is made from the ores found in its circle.',
  },
  {
    title: 'Collect permanent effects',
    icon: 'LustEssence',
    body: 'Bosses and monsters drop essence and relic items that stack over time. These effects support power, health, luck, and the next circle defense breakpoints.',
  },
  {
    title: 'Play in the browser',
    icon: 'Player',
    body: 'The game runs in a web browser with a React HUD and PixiJS rendering pipeline. Saves are stored locally in the browser so short sessions can still build progress.',
  },
] as const satisfies readonly {
  title: string;
  icon: AtlasIconName;
  body: string;
}[];

const FAQ_ITEMS = [
  {
    question: 'Is Drilling RPG playable now?',
    answer:
      'Yes. The current public progression covers Circle 2 through Circle 4, including minerals, monsters, bosses, craftable equipment, essences, relics, inventory, waypoints, and local saving.',
  },
  {
    question: 'What is the main goal?',
    answer:
      'Mine enough resources to craft the next equipment tier, survive the local monsters, defeat the circle boss, and push deeper into the next set of strata.',
  },
  {
    question: 'Does the game require installation?',
    answer:
      'No. Drilling RPG is a browser game. It uses local browser storage for save data and does not require a user account.',
  },
  {
    question: 'Are advertisements required to play?',
    answer:
      'No. Ad code is kept behind an explicit build flag while the publisher site is being prepared. Future game ads should use natural H5 game transition points only after product approval.',
  },
] as const;

export default function LandingPage() {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames') {
    return <GamePlayShell />;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Drilling RPG',
    applicationCategory: 'Game',
    operatingSystem: 'Web browser',
    genre: ['Mining RPG', 'Action RPG', 'Browser Game'],
    playMode: 'SinglePlayer',
    description:
      'A free browser-based pixel mining RPG with craftable equipment, circle bosses, local saves, and C2 to C4 progression.',
    url: '/',
    inLanguage: 'en',
  };

  return (
    <PublisherLayout currentPath="/">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublisherHero
        eyebrow="Free browser game"
        title="A pixel mining RPG with real progression, bosses, and craftable gear."
        actions={
          <>
            <Link href="/play" className="pixel-button pixel-button-active px-5 py-3 font-black">
              Play Drilling RPG
            </Link>
            <Link href="/guide" className="pixel-button px-5 py-3 font-black">
              Read the Guide
            </Link>
          </>
        }
      >
        <p>
          Drilling RPG is a top-down browser mining RPG where the player digs through hostile
          underground circles, gathers ore, crafts specialized gear, and fights bosses that guard
          the path to deeper content.
        </p>
        <p>
          This publisher site documents the playable game, its systems, current update state, and
          player support information so the project is understandable even before the game canvas is
          loaded.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {HERO_TILES.map((name) => (
            <span key={name} className="pixel-slot flex h-14 w-14 items-center justify-center">
              <AtlasSprite name={name} size={42} />
            </span>
          ))}
        </div>
      </PublisherHero>

      <PublisherSection
        title="What You Do In The Game"
        intro="The playable loop is built around resource collection, equipment milestones, monster pressure, and boss gates."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((feature) => (
            <InfoCard key={feature.title} title={feature.title}>
              <div className="mb-4 flex h-16 w-16 items-center justify-center pixel-icon-box">
                <AtlasSprite name={feature.icon} size={48} />
              </div>
              <p>{feature.body}</p>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>

      <PublisherSection
        title="Current Playable Content"
        intro="The current live content ceiling is Circle 4. Circle 5 and later are intentionally locked until their balance and content are ready."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {CURRENT_CIRCLES.map((circle) => (
            <InfoCard key={circle.name} title={circle.name}>
              <p>
                <strong className="text-[#fff1bf]">Minerals:</strong> {circle.minerals}
              </p>
              <p>
                <strong className="text-[#fff1bf]">Enemies:</strong> {circle.enemies}
              </p>
              <p>
                <strong className="text-[#fff1bf]">Boss:</strong> {circle.boss}
              </p>
              <p>
                <strong className="text-[#fff1bf]">Reward path:</strong> {circle.reward}
              </p>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>

      <PublisherSection
        title="Player Guide Summary"
        intro="These are the core systems players should understand before entering the game."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Mining and depth">
            <p>
              The HUD tracks Survey X and Depth. X marks the horizontal survey coordinate while
              Depth marks how far the player has descended. Deeper strata introduce stronger ores
              and more dangerous encounters.
            </p>
          </InfoCard>
          <InfoCard title="Crafting route">
            <p>
              Early Lust ores build Crimson gear. Gluttony ores build Void gear. Greed ores build
              Crown gear. The best route is to craft the local drill first, then add defensive
              pieces when monsters begin to threaten the run.
            </p>
          </InfoCard>
          <InfoCard title="Boss progression">
            <p>
              Bosses appear near the lower section of their circle. Defeating a boss records circle
              progress, grants essence and relic rewards, and prepares the player for the next
              defense breakpoint.
            </p>
          </InfoCard>
          <InfoCard title="Saving">
            <p>
              The game autosaves browser-local progress. Inventory, equipment ownership, boss
              encounters, waypoints, and effect stacks are restored on the same browser profile.
            </p>
          </InfoCard>
        </div>
      </PublisherSection>

      <PublisherSection title="Frequently Asked Questions">
        <div className="grid gap-5 md:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <InfoCard key={item.question} title={item.question}>
              <p>{item.answer}</p>
            </InfoCard>
          ))}
        </div>
      </PublisherSection>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="pixel-panel p-8 text-center">
          <h2 className="text-3xl font-black text-[#fff1bf]">Start digging now</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#d0b886]">
            The first playable arc is already available in the browser. Read the guide if you want
            the systems first, or jump straight into the mine.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/play" className="pixel-button pixel-button-active px-5 py-3 font-black">
              Play Now
            </Link>
            <Link href="/changelog" className="pixel-button px-5 py-3 font-black">
              View Updates
            </Link>
          </div>
        </div>
      </section>
    </PublisherLayout>
  );
}
