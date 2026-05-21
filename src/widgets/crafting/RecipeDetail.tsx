import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { EFFECT_DATA } from '@/shared/config/effectData';
import { isEquipmentPart } from '@/shared/lib/equipmentParts';
import { formatNumber } from '@/shared/lib/numberUtils';
import AtlasIcon from '@/shared/ui/AtlasIcon';

interface RecipeDetailProps {
  selectedRecipe: any;
  stats: PlayerStats;
  canCraft: (rcp: any) => boolean;
  onCraft: (requirements: any, result: any) => void;
}

export function RecipeDetail({ selectedRecipe, stats, canCraft, onCraft }: RecipeDetailProps) {
  const isPossessionEffectItem = !!selectedRecipe?.result?.effectId;

  const getStatName = (stat: string) => {
    const map: Record<string, string> = {
      power: 'Power',
      maxHp: 'Max HP',
      moveSpeed: 'Move Speed',
      luck: 'Luck',
      critRate: 'Crit Rate',
      critDamage: 'Crit DMG',
      defense: 'Defense',
      miningSpeed: 'Mine Speed',
      masteryExp: 'Mastery Gain',
      masteryExpFlat: 'Mastery Gain'
    };
    return map[stat] || stat;
  };
  if (!selectedRecipe) {
    return (
      <div className="pixel-card pixel-card-muted p-12 h-full flex flex-col items-center justify-center text-center">
        <div className="pixel-icon-box w-24 h-24 flex items-center justify-center mb-8 text-[#d8a84f]/35">
          <span className="text-5xl font-black">?</span>
        </div>
        <h4 className="text-xl font-black text-[#d0b886]/60 mb-2">
          Awaiting Selection
        </h4>
        <p className="text-[10px] text-[#7d6648] font-bold max-w-[200px]">
          Select an item to begin the manufacturing process.
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-card p-6 md:p-8 h-full flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-[#d8a84f]/5 pointer-events-none" />

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex flex-col relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="pixel-icon-box w-28 h-28 md:w-40 md:h-40 flex items-center justify-center p-4 relative group/preview mb-6">
            <div className="absolute inset-0 bg-[#2c8f87]/15 opacity-30 group-hover/preview:opacity-60 transition-opacity" />
            {selectedRecipe.image ? (
              <AtlasIcon name={selectedRecipe.image} size={128} />
            ) : (
              <span className="text-6xl relative z-10">{selectedRecipe.icon}</span>
            )}
          </div>
          <h3 className="text-3xl font-black text-[#f4dfb8] mb-2 leading-tight">
            {selectedRecipe.name}
          </h3>
        </div>

        {/* 능력치 카드 프레임 */}
        <div className="w-full space-y-4 mb-8">
          <div className="pixel-card pixel-card-muted px-6 py-6 flex items-center justify-around group/stat hover:border-[#d8a84f]/60 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-[#d8a84f]/5 opacity-0 group-hover/stat:opacity-100 transition-opacity pointer-events-none" />

            {isPossessionEffectItem ? (
              <div className="flex flex-col items-center justify-center gap-2 w-full text-center py-2 px-4">
                <span className="text-lg md:text-xl font-black text-[#d8a84f] leading-tight drop-shadow-md">
                  {selectedRecipe.bonus ? (() => {
                    const percentStats = ['critRate', 'critDamage', 'miningSpeed', 'masteryExp'];
                    const value = percentStats.includes(selectedRecipe.bonus.stat)
                      ? `${(selectedRecipe.bonus.value * 100).toFixed(1)}%`
                      : selectedRecipe.bonus.value;
                    return `+${value} ${getStatName(selectedRecipe.bonus.stat)}`;
                  })() : ''}
                  {selectedRecipe.effectDescription && (
                    <>
                      {selectedRecipe.bonus && <br />}
                      <span className="text-[#4f9b5f] text-base md:text-lg">{selectedRecipe.effectDescription}</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-[#a89065] font-black mt-1">
                  Passive Effect
                </span>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center gap-4 w-full px-2">
                {Object.entries(selectedRecipe.stats || {}).map(([stat, val], i, arr) => (
                  <React.Fragment key={stat}>
                    <div className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl md:text-2xl font-black text-[#f4dfb8] tabular-nums leading-none">
                          {val as number}
                        </span>
                      </div>
                      <span className="text-[9px] md:text-[10px] text-[#a89065] font-black truncate w-full text-center">
                        {getStatName(stat)}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-0.5 h-10 bg-[#3c453c] shrink-0" />
                    )}
                  </React.Fragment>
                ))}
                {(!selectedRecipe.stats || Object.keys(selectedRecipe.stats).length === 0) && (
                  <span className="text-sm font-bold text-[#a89065]">No Stats</span>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="w-full space-y-4 pt-6 border-t-2 pixel-divider">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-black text-[#d8a84f]">
              Requirements
            </span>
            <span className="text-[14px] text-[#7d6648] font-bold">
              Materials needed
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(selectedRecipe.requirements).map(([key, val]) => {
              const currentVal =
                (stats as any)[key] !== undefined
                  ? (stats as any)[key]
                  : (stats.inventory as any)[key] || 0;
              const met = currentVal >= (val as number);
              
              // 재료의 메타데이터 탐색 (광물 또는 Effect)
              const mineral = MINERALS.find((m) => m.key === key);
              const effect = EFFECT_DATA[key];
              
              const progress = Math.min(100, (currentVal / (val as number)) * 100);

              const itemImage = mineral?.image || effect?.image;
              const itemIcon = mineral?.icon || effect?.icon;
              const itemName = mineral?.name || effect?.name || key;

              return (
                <div key={key} className="group/req">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="pixel-icon-box w-9 h-9 flex items-center justify-center p-1.5">
                        {key === 'goldCoins' ? (
                          <AtlasIcon name="GoldIcon" size={20} />
                        ) : itemImage ? (
                          <AtlasIcon name={itemImage} size={24} />
                        ) : (
                          <span className="text-sm">{itemIcon || '📦'}</span>
                        )}
                      </div>
                      <span className="text-[#f4dfb8] font-black text-sm capitalize group-hover/req:text-[#d8a84f] transition-colors">
                        {key === 'goldCoins' ? 'Gold' : itemName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-xs tabular-nums ${met ? 'text-[#4f9b5f]' : 'text-[#b84a3c]'}`}
                      >
                        {formatNumber(currentVal)}
                      </span>
                      <span className="text-[#5c4933] text-[10px] font-bold">/</span>
                      <span className="text-[#a89065] text-xs font-black tabular-nums">
                        {formatNumber(val as number)}
                      </span>
                    </div>
                  </div>
                  <div className="pixel-bar h-2 w-full">
                    <div
                      className={`pixel-bar-fill h-full transition-all duration-1000 ${met ? 'bg-[#4f9b5f]' : 'bg-[#b84a3c]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-auto relative z-10">
        <button
          disabled={!canCraft(selectedRecipe)}
          onClick={() => onCraft(selectedRecipe.requirements, selectedRecipe.result)}
          className={`pixel-button w-full py-5 text-sm md:text-base font-black transition-colors active:translate-y-px focus:outline-none focus:ring-4 focus:ring-[#d8a84f]/35 ${
            canCraft(selectedRecipe)
              ? 'pixel-button-action'
              : 'text-[#7d6648] cursor-not-allowed opacity-60'
          }`}
        >
          {(isEquipmentPart(selectedRecipe.type) &&
            stats.ownedEquipmentIds?.includes(selectedRecipe.id))
            ? 'Already Owned'
            : 'System Craft'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(RecipeDetail);
