import React from 'react';
import { EQUIPMENT_PARTS, EQUIPMENT_SLOT_BY_PART } from '@/shared/lib/equipmentParts';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import EquipmentCard from '../EquipmentCard';

interface TabEquipmentProps {
  selectedPart: EquipmentPart;
  onSetSelectedPart: (part: EquipmentPart) => void;
  visibleEquipments: string[];
  stats: PlayerStats;
  onEquip?: (id: string, part: EquipmentPart) => void;
  onRerollEquipmentOption?: (equipmentId: string) => void;
}

const TabEquipment = ({ 
  selectedPart, 
  onSetSelectedPart, 
  visibleEquipments, 
  stats, 
  onEquip,
  onRerollEquipmentOption,
}: TabEquipmentProps) => {
  
  const isCurrentlyEquipped = (id: string, part: EquipmentPart) => {
    return stats.equipment[EQUIPMENT_SLOT_BY_PART[part]] === id;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Part selection tabs */}
      <div className="flex gap-2 mb-6 px-1 flex-wrap">
        {EQUIPMENT_PARTS.map((part) => (
          <button
            key={part}
            onClick={() => onSetSelectedPart(part)}
            className={`pixel-button px-4 py-2 text-[10px] md:text-sm font-black transition-colors ${
              selectedPart === part
                ? 'pixel-button-active text-cyan-300'
                : 'text-[#a89065] hover:text-[#f4dfb8]'
            }`}
          >
            {part}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-0 md:pr-4">
        {visibleEquipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 pb-20">
            {visibleEquipments.map((id) => (
              <EquipmentCard
                key={id}
                equipmentId={id}
                isEquipped={isCurrentlyEquipped(id, selectedPart)}
                stats={stats}
                onEquip={onEquip}
                onRerollEquipmentOption={onRerollEquipmentOption}
              />
            ))}
          </div>
        ) : (
          <div className="pixel-empty h-64 flex flex-col items-center justify-center text-center opacity-50">
            <div className="text-5xl mb-6">🛡️</div>
            <p className="text-sm font-bold text-[#a89065]">
              No {selectedPart} Owned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TabEquipment);
