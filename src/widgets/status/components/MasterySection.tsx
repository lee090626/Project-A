import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { createInitialMasteryState } from '@/shared/lib/masteryUtils';
import TileMasteryCard from '../TileMasteryCard';

interface MasterySectionProps {
  stats: PlayerStats;
  hoveredTooltipId?: string;
  onHoverPerk: (e: React.MouseEvent, perkId: string, name: string, desc: string) => void;
  onLeavePerk: () => void;
}

const MasterySection = ({ stats, hoveredTooltipId, onHoverPerk, onLeavePerk }: MasterySectionProps) => {
  return (
    <div className="bg-[#1e1e1f] p-4 md:p-8 rounded-2xl md:rounded-4xl border border-zinc-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">⛏️</span>
          <h3 className="text-lg md:text-[22px] font-black text-white tracking-tighter">
            Tile Mastery <span className="text-emerald-500 ml-2">Progress</span>
          </h3>
        </div>
        <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-emerald-400 tracking-widest">
          DISCOVERED: {stats.discoveredMinerals.length}
        </div>
      </div>

      {stats.discoveredMinerals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stats.discoveredMinerals
            .filter((tileKey) => MINERALS.some((m) => m.key === tileKey))
            .sort((a, b) => {
              const idxA = MINERALS.findIndex((m) => m.key === a);
              const idxB = MINERALS.findIndex((m) => m.key === b);
              return idxA - idxB;
            })
            .map((tileKey) => (
              <TileMasteryCard
                key={tileKey}
                tileKey={tileKey}
                mastery={
                  (stats.tileMastery && stats.tileMastery[tileKey]) ||
                  createInitialMasteryState(tileKey)
                }
                unlockedPerks={stats.unlockedMasteryPerks}
                hoveredTooltipId={hoveredTooltipId}
                onHoverPerk={onHoverPerk}
                onLeavePerk={onLeavePerk}
              />
            ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center bg-zinc-950/50 rounded-3xl border border-dashed border-zinc-800 opacity-30">
          <span className="text-4xl mb-4">🔦</span>
          <span className="text-xs font-black tracking-widest">
            Start mining to unlock Tile Mastery!
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MasterySection);
