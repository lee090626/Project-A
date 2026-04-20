import React from 'react';

export type EncyclopediaTab = 'minerals' | 'bosses';

interface EncyclopediaTabsProps {
  activeTab: EncyclopediaTab;
  onTabChange: (tab: EncyclopediaTab) => void;
}

const EncyclopediaTabs = ({ activeTab, onTabChange }: EncyclopediaTabsProps) => {
  return (
    <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto">
      <button
        onClick={() => onTabChange('minerals')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
          activeTab === 'minerals'
            ? 'bg-zinc-800 text-purple-400 shadow-lg border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Minerals
      </button>
      <button
        onClick={() => onTabChange('bosses')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
          activeTab === 'bosses'
            ? 'bg-zinc-800 text-purple-400 shadow-lg border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Bosses
      </button>
    </div>
  );
};

export default React.memo(EncyclopediaTabs);
