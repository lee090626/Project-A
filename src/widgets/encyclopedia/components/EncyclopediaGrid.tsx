import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import AtlasIcon from '@/shared/ui/AtlasIcon';
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
              className={`pixel-card relative aspect-square transition-colors flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8f87]/50 ${
                isSelected
                  ? 'pixel-card-active border-[#d8a84f]!'
                  : !isDiscovered
                    ? 'pixel-card-muted opacity-40'
                    : 'pixel-card-muted hover:border-[#d8a84f]'
              }`}
            >
              <div
                className={`w-20 h-20 flex items-center justify-center mb-4 transition-all ${
                  !isDiscovered ? 'opacity-50' : ''
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
              <div className="text-[20px] text-[#a89065] font-bold">
                {isDiscovered ? m.name : 'Unknown'}
              </div>
              {!isDiscovered && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[#0f120e] text-6xl font-black opacity-25">?</span>
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
            className={`pixel-card relative aspect-square transition-colors flex flex-col items-center justify-center p-4 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8f87]/50 ${
              isSelected
                ? 'pixel-card-active border-[#d8a84f]!'
                : !isEncountered
                  ? 'pixel-card-muted opacity-40'
                  : 'pixel-card-muted hover:border-[#d8a84f]'
            }`}
          >
            <div
              className={`w-20 h-20 flex items-center justify-center mb-4 transition-all ${
                !isEncountered ? 'opacity-50' : ''
              }`}
            >
              {isEncountered ? (
                <AtlasIcon name={b.imagePath as any} size={64} />
              ) : (
                <span className="text-6xl">💀</span>
              )}
            </div>
            <div className="text-[10px] text-[#a89065] font-bold">
              {isEncountered ? b.name : 'Classified'}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(EncyclopediaGrid);
