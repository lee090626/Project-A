import React from 'react';
import AtlasIcon from '@/shared/ui/AtlasIcon';

interface GoldDisplayProps {
  gold: number;
}

/**
 * 플레이어의 보유 골드를 표시하는 컴포넌트입니다.
 */
export const GoldDisplay: React.FC<GoldDisplayProps> = React.memo(({ gold }) => {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="pixel-badge pixel-font flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2">
        <div className="pixel-icon-box flex items-center justify-center w-6 h-6 md:w-7 md:h-7 relative p-0">
          <AtlasIcon name="GoldIcon" alt="Gold" size={22} />
        </div>
        <span className="text-[#f8d96a] text-sm md:text-lg lg:text-xl font-black">
          {gold.toLocaleString()}
        </span>
      </div>
    </div>
  );
});
