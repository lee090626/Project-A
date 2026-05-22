import React from 'react';

interface WorldInfoProps {
  layerName: string;
  onOpenElevator?: () => void;
}

/**
 * 현재 월드 구역명과 웨이포인트 접근을 표시하는 컴포넌트입니다.
 */
export const WorldInfo: React.FC<WorldInfoProps> = React.memo(
  ({ layerName, onOpenElevator }) => {
    return (
      <div className="pixel-badge pixel-font hidden md:flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity pointer-events-auto px-3 py-2">
        <div className="flex items-center leading-none">
          <span className="text-emerald-300 text-xs lg:text-sm font-black">{layerName}</span>
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
