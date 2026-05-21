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
        onClose={onClose}
        closeButtonClassName="hover:bg-[#d8a84f] hover:text-[#090a08] hover:border-[#fff1bf] focus-visible:ring-2 focus-visible:ring-[#d8a84f]/50"
      />
      <div className="space-y-3 md:space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar">
        <button
          onClick={() => onSelectCheckpoint(0)}
          className="pixel-card pixel-card-active w-full p-4 md:p-6 text-white hover:border-[#eab308] transition-colors font-black flex justify-between items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          <div className="flex flex-col items-start">
            <span className="text-[#eab308] text-[8px] md:text-[9px] mb-0.5 md:mb-1 group-hover:brightness-125">
              Surface
            </span>
            <span className="text-lg md:text-xl">Base Camp</span>
          </div>
          <span className="pixel-badge px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-mono text-[#eab308]">
            0m
          </span>
        </button>

        {waypointDepths.map((depth) => (
          <button
            key={depth}
            onClick={() => onSelectCheckpoint(depth)}
            className="pixel-card pixel-card-muted w-full p-4 md:p-6 text-[#d0b886] hover:text-[#fff1bf] hover:border-[#eab308] transition-colors font-black flex justify-between items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            <div className="flex flex-col items-start">
              <span className="text-[#7d6648] text-[8px] md:text-[9px] mb-0.5 md:mb-1">
                Waypoint
              </span>
              <span className="text-lg md:text-xl">Transit_{depth}</span>
            </div>
            <span className="pixel-badge px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-mono">
              {depth}m
            </span>
          </button>
        ))}

        {waypointDepths.length === 0 && (
          <div className="pixel-empty w-full p-4 md:p-6 text-[#a89065] text-sm md:text-base">
            Reach 100m depth to unlock your first waypoint.
          </div>
        )}
      </div>
    </WindowFrame>
  );
};

export default Elevator;
