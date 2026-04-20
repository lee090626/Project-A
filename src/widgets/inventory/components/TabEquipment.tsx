import React from 'react';
import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import EquipmentCard from '../EquipmentCard';

interface TabEquipmentProps {
  selectedPart: EquipmentPart;
  onSetSelectedPart: (part: EquipmentPart) => void;
  visibleEquipments: string[];
  stats: PlayerStats;
  onEquip?: (id: string, part: EquipmentPart) => void;
}

const TabEquipment = ({ 
  selectedPart, 
  onSetSelectedPart, 
  visibleEquipments, 
  stats, 
  onEquip 
}: TabEquipmentProps) => {
  
  const isCurrentlyEquipped = (id: string, part: EquipmentPart) => {
    const { equipment } = stats;
    switch (part) {
      case 'Drill': return equipment.drillId === id;
      case 'Helmet': return equipment.helmetId === id;
      case 'Armor': return equipment.armorId === id;
      case 'Boots': return equipment.bootsId === id;
      default: return false;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Part selection tabs */}
      <div className="flex gap-2 mb-6 px-1 flex-wrap">
        {(['Drill', 'Helmet', 'Armor', 'Boots'] as EquipmentPart[]).map((part) => (
          <button
            key={part}
            onClick={() => onSetSelectedPart(part)}
            className={`px-4 py-2 rounded-xl text-[10px] md:text-sm font-black tracking-widest border transition-all ${
              selectedPart === part
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-lg scale-105'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
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
                onEquip={onEquip}
              />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center opacity-20">
            <div className="text-5xl mb-6">🛡️</div>
            <p className="text-sm font-bold text-zinc-500 tracking-widest">
              No {selectedPart} Owned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TabEquipment);
