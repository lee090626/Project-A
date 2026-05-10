import React from 'react';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { Equipment, EquipmentPart } from '@/shared/types/game';
import { AtlasIconName } from '@/shared/config/atlasMap';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface EquipmentCardProps {
  equipmentId: string;
  isEquipped: boolean;
  onEquip?: (id: string, part: EquipmentPart) => void;
}

/**
 * 인벤토리 장비 탭에서 개별 장비(드릴, 투구, 갑옷, 신발)를 표시하는 카드 컴포넌트입니다.
 */
function EquipmentCard({ equipmentId, isEquipped, onEquip }: EquipmentCardProps) {
  const equipment = EQUIPMENTS[equipmentId] as Equipment | undefined;
  if (!equipment) return null;

  const partLabels: Record<EquipmentPart, string> = {
    Drill: 'Weapon (Drill)',
    Helmet: 'Head (Helmet)',
    Armor: 'Body (Armor)',
    Boots: 'Legs (Boots)',
  };
  const statItems = getEquipmentStatItems(equipment.stats);

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
            {isEquipped ? 'Currently Equipped' : 'Inventory'} • {partLabels[equipment.part]}
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
          />
        ))}
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
}) => {
  return [
    { label: 'Power', value: stats.power, color: 'text-rose-400' },
    { label: 'Defense', value: stats.defense, color: 'text-blue-400' },
    { label: 'Max HP', value: stats.maxHp, color: 'text-emerald-400' },
    { label: 'Speed', value: stats.moveSpeed, color: 'text-amber-400', suffix: '%' },
  ].filter((stat): stat is { label: string; value: number; color: string; suffix?: string } =>
    typeof stat.value === 'number' && stat.value !== 0,
  );
};

const StatBox = ({
  label,
  value,
  color,
  suffix = '',
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) => (
  <div className="bg-zinc-950/50 p-2 md:p-3 rounded-xl border border-zinc-900 shadow-inner flex flex-col items-center justify-center min-h-16">
    <div className="text-zinc-500 font-bold mb-0.5 tracking-tighter truncate w-full text-center text-[10px]">
      {label}
    </div>
    <div className={`font-black tabular-nums transition-colors text-base md:text-lg ${color}`}>
      {value > 0 ? `+${value}${suffix}` : `${value}${suffix}`}
    </div>
  </div>
);

export default React.memo(EquipmentCard);
