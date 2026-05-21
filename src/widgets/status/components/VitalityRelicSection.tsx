import React from 'react';
import { PlayerStats } from '@/shared/types/game';

interface VitalityRelicSectionProps {
  stats: PlayerStats;
  finalMaxHp: number;
}

const VitalityRelicSection = ({ stats, finalMaxHp }: VitalityRelicSectionProps) => {
  return (
    <div className="space-y-6 flex flex-col">
      <h3 className="text-lg md:text-[20px] font-black text-[#a89065] mb-4 border-b-2 pixel-divider pb-2">
        Player Vitality
      </h3>

      <div className="pixel-card pixel-card-muted p-4 md:p-5 space-y-4">
        {/* HP BAR */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-[#d0b886]">Survival Gauge</span>
            <span className="text-sm font-black text-[#f4dfb8] tabular-nums">
              {Math.floor(stats.hp)} <span className="text-[#a89065]">/ {finalMaxHp}</span>
            </span>
          </div>
          <div className="pixel-bar h-4 p-[2px]">
            <div
              className="pixel-bar-fill h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(stats.hp / finalMaxHp) * 100}%` }}
            />
          </div>
        </div>

        {/* RECORDS */}
        <div className="flex flex-col gap-2 pt-4 border-t-2 pixel-divider">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#d0b886]">Max Depth</span>
            <span className="text-xs font-black text-[#2c8f87]">{stats.maxDepthReached || 0}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#d0b886]">Current Orbit</span>
            <span className="text-xs font-black text-[#d8a84f]">
              Circle {stats.dimension || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VitalityRelicSection);
