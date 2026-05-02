import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { WindowFrame, WindowHeader } from '@/shared/ui/window';

interface ElevatorProps {
  stats: PlayerStats;
  onSelectCheckpoint: (depth: number) => void;
  onClose: () => void;
}

const Elevator: React.FC<ElevatorProps> = ({ stats, onSelectCheckpoint, onClose }) => {
  const waypointDepths = (stats.unlockedWaypoints || [])
    .filter((depth) => depth > 0)
    .sort((a, b) => a - b);

  return (
    <WindowFrame>
      <WindowHeader
        icon={<span className="text-2xl md:text-3xl">🛗</span>}
        title="Waypoints"
        subtitle="Fast Travel Network"
        titleClassName="text-amber-500"
        gold={stats.goldCoins}
        onClose={onClose}
        closeButtonClassName="hover:bg-amber-400 hover:text-black hover:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/50"
      />
      <div className="space-y-3 md:space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar">
        <button
          onClick={() => onSelectCheckpoint(0)}
          className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          <div className="flex flex-col items-start">
            <span className="text-[#eab308] text-[8px] md:text-[9px] tracking-widest mb-0.5 md:mb-1 group-hover:brightness-125">
              Surface
            </span>
            <span className="text-lg md:text-xl">Base Camp</span>
          </div>
          <span className="bg-zinc-900 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-mono text-[#eab308]">
            0m
          </span>
        </button>

        {waypointDepths.map((depth) => (
          <button
            key={depth}
            onClick={() => onSelectCheckpoint(depth)}
            className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            <div className="flex flex-col items-start">
              <span className="text-zinc-600 text-[8px] md:text-[9px] tracking-widest mb-0.5 md:mb-1">
                Waypoint
              </span>
              <span className="text-lg md:text-xl">Transit_{depth}</span>
            </div>
            <span className="bg-zinc-900 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-mono">
              {depth}m
            </span>
          </button>
        ))}

        {waypointDepths.length === 0 && (
          <div className="w-full p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#252526] border border-zinc-800 text-zinc-500 text-sm md:text-base">
            Reach 100m depth to unlock your first waypoint.
          </div>
        )}
      </div>
    </WindowFrame>
  );
};

export default Elevator;
