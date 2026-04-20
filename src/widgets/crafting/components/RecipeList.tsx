import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
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
            : (rcp.type === 'unique' && stats.unlockedResearchIds?.includes(rcp.id));

          return (
            <button
              key={rcp.id}
              onClick={() => onSelectRecipe(rcp)}
              className={`relative p-5 rounded-4xl border transition-all flex items-center gap-6 text-left group overflow-hidden focus:outline-none ${
                active
                  ? 'bg-zinc-800 border-rose-500/50 shadow-lg ring-1 ring-rose-500/20'
                  : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-4xl shadow-inner group-hover:border-rose-500/30 transition-colors shrink-0 overflow-hidden">
                {rcp.image ? (
                  <AtlasIcon name={rcp.image} size={64} className={owned ? 'opacity-40 grayscale' : ''} />
                ) : (
                  <span className={owned ? 'opacity-40 grayscale' : ''}>{rcp.icon}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg md:text-xl font-black tracking-tighter truncate ${active ? 'text-white' : 'text-zinc-300'}`}>
                    {rcp.name}
                  </span>
                  {owned && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-black tracking-widest">Owned</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1 w-20 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full bg-rose-500 ${craftable ? 'opacity-100' : 'opacity-20'}`} style={{ width: craftable ? '100%' : '30%' }} />
                   </div>
                </div>
              </div>

              {active && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-3xl rounded-full" />}
            </button>
          );
        })}

        {visibleRecipes.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-20">
            <p className="text-sm font-black tracking-widest">No Items Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RecipeList);
