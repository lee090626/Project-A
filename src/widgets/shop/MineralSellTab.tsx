import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import AtlasIcon from '@/shared/ui/AtlasIcon';

const RESOURCE_PRICES: Record<string, number> = MINERALS.reduce(
  (acc, mineral) => {
    acc[mineral.key] = mineral.basePrice;
    return acc;
  },
  {} as Record<string, number>,
);

interface MineralSellTabProps {
  stats: PlayerStats;
  sellAmounts: Record<string, number>;
  onUpdateAmount: (resource: string, amount: number) => void;
  onSell: (resource: string, amount: number, price: number) => void;
}

export default function MineralSellTab({
  stats,
  sellAmounts,
  onUpdateAmount,
  onSell,
}: MineralSellTabProps) {
  return (
    <section className="relative z-10 w-full">
      <div className="flex items-center gap-4 mb-8 border-b-2 pixel-divider pb-4"></div>

      <div className="grid grid-cols-1 gap-4 pb-12 w-full">
        {Object.entries(RESOURCE_PRICES).map(([res, price]) => {
          const count = (stats.inventory as any)[res] || 0;
          if (count <= 0) return null;

          const mineral = MINERALS.find((m) => m.key === res);
          const displayName = mineral?.name || res;
          const currentAmount = sellAmounts[res] || 0;
          const totalPrice = Math.floor(currentAmount * price);

          const updateAmount = (val: number) => {
            const newAmt = Math.max(0, Math.min(count, val));
            onUpdateAmount(res, newAmt);
          };

          return (
            <div
              key={res}
              className="pixel-card p-4 md:p-6 flex flex-col lg:flex-row items-center gap-6 group transition-colors hover:border-[#d4a35f] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#d4a35f]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* 좌측: 광물 정보 */}
              <div className="flex items-center gap-4 md:gap-6 w-full lg:w-1/3 shrink-0 relative z-10">
                <div className="pixel-icon-box w-16 h-16 md:w-20 md:h-20 flex items-center justify-center group-hover:border-[#d4a35f] transition-colors shrink-0">
                  {mineral?.image ? (
                    <AtlasIcon name={mineral.image} size={80} />
                  ) : (
                    <span className="text-3xl">{mineral?.icon || '💎'}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-xl md:text-2xl font-black text-white truncate group-hover:text-amber-400 transition-colors">
                    {displayName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="pixel-badge flex items-center gap-1.5 px-2 py-0.5">
                      <span className="text-[10px] text-[#a89065] font-bold">
                        Inv
                      </span>
                      <span className="text-xs md:text-sm text-[#f4dfb8] font-black tabular-nums">
                        {count.toLocaleString()}
                      </span>
                    </div>
                    <div className="pixel-badge flex items-center gap-1.5 px-2 py-0.5">
                      <span className="text-[10px] text-amber-500/70 font-bold">
                        Price
                      </span>
                      <span className="text-xs md:text-sm text-amber-500 font-black tabular-nums">
                        {price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 중앙: 거래 콘솔 */}
              <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:flex-1 relative z-10">
                <div className="pixel-badge flex flex-wrap items-center justify-center gap-1.5 p-1.5 w-full md:w-auto">
                  {[1, 10, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => updateAmount(currentAmount + amt)}
                      className="pixel-button px-3 py-1.5 text-[#d0b886] hover:text-[#fff1bf] text-[11px] font-black transition-colors active:translate-y-px focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      +{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => updateAmount(count)}
                    className="pixel-button px-3 py-1.5 text-amber-400 text-[11px] font-black transition-colors active:translate-y-px focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    Max
                  </button>
                </div>

                <div className="relative w-full md:w-32 group/input">
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => updateAmount(parseInt(e.target.value) || 0)}
                    className="pixel-input w-full px-4 py-2.5 text-center text-lg font-black tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="flex flex-col items-center md:items-start min-w-[120px]">
                  <div className="text-[10px] text-[#a89065] font-bold mb-0.5 opacity-70">
                    Total Value
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xl md:text-2xl font-black tabular-nums transition-colors ${currentAmount > 0 ? 'text-white' : 'text-[#5c4933]'}`}
                    >
                      {totalPrice.toLocaleString()}
                    </span>
                    <div className="flex items-center justify-center">
                      <AtlasIcon name="GoldIcon" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: 판매 버튼 */}
              <div className="w-full md:w-auto shrink-0 relative z-10">
                <button
                  onClick={() => {
                    onSell(res, currentAmount, totalPrice);
                    updateAmount(0); // Reset after sell
                  }}
                  disabled={currentAmount <= 0}
                  className={`pixel-button w-full md:w-32 py-3.5 text-sm font-black transition-colors active:translate-y-px focus:outline-none focus:ring-2 focus:ring-amber-400/50
                    ${
                      currentAmount > 0
                        ? 'pixel-button-success'
                        : 'text-[#7d6648] cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
