import React from 'react';
import { PlayerStats, Equipment } from '@/shared/types/game';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { AtlasIconName } from '@/shared/config/atlasMap';
import { createInitialMasteryState } from '@/shared/lib/masteryUtils';

interface GearRuneSectionProps {
  equipped: {
    drill: Equipment | null;
    helmet: Equipment | null;
    armor: Equipment | null;
    boots: Equipment | null;
  };
  stats: PlayerStats;
  onUnequipRune?: (drillId: string, slotIndex: number) => void;
}

const GearRuneSection = ({ equipped, stats, onUnequipRune }: GearRuneSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
         Gear Loadout
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {(['drill', 'helmet', 'armor', 'boots'] as const).map((part) => {
          const item = equipped[part];
          return (
            <div key={part} className="bg-[#252526] p-4 rounded-2xl border border-zinc-800 flex flex-col items-center text-center shadow-xl group">
              <div className="w-14 h-14 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 mb-2 shadow-inner group-hover:border-emerald-500/30 transition-colors overflow-hidden">
                {item?.image ? (
                  <AtlasIcon name={item.image as AtlasIconName} size={48} />
                ) : (
                  <span className="text-3xl">{item?.icon || '🚫'}</span>
                )}
              </div>
              <div className="text-[8px] font-bold text-zinc-500 tracking-widest mb-1">{part}</div>
              <div className="text-[10px] font-black text-white truncate w-full">{item?.name || 'Barehanded'}</div>
            </div>
          );
        })}
      </div>

      {/* DRILL RUNE SLOTS */}
      <div className="bg-[#252526] p-6 rounded-2xl border border-zinc-800 shadow-2xl">
        <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
          Weapon Rune Slots
        </h4>
        <div className="flex flex-wrap gap-2">
          {equipped.drill ? (
            (() => {
              const drillState = stats.equipmentStates[equipped.drill.id] || createInitialMasteryState(equipped.drill.id, equipped.drill.maxSkillSlots);
              return Array.from({ length: equipped.drill.maxSkillSlots || 0 }).map((_, i) => {
                const slottedRuneId = (drillState.slottedRunes || [])[i];
                return (
                  <button
                    key={i}
                    disabled={!slottedRuneId}
                    onClick={() => slottedRuneId && onUnequipRune?.(equipped.drill!.id, i)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all focus:outline-none ${
                      slottedRuneId 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 hover:bg-rose-500/20 hover:border-rose-500/40 group/rune' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-700'
                    }`}
                  >
                    {slottedRuneId ? (
                      <div className="relative">
                        <span className="group-hover/rune:opacity-0 transition-opacity">⚙️</span>
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/rune:opacity-100 text-rose-500 font-bold text-[10px]">✕</span>
                      </div>
                    ) : '🔒'}
                  </button>
                );
              });
            })()
          ) : (
            <div className="text-[10px] font-bold text-zinc-600">Equip a drill to use runes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GearRuneSection);
