import React from 'react';
import { SkillRune, SkillRuneItem } from '@/shared/types/game';
import SkillRuneIcon from '@/shared/ui/SkillRuneIcon';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface TabRunesProps {
  availableRunes: SkillRuneItem[];
  selectedRuneId: string | null;
  onSelectRuneId: (id: string | null) => void;
  selectedRuneConfig: SkillRune | null;
  selectedRuneInstance: SkillRuneItem | null;
  onOpenEquipOverlay: () => void;
}

const TabRunes = ({
  availableRunes,
  selectedRuneId,
  onSelectRuneId,
  selectedRuneConfig,
  selectedRuneInstance,
  onOpenEquipOverlay,
}: TabRunesProps) => {
  return (
    <>
      <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
          {availableRunes.length > 0 ? (
            availableRunes.map((rune) => (
              <button
                key={rune.id}
                onClick={() => {
                  onSelectRuneId(rune.id === selectedRuneId ? null : rune.id);
                }}
                className={`relative aspect-square rounded-2xl transition-all flex flex-col items-center justify-center p-0 overflow-hidden group focus:outline-none ${selectedRuneId === rune.id ? 'ring-2 ring-[#eab308] scale-[1.02] z-10' : ''}`}
              >
                <SkillRuneIcon runeId={rune.runeId} rarity={rune.rarity as any} size={80} />
                <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 pointer-events-none">
                  <div className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-white/50">
                    {rune.rarity}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-center opacity-20">
              <div className="text-5xl mb-6">🪨</div>
              <p className="text-xs font-bold text-zinc-500 tracking-widest">
                No Runes Owned
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-4 md:p-6 lg:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
        {selectedRuneConfig && selectedRuneInstance ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-44 h-44 md:w-64 md:h-64 bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 flex items-center justify-center mx-auto mb-10 overflow-hidden relative group">
              <SkillRuneIcon
                runeId={selectedRuneInstance.runeId}
                rarity={selectedRuneInstance.rarity as any}
                size={200}
              />
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-white text-center mb-4 tracking-tighter">
              {selectedRuneConfig.name}
            </h3>
            <p className="text-sm md:text-base text-zinc-400 text-center leading-relaxed mb-8 px-4 font-medium">
              {selectedRuneConfig.description}
            </p>
            <div className="mt-auto space-y-4">
              <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
                <div className="flex justify-between items-center text-xs md:text-sm font-bold">
                  <span className="text-zinc-500">Type</span>
                  <span className="text-blue-400 tracking-widest">
                    {selectedRuneConfig.effectType}
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenEquipOverlay}
                className="w-full py-6 bg-cyan-400 text-black hover:bg-cyan-300 text-center font-black text-sm md:text-base tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all focus:outline-none"
              >
                Imprint Rune
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
            <AtlasIcon name="AttackRune" size={96} />
            <p className="text-xs font-bold text-zinc-500 tracking-widest mt-6">
              Select a Rune
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(TabRunes);
