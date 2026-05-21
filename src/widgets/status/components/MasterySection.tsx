import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { createInitialMasteryState } from '@/shared/lib/masteryUtils';
import TileMasteryCard from '../TileMasteryCard';

const MINERAL_KEY_SET = new Set<string>(MINERALS.map((m) => m.key as string));
const MINERAL_ORDER = new Map<string, number>(MINERALS.map((m, index) => [m.key as string, index]));

interface MasterySectionProps {
  stats: PlayerStats;
  hoveredTooltipId?: string;
  onHoverPerk: (e: React.MouseEvent, perkId: string, name: string, desc: string) => void;
  onLeavePerk: () => void;
}

const MasterySection = ({ stats, hoveredTooltipId, onHoverPerk, onLeavePerk }: MasterySectionProps) => {
  const discoveredMineralKeys = stats.discoveredMinerals
    .filter((tileKey) => MINERAL_KEY_SET.has(tileKey))
    .sort((a, b) => (MINERAL_ORDER.get(a) ?? 0) - (MINERAL_ORDER.get(b) ?? 0));

  return (
    <div className="pixel-card p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/60" />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">⛏️</span>
          <h3 className="text-lg md:text-[22px] font-black text-white">
            Tile Mastery <span className="text-emerald-500 ml-2">Progress</span>
          </h3>
        </div>
        <div className="pixel-badge px-4 py-1.5 text-[10px] font-black text-emerald-400">
          DISCOVERED: {discoveredMineralKeys.length}
        </div>
      </div>

      {discoveredMineralKeys.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {discoveredMineralKeys.map((tileKey) => (
            <TileMasteryCard
              key={tileKey}
              tileKey={tileKey}
              mastery={
                (stats.tileMastery && stats.tileMastery[tileKey]) ||
                createInitialMasteryState(tileKey)
              }
              hoveredTooltipId={hoveredTooltipId}
              onHoverPerk={onHoverPerk}
              onLeavePerk={onLeavePerk}
            />
          ))}
        </div>
      ) : (
        <div className="pixel-empty py-20 flex flex-col items-center justify-center opacity-50">
          <span className="text-4xl mb-4">🔦</span>
          <span className="text-xs font-black">
            Start mining to unlock Tile Mastery!
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MasterySection);
