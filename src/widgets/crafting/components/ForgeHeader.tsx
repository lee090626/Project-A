import React from 'react';
import AtlasIcon from '@/shared/ui/AtlasIcon';

interface ForgeHeaderProps {
  goldCoins: number;
  onClose: () => void;
}

const ForgeHeader = ({ goldCoins, onClose }: ForgeHeaderProps) => {
  return (
    <div className="pixel-panel pixel-font flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 shrink-0 gap-4 md:gap-6 relative z-10">
      <div className="absolute inset-0 bg-[#d8a84f]/6 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
        <div className="flex items-center gap-4">
          <div className="pixel-slot w-12 h-12 md:w-14 md:h-14 bg-[#2c8f87]/15 flex items-center justify-center text-2xl md:text-3xl">
            ⚒️
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black text-[#d8a84f] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.75)]">
              Forgemaster
            </h2>
            <span className="text-[10px] text-[#a89065] font-bold mt-1 opacity-60">
              Ancient Blacksmith
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
        <div className="pixel-badge flex items-center justify-center gap-3 md:gap-4 px-5 py-2.5 md:px-8 md:py-3.5 group">
          <AtlasIcon name="GoldIcon" size={32} />
          <span className="text-sm md:text-2xl font-black text-[#f8e3a5] tabular-nums">
            {goldCoins.toLocaleString()}
            <span className="ml-2 text-[#d8a84f] text-[10px] md:text-xs opacity-75">Gold</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="pixel-button w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center text-[#d0b886] hover:bg-[#8d4738] hover:text-[#fff1bf] hover:border-[#f08b6d] transition-colors active:translate-y-px"
        >
          <span className="text-lg md:text-xl font-bold">✕</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ForgeHeader);
