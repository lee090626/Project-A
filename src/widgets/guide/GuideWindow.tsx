import React, { useState } from 'react';
import { WindowFrame } from '@/shared/ui/window';

interface GuideWindowProps {
  onClose: () => void;
}

const TABS = [
  { id: 'basics', label: '🕹️ Basics', icon: '⌨️' },
  { id: 'systems', label: '⚙️ Systems', icon: '🛠️' },
  { id: 'minerals', label: '💎 Minerals', icon: '⛏️' },
];

const GuideWindow: React.FC<GuideWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('basics');

  const renderContent = () => {
    switch (activeTab) {
      case 'basics':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section>
              <h4 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <span className="pixel-icon-box flex h-10 w-10 items-center justify-center text-blue-400 text-xl">🕹️</span>
                Movement & Control
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="pixel-card pixel-card-muted p-6 flex items-center gap-6 group hover:border-blue-400/50 transition-colors">
                  <div className="pixel-icon-box w-16 h-16 flex items-center justify-center text-2xl">
                    ⌨️
                  </div>
                  <div>
                    <p className="text-[#d0b886] text-sm font-bold mb-1">
                      Move / Mine / Attack
                    </p>
                    <p className="text-white text-lg font-black">WASD / Arrow Keys / ZQSD</p>
                  </div>
                </div>
                <div className="pixel-card pixel-card-muted p-6 flex items-center gap-6 group hover:border-blue-400/50 transition-colors">
                  <div className="pixel-icon-box w-16 h-16 flex items-center justify-center text-2xl">
                    🖱️
                  </div>
                  <div>
                    <p className="text-[#d0b886] text-sm font-bold mb-1">Interact</p>
                    <p className="text-white text-lg font-black">Press Space near objects</p>
                  </div>
                </div>
                <div className="pixel-card pixel-card-muted p-6 flex items-center gap-6 group hover:border-blue-400/50 transition-colors col-span-full">
                  <div className="pixel-icon-box w-16 h-16 flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <div>
                    <p className="text-[#d0b886] text-sm font-bold mb-1">Mobile</p>
                    <p className="text-white text-lg font-black">
                      Joystick mines and attacks, Action interacts
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="pixel-card p-6 border-blue-500/40!">
              <p className="text-blue-400 text-sm font-black mb-3">
                💡 Core Objective
              </p>
              <p className="text-[#f4dfb8] leading-relaxed text-lg">
                Dig deep into the planet <span className="text-white font-bold">Terra</span>,
                collect rare minerals, and survive the dangers of the deep. The deeper you go, the
                more valuable the rewards—but the harder the soil becomes.
              </p>
            </section>
          </div>
        );
      case 'systems':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section>
              <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="pixel-icon-box flex h-10 w-10 items-center justify-center text-amber-400 text-xl">⚙️</span>
                Gameplay Mechanics
              </h4>
              <div className="space-y-4">
                <div className="pixel-card pixel-card-muted flex gap-6 items-start p-6 hover:border-amber-500/50 transition-colors">
                  <div className="text-4xl">🏭</div>
                  <div className="flex-1">
                    <h5 className="text-white font-black text-xl mb-2">Refinery (The Forge)</h5>
                    <p className="text-[#d0b886] text-base leading-relaxed font-medium">
                      Ores collected from the mines must be smelted into{' '}
                      <span className="text-amber-400 font-bold">Ingots</span> at the Refinery.
                      High-tier equipment upgrades often require these refined materials.
                    </p>
                  </div>
                </div>

                <div className="pixel-card pixel-card-muted flex gap-6 items-start p-6 hover:border-blue-500/50 transition-colors">
                  <div className="text-4xl">🛠️</div>
                  <div className="flex-1">
                    <h5 className="text-white font-black text-xl mb-2">Blacksmith (Upgrades)</h5>
                    <p className="text-[#d0b886] text-base leading-relaxed font-medium">
                      Exchange your gold and materials to improve your drill's{' '}
                      <span className="text-cyan-400 font-bold">Power</span> and{' '}
                      <span className="text-cyan-400 font-bold">Speed</span>. Better gear allows for
                      faster deeper exploration.
                    </p>
                  </div>
                </div>

              </div>
            </section>
          </div>
        );
      case 'minerals':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section>
              <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="pixel-icon-box flex h-10 w-10 items-center justify-center text-emerald-400 text-xl">
                  ⛏️
                </span>
                Geology of Planet Terra
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Coal', depth: '20m+', color: 'text-[#d0b886]' },
                  { name: 'Iron', depth: '100m+', color: 'text-[#a89065]' },
                  { name: 'Gold', depth: '300m+', color: 'text-amber-400' },
                  { name: 'Diamond', depth: '450m+', color: 'text-cyan-400' },
                  { name: 'Emerald', depth: '650m+', color: 'text-emerald-400' },
                  { name: 'Ruby', depth: '850m+', color: 'text-[#b84a3c]' },
                  { name: 'Sapphire', depth: '1050m+', color: 'text-blue-400' },
                  { name: 'Uranium', depth: '1200m+', color: 'text-lime-400' },
                ].map((min) => (
                  <div
                    key={min.name}
                    className="pixel-card pixel-card-muted p-5 group hover:border-[#d8a84f] transition-colors"
                  >
                    <div className="text-[10px] font-black text-[#7d6648] mb-1">
                      Mineral
                    </div>
                    <div className={`text-xl font-black ${min.color} mb-1`}>{min.name}</div>
                    <div className="text-[10px] font-bold text-[#a89065] tracking-tighter">
                      Found at {min.depth}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pixel-card p-6 border-emerald-500/40!">
              <p className="text-emerald-400 text-sm font-black mb-3">
                💡 Explorer's Tip
              </p>
              <p className="text-[#f4dfb8] leading-relaxed text-lg">
                Notice the soil color changing as you go deeper. Harder rocks like{' '}
                <span className="text-red-400 font-bold">Obsidian</span> can only be found near the
                core!
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <WindowFrame className="max-w-6xl max-h-[85vh] pointer-events-auto animate-in fade-in duration-300 p-0 md:p-0">
      <div className="w-full h-full overflow-hidden flex flex-col md:flex-row relative">
        {/* LEFT NAV (SIDEBAR) */}
        <div className="pixel-panel-muted w-full md:w-[280px] border-b-2 md:border-b-0 md:border-r-2 pixel-divider p-6 flex flex-col gap-2 shrink-0">
          <div className="mb-10 px-4">
            <h2 className="text-sm font-black text-[#7d6648] mb-1">
              Navigation
            </h2>
            <h3 className="text-3xl font-black text-white">Guide Book</h3>
          </div>

          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible custom-scrollbar pb-2 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pixel-button flex items-center gap-4 px-6 py-5 transition-colors font-black text-sm whitespace-nowrap md:whitespace-normal group ${
                  activeTab === tab.id
                    ? 'pixel-button-active text-[#f8e3a5]'
                    : 'text-[#a89065] hover:text-[#fff1bf]'
                }`}
              >
                <span
                  className="text-xl"
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pixel-card pixel-card-muted mt-auto hidden md:block px-6 py-8">
            <p className="text-[10px] font-black text-[#7d6648] mb-2">
              Current Version
            </p>
            <p className="text-white font-mono text-xs opacity-50">ALPHA 0.8.2.4</p>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-8 md:p-14 lg:p-20 custom-scrollbar">
            {renderContent()}
          </div>

          <div className="p-8 md:p-10 border-t-2 pixel-divider flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
              <span className="text-[#7d6648] font-bold text-[10px]">
                System Operational
              </span>
            </div>
            <button
              onClick={onClose}
              className="pixel-button pixel-button-success px-10 py-5 text-base font-black active:translate-y-px transition-colors focus:outline-none"
            >
              Close [Esc]
            </button>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
};

export default GuideWindow;
