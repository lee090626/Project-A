import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { EncyclopediaTab } from './EncyclopediaTabs';

interface EncyclopediaGridProps {
  activeTab: EncyclopediaTab;
  stats: PlayerStats;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  mineralsData: any[];
  bossesData: any[];
}

const EncyclopediaGrid = ({
  activeTab,
  stats,
  selectedId,
  onSelectId,
  mineralsData,
  bossesData,
}: EncyclopediaGridProps) => {
  if (activeTab === 'minerals') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {mineralsData.map((m) => {
          const isDiscovered = stats.discoveredMinerals.includes(m.key);
          const isSelected = selectedId === m.key;

          return (
            <button
              key={m.key}
              onClick={() => onSelectId(m.key)}
              className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                isSelected
                  ? 'bg-[#252526] border-purple-400 shadow-2xl scale-[1.02]'
                  : !isDiscovered
                    ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                    : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div
                className={`w-20 h-20 flex items-center justify-center mb-4 transition-all ${
                  !isDiscovered ? 'filter blur-md grayscale opacity-50' : ''
                }`}
              >
                {isDiscovered ? (
                  m.image ? (
                    <AtlasIcon name={m.image} size={64} />
                  ) : (
                    <span className="text-6xl">{m.icon}</span>
                  )
                ) : (
                  '?'
                )}
              </div>
              <div className="text-[20px] text-zinc-500 font-bold tracking-widest">
                {isDiscovered ? m.name : 'Unknown'}
              </div>
              {!isDiscovered && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-zinc-800 text-6xl font-black opacity-20">?</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {bossesData.map((b) => {
        const isEncountered = stats.encounteredBossIds.includes(b.id);
        const isSelected = selectedId === b.id;

        return (
          <button
            key={b.id}
            onClick={() => onSelectId(b.id)}
            className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
              isSelected
                ? 'bg-[#252526] border-[#a855f7] shadow-2xl scale-[1.02]'
                : !isEncountered
                  ? 'bg-[#1a1a1b] border-zinc-900 opacity-40'
                  : 'bg-[#252526] border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div
              className={`w-20 h-20 flex items-center justify-center mb-4 transition-all ${
                !isEncountered ? 'filter blur-md grayscale opacity-50' : ''
              }`}
            >
              {isEncountered ? (
                <AtlasIcon name={b.imagePath as any} size={64} />
              ) : (
                <span className="text-6xl">💀</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 font-bold tracking-widest">
              {isEncountered ? b.name : 'Classified'}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(EncyclopediaGrid);
