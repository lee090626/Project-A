import React from 'react';

export type InventoryTab = 'ingredients' | 'equipment' | 'skillrunes' | 'effects';

interface InventoryTabsProps {
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
}

const InventoryTabs = ({ activeTab, onTabChange }: InventoryTabsProps) => {
  return (
    <div className="flex bg-zinc-950 p-1 rounded-xl md:rounded-2xl border border-zinc-800 w-full sm:w-auto scrollbar-none overflow-x-auto">
      <button
        onClick={() => onTabChange('ingredients')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${
          activeTab === 'ingredients'
            ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Items
      </button>
      <button
        onClick={() => onTabChange('effects')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${
          activeTab === 'effects'
            ? 'bg-zinc-800 text-orange-400 shadow-lg border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Effects
      </button>
      <button
        onClick={() => onTabChange('equipment')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${
          activeTab === 'equipment'
            ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Equipment
      </button>
      <button
        onClick={() => onTabChange('skillrunes')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest transition-all focus:outline-none ${
          activeTab === 'skillrunes'
            ? 'bg-zinc-800 text-cyan-400 shadow-lg border border-zinc-700'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Runes
      </button>
    </div>
  );
};

export default React.memo(InventoryTabs);
