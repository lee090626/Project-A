import React from 'react';

interface WorldInfoProps {
  layerName: string;
  depth: number;
  onOpenElevator?: () => void;
}

/**
 * 현재 월드 정보(서클명, 구역명)를 표시하는 컴포넌트입니다.
 */
export const WorldInfo: React.FC<WorldInfoProps> = React.memo(({ layerName, depth, onOpenElevator }) => {
  return (
    <div className="hidden md:flex items-center gap-2 opacity-75 hover:opacity-95 transition-opacity pointer-events-auto rounded-lg border border-white/10 bg-zinc-950/45 px-3 py-2 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="flex flex-col items-end leading-none">
        <span className="text-emerald-300 font-mono text-xs lg:text-sm font-black tracking-tight">
          {layerName}
        </span>
        <span className="mt-1 text-[10px] font-mono font-bold text-zinc-500">
          D {Math.floor(depth)}m
        </span>
      </div>
      {onOpenElevator && (
        <button
          onClick={onOpenElevator}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
        >
          Waypoints
        </button>
      )}
    </div>
  );
});
