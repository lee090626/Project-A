import React from 'react';
import { EQUIPMENT_PARTS } from '@/shared/lib/equipmentParts';
import { EquipmentPart } from '@/shared/types/game';
import { CraftType } from '../useCrafting';

interface RecipeFiltersProps {
  craftType: CraftType;
  onSelectTab: (tab: CraftType) => void;
  selectedCircle: number;
  onSelectCircle: (circle: number) => void;
  selectedPart: EquipmentPart;
  onSelectPart: (part: EquipmentPart) => void;
}

const RecipeFilters = ({
  craftType,
  onSelectTab,
  selectedCircle,
  onSelectCircle,
  selectedPart,
  onSelectPart,
}: RecipeFiltersProps) => {
  return (
    <>
      <div className="pixel-badge pixel-font flex p-1 mb-6 mx-auto max-w-sm">
        {(['Equipment', 'Effects'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onSelectTab(tab)}
            className={`flex-1 py-3 px-6 text-sm font-black transition-colors focus:outline-none ${
              craftType === tab
                ? 'pixel-button-active text-rose-200'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters (Equipment Only) */}
      {craftType === 'Equipment' && (
        <>
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-black mr-2">Circle:</span>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                <button
                  key={c}
                  onClick={() => onSelectCircle(c)}
                  className={`px-4 py-2 text-xs font-black transition-colors border focus:outline-none ${
                    selectedCircle === c
                      ? 'pixel-button-active text-rose-200'
                      : 'pixel-button text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  C{c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-black mr-2">Part:</span>
              {EQUIPMENT_PARTS.map((part) => (
                <button
                  key={part}
                  onClick={() => onSelectPart(part)}
                  className={`px-5 py-2.5 text-[10px] md:text-xs font-black border transition-colors focus:outline-none ${
                    selectedPart === part
                      ? 'pixel-button-active text-[#f8e3a5]'
                      : 'pixel-button text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-px bg-white/5 mb-6" />
        </>
      )}
    </>
  );
};

export default React.memo(RecipeFilters);
