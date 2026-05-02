import React from 'react';

interface EquipmentInfoProps {
  pos: { x: number; y: number };
}

/**
 * 플레이어의 현재 좌표 정보(X, Y)를 표시합니다.
 */
export const EquipmentInfo: React.FC<EquipmentInfoProps> = React.memo(
  ({ pos }) => {
    return (
      <div className="hidden md:flex items-center gap-2 bg-zinc-950/45 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8)] z-10 opacity-70 hover:opacity-95 transition-all hover:bg-zinc-900/55">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.45)]" />
          <span className="text-[10px] font-bold text-zinc-500 tracking-wide">Nav</span>
        </div>

        <div className="font-mono text-xs lg:text-sm font-black tracking-wide text-white">
          <span className="text-white/35">X</span> <span className="text-amber-400">{Math.round(pos.x)}</span>
          <span className="mx-2 text-white/10">|</span>
          <span className="text-white/35">Y</span> <span className="text-amber-400">{Math.round(pos.y)}</span>
        </div>
      </div>
    );
  },
);
