import React from 'react';

interface WorldInfoProps {
  layerName: string;
  depth: number;
  onOpenElevator?: () => void;
}

/**
 * 현재 월드 정보(서클명, 구역명)를 표시하는 컴포넌트입니다.
 */
export const WorldInfo: React.FC<WorldInfoProps> = React.memo(
  ({ layerName, depth, onOpenElevator }) => {
    return (
      <div className="pixel-badge pixel-font hidden md:flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity pointer-events-auto px-3 py-2">
        <div className="flex flex-col items-end leading-none">
          <span className="text-emerald-300 text-xs lg:text-sm font-black">{layerName}</span>
          <span className="mt-1 text-[10px] font-bold text-[#a89065]">D {Math.floor(depth)}m</span>
        </div>
        {onOpenElevator && (
          <button
            onClick={onOpenElevator}
            className="pixel-button px-2 py-1 text-[10px] font-bold text-[#d0b886] transition-colors hover:text-[#f8e3a5]"
          >
            Waypoints
          </button>
        )}
      </div>
    );
  },
);
