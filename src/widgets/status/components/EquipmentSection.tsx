import React from 'react';
import { Equipment } from '@/shared/types/game';
import AtlasIcon from '@/shared/ui/AtlasIcon';
import { AtlasIconName } from '@/shared/config/atlasMap';

interface EquipmentSectionProps {
  equipped: {
    drill: Equipment | null;
    helmet: Equipment | null;
    armor: Equipment | null;
    boots: Equipment | null;
  };
}

const EquipmentSection = ({ equipped }: EquipmentSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg md:text-[20px] font-black text-[#a89065] mb-4 border-b-2 pixel-divider pb-2">
        Gear Loadout
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {(['drill', 'helmet', 'armor', 'boots'] as const).map((part) => {
          const item = equipped[part];
          return (
            <div key={part} className="pixel-card pixel-card-muted p-4 flex flex-col items-center text-center group">
              <div className="pixel-icon-box w-14 h-14 flex items-center justify-center mb-2 group-hover:border-emerald-500/40 transition-colors overflow-hidden">
                {item?.image ? (
                  <AtlasIcon name={item.image as AtlasIconName} size={48} />
                ) : (
                  <span className="text-3xl">{item?.icon || '🚫'}</span>
                )}
              </div>
              <div className="text-[8px] font-bold text-[#a89065] mb-1">{part}</div>
              <div className="text-[10px] font-black text-white truncate w-full">{item?.name || 'Barehanded'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EquipmentSection);
