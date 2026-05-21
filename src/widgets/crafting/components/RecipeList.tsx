import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import AtlasIcon from '@/shared/ui/AtlasIcon';
import { CraftType } from '../useCrafting';

interface RecipeListProps {
  visibleRecipes: any[];
  selectedRecipeId: string | null;
  onSelectRecipe: (rcp: any) => void;
  canCraft: (rcp: any) => boolean;
  stats: PlayerStats;
  craftType: CraftType;
}

const RecipeList = ({
  visibleRecipes,
  selectedRecipeId,
  onSelectRecipe,
  canCraft,
  stats,
  craftType,
}: RecipeListProps) => {
  return (
    <div className="overflow-y-auto px-2 custom-scrollbar flex-1 pb-12 min-h-0">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleRecipes.map((rcp) => {
          const active = selectedRecipeId === rcp.id;
          const craftable = canCraft(rcp);
          const owned = craftType === 'Equipment'
            ? stats.ownedEquipmentIds?.includes(rcp.id)
            : false;

          return (
            <button
              key={rcp.id}
              onClick={() => onSelectRecipe(rcp)}
              className={`pixel-card relative p-5 transition-colors flex items-center gap-6 text-left group overflow-hidden focus:outline-none ${
                active
                  ? 'pixel-card-active border-[#d8a84f]!'
                  : 'pixel-card-muted hover:border-[#d8a84f]/60'
              }`}
            >
              <div className="pixel-icon-box w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl group-hover:border-[#d8a84f]/60 transition-colors shrink-0 overflow-hidden">
                {rcp.image ? (
                  <AtlasIcon name={rcp.image} size={64} className={owned ? 'opacity-45' : ''} />
                ) : (
                  <span className={owned ? 'opacity-45' : ''}>{rcp.icon}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg md:text-xl font-black truncate ${active ? 'text-[#fff1bf]' : 'text-[#f4dfb8]'}`}>
                    {rcp.name}
                  </span>
                  {owned && (
                    <span className="pixel-badge px-2 py-0.5 text-emerald-400 text-[8px] font-black">Owned</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <div className="pixel-bar h-2 w-20">
                      <div className={`pixel-bar-fill h-full bg-[#d8a84f] ${craftable ? 'opacity-100' : 'opacity-20'}`} style={{ width: craftable ? '100%' : '30%' }} />
                   </div>
                </div>
              </div>

              {active && <div className="absolute right-0 top-0 h-full w-2 bg-[#d8a84f]/80" />}
            </button>
          );
        })}

        {visibleRecipes.length === 0 && (
          <div className="pixel-empty col-span-full py-20 text-center opacity-50">
            <p className="text-sm font-black">No Items Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RecipeList);
