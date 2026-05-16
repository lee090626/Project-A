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
      className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all flex flex-col group relative overflow-hidden ${
        isEquipped
          ? 'bg-[#252526] border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
          : 'bg-[#252526] border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center gap-4 md:gap-6 mb-6 text-left">
        <div className="w-20 h-20 md:w-28 md:h-28 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 shadow-inner overflow-hidden">
          {equipment.image ? (
            <AtlasIcon name={equipment.image as AtlasIconName} size={80} />
          ) : (
            <span className="text-4xl md:text-6xl drop-shadow-lg">{equipment.icon}</span>
          )}
        </div>
        <div>
          <div
            className={`text-[10px] font-bold mb-1 tracking-widest ${isEquipped ? 'text-cyan-400' : 'text-zinc-500'}`}
          >
            {isEquipped ? 'Currently Equipped' : 'Inventory'} • {EQUIPMENT_PART_LABELS[equipment.part]}
          </div>
          <h4 className="text-xl md:text-2xl font-black text-white tracking-tighter">
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

      <div className="mb-4 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-3 md:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] md:text-[10px] font-black tracking-widest text-amber-500/70">
              Main Option
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm md:text-base font-black text-white">{qualityLabel}</span>
              <span className={mainStatBonusPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {mainStatBonusPct >= 0 ? '+' : ''}
                {mainStatBonusPct}%
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] md:text-[10px] font-black tracking-widest text-zinc-500">
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
          className={`mt-3 w-full rounded-xl border py-2.5 text-xs md:text-sm font-black tracking-widest transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
            canReroll
              ? 'border-amber-400 bg-amber-400 text-black hover:brightness-110'
              : 'border-white/5 bg-zinc-900/60 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {mainStatBonusPct >= EQUIPMENT_MAIN_STAT_BONUS_MAX ? 'Perfect Option' : 'Reroll Option'}
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        {!isEquipped ? (
          <button
            onClick={() => onEquip?.(equipmentId, equipment.part)}
            className="w-full py-3 md:py-4 bg-zinc-100 text-zinc-950 hover:bg-white text-center font-black text-sm md:text-base tracking-widest rounded-xl shadow-xl active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            EQUIP ITEM
          </button>
        ) : (
          <div className="w-full py-3 md:py-4 border border-cyan-400/30 text-cyan-400/60 text-center font-black text-xs md:text-sm tracking-widest rounded-xl">
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
    { key: 'power', label: 'Power', value: stats.power, color: 'text-rose-400' },
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
    className={`p-2 md:p-3 rounded-xl border shadow-inner flex flex-col items-center justify-center min-h-16 ${
      isMainStat ? 'bg-amber-500/10 border-amber-500/20' : 'bg-zinc-950/50 border-zinc-900'
    }`}
  >
    <div className="text-zinc-500 font-bold mb-0.5 tracking-tighter truncate w-full text-center text-[10px]">
      {label}
    </div>
    <div className={`font-black tabular-nums transition-colors text-base md:text-lg ${color}`}>
      {value > 0 ? `+${value}${suffix}` : `${value}${suffix}`}
    </div>
  </div>
);

export default React.memo(EquipmentCard);
