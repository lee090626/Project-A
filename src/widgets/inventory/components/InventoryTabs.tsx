import React from 'react';

export type InventoryTab = 'ingredients' | 'equipment' | 'effects';

interface InventoryTabsProps {
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
}

const InventoryTabs = ({ activeTab, onTabChange }: InventoryTabsProps) => {
  return (
    <div className="pixel-badge pixel-font flex p-1 w-full sm:w-auto scrollbar-none overflow-x-auto">
      <button
        onClick={() => onTabChange('ingredients')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-black transition-colors focus:outline-none ${
          activeTab === 'ingredients'
            ? 'pixel-button-active text-cyan-300'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Items
      </button>
      <button
        onClick={() => onTabChange('effects')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-black transition-colors focus:outline-none ${
          activeTab === 'effects'
            ? 'pixel-button-active text-orange-300'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Effects
      </button>
      <button
        onClick={() => onTabChange('equipment')}
        className={`flex-1 sm:flex-none px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-black transition-colors focus:outline-none ${
          activeTab === 'equipment'
            ? 'pixel-button-active text-cyan-300'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Equipment
      </button>
    </div>
  );
};

export default React.memo(InventoryTabs);
