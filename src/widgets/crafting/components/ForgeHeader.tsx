import React from 'react';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';

interface ForgeHeaderProps {
  goldCoins: number;
  onClose: () => void;
}

const ForgeHeader = ({ goldCoins, onClose }: ForgeHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6 relative z-10">
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-rose-500/20 shadow-inner">
            ⚒️
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-rose-500 leading-none">
              Forgemaster
            </h2>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1 opacity-60">
              Ancient Blacksmith
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
        <div className="flex items-center justify-center gap-3 md:gap-4 bg-black/40 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-3xl border border-white/5 shadow-inner group">
          <AtlasIcon name="GoldIcon" size={32} />
          <span className="text-sm md:text-2xl font-black text-white tabular-nums tracking-tighter">
            {goldCoins.toLocaleString()}
            <span className="ml-2 text-rose-500 text-[10px] md:text-xs tracking-widest opacity-60">Gold</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-xl"
        >
          <span className="text-lg md:text-xl font-bold">✕</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ForgeHeader);
