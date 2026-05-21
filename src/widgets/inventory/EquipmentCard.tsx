import React from 'react';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { EQUIPMENT_PART_LABELS } from '@/shared/lib/equipmentParts';
import { Equipment, EquipmentPart, PlayerStats } from '@/shared/types/game';
import { AtlasIconName } from '@/shared/config/atlasMap';
import {
  EQUIPMENT_MAIN_STAT_BONUS_MAX,
  getEquipmentMainStat,
  getEquipmentQualityLabel,
  getEquipmentRerollCost,
  getMainStatBonusPct,
  getRefinedEquipmentStats,
} from '@/shared/lib/equipmentRefinement';
import AtlasIcon from '@/shared/ui/AtlasIcon';

interface EquipmentCardProps {
  equipmentId: string;
  isEquipped: boolean;
  stats: PlayerStats;
  onEquip?: (id: string, part: EquipmentPart) => void;
  onRerollEquipmentOption?: (equipmentId: string) => void;
}

/**
 * 인벤토리 장비 탭에서 개별 장비(드릴, 투구, 갑옷, 신발)를 표시하는 카드 컴포넌트입니다.
 */
function EquipmentCard({
  equipmentId,
  isEquipped,
  stats,
  onEquip,
  onRerollEquipmentOption,
}: EquipmentCardProps) {
  const equipment = EQUIPMENTS[equipmentId] as Equipment | undefined;
  if (!equipment) return null;

  const equipmentState = stats.equipmentStates?.[equipmentId];
  const mainStat = getEquipmentMainStat(equipment);
  const mainStatBonusPct = getMainStatBonusPct(equipmentState);
  const qualityLabel = getEquipmentQualityLabel(mainStatBonusPct);
  const rerollCost = getEquipmentRerollCost(equipment, mainStatBonusPct);
  const refinedStats = getRefinedEquipmentStats(equipment, equipmentState);
  const canReroll =
    Boolean(onRerollEquipmentOption) &&
    mainStatBonusPct < EQUIPMENT_MAIN_STAT_BONUS_MAX &&
    stats.goldCoins >= rerollCost;

  const statItems = getEquipmentStatItems(refinedStats, mainStat);

  return (
    <div
      className={`pixel-card p-4 md:p-6 transition-colors flex flex-col group relative overflow-hidden ${
        isEquipped
          ? 'pixel-card-active border-cyan-400!'
          : 'pixel-card-muted opacity-80 hover:opacity-100 hover:border-[#d8a84f]'
      }`}
    >
      <div className="flex items-center gap-4 md:gap-6 mb-6 text-left">
        <div className="pixel-icon-box w-20 h-20 md:w-28 md:h-28 flex items-center justify-center overflow-hidden">
          {equipment.image ? (
            <AtlasIcon name={equipment.image as AtlasIconName} size={80} />
          ) : (
            <span className="text-4xl md:text-6xl drop-shadow-lg">{equipment.icon}</span>
          )}
        </div>
        <div>
          <div
            className={`text-[10px] font-bold mb-1 ${isEquipped ? 'text-cyan-400' : 'text-[#a89065]'}`}
          >
            {isEquipped ? 'Currently Equipped' : 'Inventory'} • {EQUIPMENT_PART_LABELS[equipment.part]}
          </div>
          <h4 className="text-xl md:text-2xl font-black text-white">
            {equipment.name}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {statItems.map((stat) => (
          <StatBox
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            suffix={stat.suffix}
            isMainStat={stat.isMainStat}
          />
        ))}
      </div>

      <div className="pixel-card pixel-card-muted mb-4 p-3 md:p-4 border-amber-500/35!">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] md:text-[10px] font-black text-amber-500/70">
              Main Option
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm md:text-base font-black text-white">{qualityLabel}</span>
              <span className={mainStatBonusPct >= 0 ? 'text-emerald-400' : 'text-[#b84a3c]'}>
                {mainStatBonusPct >= 0 ? '+' : ''}
                {mainStatBonusPct}%
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] md:text-[10px] font-black text-[#a89065]">
              Cost
            </div>
            <div className="text-sm md:text-base font-black text-amber-400 tabular-nums">
              {rerollCost.toLocaleString()}G
            </div>
          </div>
        </div>
        <button
          onClick={() => onRerollEquipmentOption?.(equipmentId)}
          disabled={!canReroll}
          className={`pixel-button mt-3 w-full py-2.5 text-xs md:text-sm font-black transition-colors active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
            canReroll
              ? 'pixel-button-success'
              : 'text-[#7d6648] cursor-not-allowed'
          }`}
        >
          {mainStatBonusPct >= EQUIPMENT_MAIN_STAT_BONUS_MAX ? 'Perfect Option' : 'Reroll Option'}
        </button>
      </div>

      <div className="mt-auto pt-4 border-t-2 pixel-divider">
        {!isEquipped ? (
          <button
            onClick={() => onEquip?.(equipmentId, equipment.part)}
            className="pixel-button pixel-button-success w-full py-3 md:py-4 text-center font-black text-sm md:text-base active:translate-y-px transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            EQUIP ITEM
          </button>
        ) : (
          <div className="pixel-badge w-full py-3 md:py-4 text-cyan-400/70 text-center font-black text-xs md:text-sm">
            EQUIPPED
          </div>
        )}
      </div>
    </div>
  );
}

const getEquipmentStatItems = (stats: {
  power?: number;
  maxHp?: number;
  moveSpeed?: number;
  defense?: number;
}, mainStat: keyof Equipment['stats']) => {
  return [
    { key: 'power', label: 'Power', value: stats.power, color: 'text-[#b84a3c]' },
    { key: 'defense', label: 'Defense', value: stats.defense, color: 'text-blue-400' },
    { key: 'maxHp', label: 'Max HP', value: stats.maxHp, color: 'text-emerald-400' },
    { key: 'moveSpeed', label: 'Speed', value: stats.moveSpeed, color: 'text-amber-400', suffix: '%' },
  ].filter((stat): stat is {
    key: keyof Equipment['stats'];
    label: string;
    value: number;
    color: string;
    suffix?: string;
  } =>
    typeof stat.value === 'number' && stat.value !== 0,
  ).map((stat) => ({
    ...stat,
    isMainStat: stat.key === mainStat,
  }));
};

const StatBox = ({
  label,
  value,
  color,
  suffix = '',
  isMainStat,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
  isMainStat?: boolean;
}) => (
  <div
    className={`pixel-card p-2 md:p-3 flex flex-col items-center justify-center min-h-16 ${
      isMainStat ? 'border-amber-500/50!' : 'pixel-card-muted'
    }`}
  >
    <div className="text-[#a89065] font-bold mb-0.5 tracking-tighter truncate w-full text-center text-[10px]">
      {label}
    </div>
    <div className={`font-black tabular-nums transition-colors text-base md:text-lg ${color}`}>
      {value > 0 ? `+${value}${suffix}` : `${value}${suffix}`}
    </div>
  </div>
);

export default React.memo(EquipmentCard);
