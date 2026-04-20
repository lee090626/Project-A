import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { ArtifactDefinition } from '@/shared/config/artifactData';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { atlasMap } from '@/shared/config/atlasMap';

interface TabEffectsProps {
  stats: PlayerStats;
  ownedArtifacts: ArtifactDefinition[];
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  selectedArtifact: ArtifactDefinition | null;
}

const TabEffects = ({ stats, ownedArtifacts, selectedKey, onSelectKey, selectedArtifact }: TabEffectsProps) => {
  return (
    <>
      <div className="flex-1 overflow-y-auto pr-0 md:pr-4 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
          {ownedArtifacts.length > 0 ? (
            ownedArtifacts.map((item) => {
              const count = stats.collectionHistory?.[item.id] || 0;
              const isSelected = selectedKey === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectKey(item.id)}
                  className={`relative aspect-square rounded-xl md:rounded-2xl border transition-all flex flex-col items-center justify-center p-2 md:p-4 group overflow-hidden focus:outline-none ${
                    isSelected
                      ? 'bg-[#252526] border-orange-400 shadow-2xl scale-[1.02]'
                      : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-14 h-14 md:w-18 md:h-18 mb-2 md:mb-4 flex items-center justify-center">
                    <AtlasIcon name={item.image as any} size={64} />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`text-[10px] md:text-sm font-bold tabular-nums ${isSelected ? 'text-white' : 'text-orange-400'}`}>
                      x{count.toLocaleString()}
                    </div>
                    <div className="text-[10px] md:text-xs text-zinc-600 font-bold tracking-widest text-center truncate w-full px-1">
                      {item.name}
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-center opacity-20">
              <div className="text-5xl mb-6">📦</div>
              <p className="text-xs font-bold text-zinc-500 tracking-widest">
                No Items Found
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-4 md:p-6 lg:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
        {selectedArtifact ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            {/* 이미지 영역 */}
            <div className="w-40 h-40 md:w-56 md:h-56 bg-zinc-950 rounded-3xl md:rounded-4xl shadow-inner border border-zinc-800 flex items-center justify-center mx-auto mb-8 md:mb-12 overflow-hidden relative">
              <AtlasIcon name={(selectedArtifact.image && (selectedArtifact.image in atlasMap)) ? selectedArtifact.image as any : 'GoldIcon'} size={160} />
              <div className="absolute inset-0 shadow-[inset_0_0_60px_#f9731633] rounded-3xl md:rounded-4xl pointer-events-none" />
            </div>

            {/* 이름 */}
            <h3 className="text-2xl md:text-4xl font-black text-white text-center mb-8 tracking-tighter">
              {selectedArtifact.name}
            </h3>
            
            {/* 핵심 효과 설명 */}
            <div className="mt-4 bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
              
              {/* 동적 능력치 보너스 표시 */}
              {selectedArtifact.bonus && (
                <div className="text-[16px] text-orange-500 font-black tracking-[0.2em] mb-2">
                  {(() => {
                    const statMap: Record<string, string> = {
                      power: 'Attack Power',
                      maxHp: 'Max HP',
                      moveSpeed: 'Move Speed',
                      luck: 'Luck',
                      critRate: 'Crit Rate',
                      critDamage: 'Crit Damage',
                      defense: 'Defense',
                      miningSpeed: 'Mining Speed'
                    };
                    const stacks = stats.collectionHistory?.[selectedArtifact.id] || 0;
                    const totalValue = selectedArtifact.bonus.value * stacks;
                    const percentStats = ['critRate', 'critDamage', 'miningSpeed'];
                    const isPercent = percentStats.includes(selectedArtifact.bonus.stat);
                    const formattedValue = isPercent ? `${(totalValue * 100).toFixed(1)}%` : totalValue.toLocaleString();
                    
                    return `${statMap[selectedArtifact.bonus.stat] || selectedArtifact.bonus.stat} +${formattedValue}`;
                  })()}
                </div>
              )}

              <div className="text-lg md:text-xl text-white font-black leading-tight">
                {selectedArtifact.effectDescription}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
            <div className="text-5xl mb-6">📦</div>
            <p className="text-xs font-bold text-zinc-500 tracking-widest">Select an Item</p>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(TabEffects);
