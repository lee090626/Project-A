import React from 'react';
import { MineralDefinition } from '@/shared/config/mineralData';
import AtlasIcon from '@/shared/ui/AtlasIcon';

interface TabIngredientsProps {
  ownedMinerals: MineralDefinition[];
  inventory: Record<string, number>;
}

const TabIngredients = ({ ownedMinerals, inventory }: TabIngredientsProps) => {
  return (
    <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 md:gap-4 pb-10">
        {ownedMinerals.map((m) => {
          const count = inventory[m.key] || 0;

          return (
            <div
              key={m.key}
              className="pixel-card pixel-card-muted relative aspect-square transition-colors flex flex-col items-center justify-center p-2 md:p-4 group overflow-hidden hover:border-[#d8a84f]"
            >
              <div className="w-14 h-14 md:w-18 md:h-18 mb-2 md:mb-4 flex items-center justify-center">
                {m.image ? (
                  <AtlasIcon name={m.image} size={64} />
                ) : (
                  <span className="text-3xl md:text-5xl">{m.icon}</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-[10px] md:text-sm font-bold tabular-nums text-[#d0b886]">
                  x{count.toLocaleString()}
                </div>
                <div className="text-[10px] md:text-xs text-[#7d6648] font-bold text-center truncate w-full px-1">
                  {m.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(TabIngredients);
