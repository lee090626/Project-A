import React from 'react';
import { MINERALS } from '@/shared/config/mineralData';
import { getNextLevelExp, getMasteryMultiplier } from '@/shared/lib/masteryUtils';
import { MASTERY_PERKS } from '@/shared/config/masteryPerks';
import AtlasIcon from '@/shared/ui/AtlasIcon';
import { AtlasIconName } from '@/shared/config/atlasMap';
import type { MasteryPerkEffect } from '@/shared/config/mastery/types';

interface TileMasteryCardProps {
  tileKey: string;
  mastery: { level: number; exp: number };
  hoveredTooltipId?: string;
  onHoverPerk: (e: React.MouseEvent, perkId: string, name: string, desc: string) => void;
  onLeavePerk: () => void;
}

const MASTERY_EFFECT_LABELS: Record<MasteryPerkEffect['type'], string> = {
  moveSpeed: 'move speed',
  miningPower: 'mining power',
  miningSpeed: 'mining speed',
  hpRegen: 'HP regeneration',
  maxHp: 'max HP',
  luck: 'luck',
  masteryExp: 'mastery EXP gain',
  critRate: 'critical rate',
  critDmg: 'critical damage',
};

function formatMasteryPerkDescription(effects: MasteryPerkEffect[]) {
  return effects.map(formatMasteryPerkEffect).join(', ');
}

function formatMasteryPerkEffect(effect: MasteryPerkEffect) {
  const label = MASTERY_EFFECT_LABELS[effect.type];
  const isPercentValue = effect.isMultiplier || effect.type === 'critRate' || effect.type === 'critDmg';

  if (isPercentValue) {
    return `${label} +${Math.round(effect.value * 100)}%`;
  }

  return `${label} +${effect.value}`;
}

export function TileMasteryCard({
  tileKey,
  mastery,
  hoveredTooltipId,
  onHoverPerk,
  onLeavePerk,
}: TileMasteryCardProps) {
  const mineral = MINERALS.find((m) => m.key === tileKey);
  const nextExp = getNextLevelExp(mastery.level);
  const expPercent = Math.min(100, (mastery.exp / nextExp) * 100);
  const masteryMult = getMasteryMultiplier(mastery.level);

  return (
    <div className="pixel-card pixel-card-muted p-6 hover:border-emerald-500/40 transition-colors group">
      <div className="flex items-center gap-5 mb-5">
        <div className="pixel-icon-box w-16 h-16 flex items-center justify-center">
          {mineral?.image ? (
            <AtlasIcon name={mineral.image as AtlasIconName} size={48} />
          ) : (
            <span className="text-2xl">{mineral?.icon || '❓'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end gap-2 mb-2">
            <span className="text-[12px] font-black text-[#f4dfb8] tracking-tighter leading-none">
              {mineral?.name || tileKey}
            </span>
            <span className="text-[10px] font-black text-emerald-500 shrink-0 ml-auto">
              LV.{mastery.level}
            </span>
          </div>
          <div className="pixel-bar h-2">
            <div
              className="pixel-bar-fill h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t-2 pixel-divider">
        <div className="flex justify-between items-center text-[9px] font-black">
          <span className="text-[#a89065]">Damage Buff</span>
          <span className="text-emerald-400 text-xs">+{((masteryMult - 1) * 100).toFixed(0)}%</span>
        </div>

        {/* BREAKTHROUGH BADGES */}
        <div className="flex justify-between items-center gap-1.5 mt-1">
          {[50, 100, 150, 200].map((level) => {
            const isUnlocked = mastery.level >= level;
            const perkId = `perk_${tileKey}_${level}`;
            const perk = MASTERY_PERKS.find((p) => p.id === perkId);

            return (
              <div
                key={level}
                className={`
                  pixel-button flex-1 flex items-center justify-center h-8 text-[10px] font-black transition-colors cursor-help
                  ${
                    isUnlocked
                      ? 'text-emerald-400 border-emerald-500/50!'
                      : 'text-[#7d6648]'
                  }
                  ${hoveredTooltipId === perkId ? 'border-emerald-400! bg-emerald-500/20!' : ''}
                `}
                onMouseEnter={(e) => {
                  if (perk) {
                    onHoverPerk(
                      e,
                      perkId,
                      `Level ${level} Mastery Breakthrough`,
                      formatMasteryPerkDescription(perk.effects),
                    );
                  }
                }}
                onMouseLeave={onLeavePerk}
              >
                {level}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[8px] font-bold tabular-nums">
          <span className="text-[#7d6648]">Experience</span>
          <span className="text-[#d0b886]">
            {mastery.exp} <span className="text-[#5c4933]">/</span> {nextExp}
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TileMasteryCard);
