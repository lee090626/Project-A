import React from 'react';

interface EquipmentInfoProps {
  pos: { x: number; y: number };
}

/**
 * 플레이어의 현재 좌표 정보(X, Y)를 표시합니다.
 */
export const EquipmentInfo: React.FC<EquipmentInfoProps> = React.memo(({ pos }) => {
  return (
    <div className="pixel-badge pixel-font hidden md:flex items-center gap-2 px-3 py-2 z-10 opacity-80 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-amber-400" />
        <span className="text-[10px] font-bold text-zinc-500">Nav</span>
      </div>

      <div className="text-xs lg:text-sm font-black text-white">
        <span className="text-white/35">X</span>{' '}
        <span className="text-amber-400">{Math.round(pos.x)}</span>
        <span className="mx-2 text-white/10">|</span>
        <span className="text-white/35">Y</span>{' '}
        <span className="text-amber-400">{Math.round(pos.y)}</span>
      </div>
    </div>
  );
});
