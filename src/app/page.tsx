import Link from 'next/link';
import { GamePlayShell } from './_components/GamePlayShell';
import { AtlasSprite } from '@/shared/ui/AtlasSprite';
import type { AtlasIconName } from '@/shared/config/atlasMap';

export const dynamic = 'force-static';

const HERO_TILES = ['StoneTile', 'GoldStoneTile', 'LustStoneTile', 'MidasiteTile'] as const;

const FEATURE_CARDS = [
  {
    title: 'Progression & Crafting System',
    icon: 'CrimsonFangDrill',
    body: 'Slay powerful bosses in the nine circles of Hell to earn unique, stackable effects. These effect items provide permanent bonuses to mining speed, power, and critical hit rates as you descend further into the depths.',
  },
  {
    title: 'Equipment Upgrades',
    icon: 'CrimsonVeilHelmet',
    body: 'Refine gathered materials into ingots and visit the Forgemaster to craft drills, helmets, armors, and boots. Each equipment piece shapes your build for efficient mining or tough boss battles.',
  },
  {
    title: 'Giant Dimensional Bosses',
    icon: 'Asmodeus',
    body: 'Ancient bosses govern dimensions deep underground with destructive patterns that demand precise movement. Defeating them marks the path deeper and unlocks the next stage of progression.',
  },
] as const satisfies readonly {
  title: string;
  icon: AtlasIconName;
  body: string;
}[];

const MINERAL_GLOSSARY = [
  {
    name: 'Stone',
    icon: 'StoneTile',
    desc: 'A basic resource near the surface and the first material for early upgrades.',
    depth: '0m ~ 100m',
  },
  {
    name: 'Crimson Stone',
    icon: 'CrimsonStoneIcon',
    desc: 'A dense red mineral used in early circle equipment and refinery routes.',
    depth: '150m ~ 400m',
  },
  {
    name: 'Gold Stone',
    icon: 'GoldStoneIcon',
    desc: 'A valuable mineral needed for advanced crafting and steady equipment growth.',
    depth: '400m ~ 800m',
  },
  {
    name: 'Lust Stone',
    icon: 'LustStoneIcon',
    desc: 'A circle resource tied to boss progression and permanent effect stacks.',
    depth: '800m ~ 1200m',
  },
  {
    name: 'Fervor Stone',
    icon: 'FervorStoneIcon',
    desc: 'A hot mineral that supports high-tier weapons and deeper expedition builds.',
    depth: '1000m+',
  },
  {
    name: 'Midasite',
    icon: 'MidasiteIcon',
    desc: 'A rare late-game resource for specialized upgrades and high-value crafting.',
    depth: '650m+',
  },
] as const satisfies readonly {
  name: string;
  icon: AtlasIconName;
  desc: string;
  depth: string;
}[];

const FAQ_ITEMS = [
  {
    question: 'Do I lose my collected items when I die?',
    answer:
      'No. Drilling RPG preserves your minerals and gold when you respawn at the surface base camp, so progress is tied to exploration and upgrades instead of item loss.',
  },
  {
    question: 'How do I save the game?',
    answer:
      "The game automatically saves your state every 10 seconds with browser local storage. You can also transfer data later with the settings screen's Export/Import Save Code feature.",
  },
  {
    question: 'How do I attack enemy monsters?',
    answer:
      'Use the target action or push movement toward a monster to enter auto-attack behavior. Damage depends on the monster armor and your current attack power.',
  },
] as const;

