import React from 'react';

interface StatSectionProps {
  stats: {
    power: number;
    defense: number;
    maxHp: number;
    critRate: number;
    critDmg: number;
    miningInterval: number;
    moveSpeedMult: number;
    luck: number;
  };
  onHoverStat: (e: React.MouseEvent, id: string, name: string) => void;
  onLeaveStat: () => void;
}

const StatSection = ({ stats, onHoverStat, onLeaveStat }: StatSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Combat & Mining */}
      <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mb-4 border-b border-zinc-800 pb-2">
        Combat & Mining
      </h3>

      <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col gap-3">
        {[
          {
            id: 'power',
            label: 'Total Power',
            value: stats.power,
            color: 'text-rose-400',
          },
          {
            id: 'defense',
            label: 'Defense',
            value: stats.defense,
            color: 'text-blue-400',
          },
          { id: 'hp', label: 'Max HP', value: stats.maxHp, color: 'text-emerald-400' },
          {
            id: 'critRate',
            label: 'Crit Rate',
            value: `${(stats.critRate * 100).toFixed(1)}%`,
            color: 'text-amber-400',
          },
          {
            id: 'critDmg',
            label: 'Crit Damage',
            value: `${(stats.critDmg * 100).toFixed(0)}%`,
            color: 'text-amber-500',
          },
          {
            id: 'miningSpeed',
            label: 'Mining Speed',
            value: `${stats.miningInterval}ms`,
            color: 'text-cyan-400',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`flex justify-between items-center group cursor-help`}
            onMouseEnter={(e) => onHoverStat(e, stat.id, stat.label)}
            onMouseLeave={onLeaveStat}
          >
            <div className="text-[11px] font-bold text-zinc-400 tracking-tight group-hover:text-zinc-200 transition-colors">
              {stat.label}
            </div>
            <div
              className={`text-sm font-black ${stat.color} tabular-nums flex items-center gap-1.5`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Exploration */}
      <h3 className="text-lg md:text-[20px] font-black text-zinc-500 tracking-widest mt-6 mb-4 border-b border-zinc-800 pb-2">
        Exploration
      </h3>

      <div className="bg-[#252526] p-4 md:p-5 rounded-xl md:rounded-2xl border border-zinc-800 flex flex-col gap-3">
        {[
          {
            id: 'moveSpeed',
            label: 'Move Speed',
            value: `${(stats.moveSpeedMult * 100).toFixed(0)}%`,
          },
          {
            id: 'luck',
            label: 'Luck (Drop Bonus)',
            value: `+${stats.luck}`,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex justify-between items-center group cursor-help"
            onMouseEnter={(e) => onHoverStat(e, stat.id, stat.label)}
            onMouseLeave={onLeaveStat}
          >
            <div className="text-[11px] font-bold text-zinc-400 tracking-tight group-hover:text-zinc-200 transition-colors">
              {stat.label}
            </div>
            <div className="text-sm font-black text-[#eab308] tabular-nums flex items-center gap-1.5">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(StatSection);
