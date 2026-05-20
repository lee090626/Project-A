import React from 'react';

export type EncyclopediaTab = 'minerals' | 'bosses';

interface EncyclopediaTabsProps {
  activeTab: EncyclopediaTab;
  onTabChange: (tab: EncyclopediaTab) => void;
}

const EncyclopediaTabs = ({ activeTab, onTabChange }: EncyclopediaTabsProps) => {
  return (
    <div className="pixel-badge pixel-font flex p-1 w-full sm:w-auto">
      <button
        onClick={() => onTabChange('minerals')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
          activeTab === 'minerals'
            ? 'pixel-button-active text-purple-300'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Minerals
      </button>
      <button
        onClick={() => onTabChange('bosses')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
          activeTab === 'bosses'
            ? 'pixel-button-active text-purple-300'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Bosses
      </button>
    </div>
  );
};

export default React.memo(EncyclopediaTabs);