export default function LandingPage() {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'crazygames') {
    return <GamePlayShell />;
  }

  return (
    <div className="min-h-screen bg-[#090a08] text-[#f4dfb8] selection:bg-[#2c8f87] selection:text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden pixel-font">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="pixel-hero-grid absolute inset-0 opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#191c18_0_24px,#3c453c_24px_26px,#050604_26px_28px,transparent_28px)] bg-[length:48px_48px] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,19,15,0.1)_0%,rgba(5,6,4,0.28)_52%,#090a08_100%)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-7">
          <div className="flex items-end justify-center gap-4">
            <AtlasSprite name="Player" size={72} className="hidden sm:inline-flex" />
            <h1 className="text-5xl md:text-7xl font-black text-[#38d5e8] drop-shadow-[4px_4px_0_#050302]">
              Drilling RPG
            </h1>
            <AtlasSprite name="GoldStoneIcon" size={64} className="hidden sm:inline-flex" />
          </div>
          <p className="max-w-2xl text-lg md:text-xl text-[#d0b886] leading-relaxed font-bold">
            A top-down pixel mining RPG where every meter below the base camp brings harder ore,
            stranger monsters, and better gear.
          </p>

          <div className="flex items-center justify-center gap-3 py-2">
            {HERO_TILES.map((name) => (
              <div key={name} className="pixel-slot flex h-14 w-14 items-center justify-center">
                <AtlasSprite name={name} size={42} />
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <Link
              href="/play"
              className="pixel-button group relative inline-flex items-center justify-center px-9 py-4 text-lg font-black text-[#f8e3a5] transition-colors hover:text-[#fff1bf] focus:outline-none focus:ring-2 focus:ring-[#d4a35f]/70"
            >
              Play for Free Now
              <svg
                className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </Link>
            <p className="text-[#d0b886] text-sm mt-1 font-bold">
              Plays right in your browser. No installation required.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 text-[#d0b886]">
          <p className="text-sm mb-2 opacity-70 font-semibold text-center">Scroll Down</p>
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </div>
      </section>

      {/* Content Section */}
      <article className="relative z-10 max-w-5xl mx-auto px-6 py-24 space-y-28">
        {/* Section 1: Story */}
        <section className="pixel-panel p-7 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#f4dfb8] bg-clip-text">
            Exploration of the Deep Dark Underground
          </h2>
          <div className="space-y-4 text-[#d0b886] text-lg leading-relaxed font-bold">
            <p>
              Drilling RPG is a survival mining action game set in an underground world of unknown
              depths. Starting with just a small pickaxe and a rusty drill, you will dig up valuable
              minerals such as diamonds, emeralds, and uranium to accumulate wealth and honor. But
              the underground world is not just full of beautiful minerals. In the abyss where light
              cannot reach, ancient monsters and terrifying bosses are hunting for miners.
            </p>
            <p>
              Discover dungeons and caves that have been asleep for ages, and travel through ever
              more dangerous strata to uncover lost technologies and magic. The deeper you dig into
              the underground world, the greater the danger, but immense rewards await you. Become
              the ultimate miner and warrior in this mesmerizing RPG universe.
            </p>
          </div>
        </section>

        {/* Section 2: Features */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#f4dfb8] mb-4">Core Game Systems</h2>
            <p className="text-[#d0b886] text-lg font-bold">
              Discover the systems that will help you survive and grow stronger underground.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURE_CARDS.map((feature) => (
              <div key={feature.title} className="pixel-card p-7 transition-colors">
                <div className="pixel-icon-box w-16 h-16 flex items-center justify-center mb-6">
                  <AtlasSprite name={feature.icon} size={52} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#f4dfb8]">{feature.title}</h3>
                <p className="text-[#d0b886] leading-relaxed font-bold">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Mineral Glossary */}
        <section className="pixel-panel pixel-panel-muted p-7 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#f4dfb8] mb-4">Mineral Glossary</h2>
            <p className="text-[#d0b886] text-lg font-bold">Key resources found deep underground.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MINERAL_GLOSSARY.map((min) => (
              <div
                key={min.name}
                className="pixel-card pixel-card-muted p-6 flex flex-col items-center text-center transition-colors"
              >
                <div className="pixel-icon-box w-16 h-16 mb-4 flex items-center justify-center">
                  <AtlasSprite name={min.icon} size={48} />
                </div>
                <h4 className="text-xl font-bold text-[#f4dfb8] mb-2">{min.name}</h4>
                <div className="pixel-badge text-xs font-mono text-cyan-400 mb-3 px-2 py-1">
                  Depth: {min.depth}
                </div>
                <p className="text-sm text-[#d0b886] leading-relaxed font-bold">{min.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section className="pixel-panel p-7 md:p-12">
          <h2 className="text-3xl font-bold mb-10 text-center text-[#f4dfb8]">
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="pixel-card pixel-card-muted p-6">
                <h4 className="text-lg font-bold text-[#f4dfb8] mb-3 flex items-center gap-2">
                  <span className="pixel-badge text-cyan-400 px-2 py-0.5">Q</span>
                  {item.question}
                </h4>
                <p className="text-[#d0b886] leading-relaxed font-bold">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* Footer / Final CTA */}
      <footer className="border-t-2 pixel-divider mt-20 bg-[#11130f] pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#fff1bf] mb-8">Are you ready?</h2>
          <p className="text-xl text-[#d0b886] mb-10 max-w-2xl mx-auto font-bold">
            Your first pickaxe strike awakens the secrets of the giant abyss. Dive into the
            underground world right now.
          </p>
          <Link
            href="/play"
            className="pixel-button pixel-button-active inline-flex items-center justify-center px-10 py-5 text-xl font-bold transition-colors"
          >
            Start Adventure
          </Link>

          <div className="mt-20 text-[#d0b886] text-sm">
            <p>© {new Date().getFullYear()} Drilling RPG. All rights reserved.</p>
            <p className="mt-2">
              This website and game were designed as a cozy, free-to-play top-down RPG for players
              everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
