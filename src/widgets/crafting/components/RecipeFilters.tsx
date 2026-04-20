import React from 'react';
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
      <div className="flex bg-black/40 p-1 rounded-2xl mb-6 shadow-inner border border-white/5 mx-auto max-w-sm">
        {(['Equipment', 'Specials'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onSelectTab(tab)}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-black tracking-widest transition-all focus:outline-none ${
              craftType === tab
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
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
              <span className="text-[10px] text-zinc-500 font-black tracking-[0.2em] mr-2">Circle:</span>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                <button
                  key={c}
                  onClick={() => onSelectCircle(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border focus:outline-none ${
                    selectedCircle === c
                      ? 'bg-rose-500 text-white border-rose-400 shadow-[0_4px_12px_rgba(244,63,94,0.3)]'
                      : 'bg-black/20 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  C{c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-black tracking-[0.2em] mr-2">Part:</span>
              {(['Drill', 'Helmet', 'Armor', 'Boots'] as EquipmentPart[]).map((part) => (
                <button
                  key={part}
                  onClick={() => onSelectPart(part)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest border transition-all focus:outline-none ${
                    selectedPart === part
                      ? 'bg-white text-black border-white shadow-xl'
                      : 'bg-zinc-800/40 text-zinc-500 border-zinc-800 hover:text-zinc-300'
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
