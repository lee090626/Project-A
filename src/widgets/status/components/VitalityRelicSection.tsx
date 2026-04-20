import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { ARTIFACT_DATA } from '@/shared/config/artifactData';

interface VitalityRelicSectionProps {
  stats: PlayerStats;
  finalMaxHp: number;
}

const VitalityRelicSection = ({ stats, finalMaxHp }: VitalityRelicSectionProps) => {
  const relicIds = stats.unlockedResearchIds.filter((id) => id.startsWith('relic_'));

  return (
    <div className="space-y-6 flex flex-col">
      <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
        Player Vitality
      </h3>

      <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 space-y-4">
        {/* HP BAR */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-bold text-zinc-400">Survival Gauge</span>
            <span className="text-sm font-black text-white tabular-nums">
              {Math.floor(stats.hp)} <span className="text-zinc-500">/ {finalMaxHp}</span>
            </span>
          </div>
          <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-[2px] shadow-inner">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              style={{ width: `${(stats.hp / finalMaxHp) * 100}%` }}
            />
          </div>
        </div>

        {/* RECORDS */}
        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-700/50">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400">Max Depth</span>
            <span className="text-xs font-black text-blue-400">
              {stats.maxDepthReached || 0}m
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400">Current Orbit</span>
            <span className="text-xs font-black text-purple-400">
              Circle {stats.dimension || 0}
            </span>
          </div>
        </div>
      </div>

      {/* ARTIFACTS SECTION */}
      <div className="bg-[#252526] p-4 md:p-6 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col min-h-[300px] flex-1">
        <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2 flex justify-between items-center">
          <span>Unique Artifacts</span>
          <span className="text-purple-500 font-black">{relicIds.length}</span>
        </h4>
        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
          {relicIds.length > 0 ? (
            relicIds.map((artifactId, idx) => {
              const info = ARTIFACT_DATA[artifactId];
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💍</span>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-black text-white tracking-tight">
                        {info?.name || artifactId}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold leading-tight">
                        Ancient Passive
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 opacity-20 text-[10px] font-bold tracking-widest">
              Search deeper for artifacts
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VitalityRelicSection);
