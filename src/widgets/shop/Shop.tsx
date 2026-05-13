'use client';

import React from 'react';
import { PlayerStats } from '@/shared/types/game';
import { AtlasSprite } from '@/shared/ui/AtlasSprite';
import { WindowFrame, WindowHeader } from '@/shared/ui/window';
import MineralSellTab from './MineralSellTab';

import { useShopTrade } from './useShopTrade';

/**
 * 상점 컴포넌트의 Props 인터페이스입니다.
 */
interface ShopProps {
  stats: PlayerStats;
  onUpgrade: (id: string, price: Record<string, number>) => void;
  onSell: (resource: string, amount: number, price: number) => void;
  onClose: () => void;
}

/**
 * 플레이어가 자원을 판매하고 장비를 업그레이드하거나 스킬젬을 관리할 수 있는 상점(Forge) 컴포넌트입니다.
 */
function Shop({ stats, onSell, onClose }: ShopProps) {
  const {
    sellAmounts,
    updateSellAmount,
  } = useShopTrade();

  return (
    <WindowFrame showPattern topGlowClassName="from-amber-500/5">
      <WindowHeader
        headerChromeClassName="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50"
        headerClassName="z-10"
        showSheen
        icon={
          <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
            <AtlasSprite name="GoldIcon" size={40} />
          </div>
        }
        title="Shop"
        subtitle="Global Market"
        titleClassName="text-amber-400"
        subtitleClassName="text-zinc-500 opacity-60"
        titleClusterClassName="flex items-center gap-4"
        gold={stats.goldCoins}
        goldVariant="labeled"
        goldLabelClassName="text-amber-500"
        onClose={onClose}
        closeButtonClassName="hover:bg-emerald-400 hover:text-black hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/50"
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden min-h-0 pr-2 relative z-0">
        <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-4 custom-scrollbar pb-10">
          <MineralSellTab
            stats={stats}
            sellAmounts={sellAmounts}
            onUpdateAmount={updateSellAmount}
            onSell={onSell}
          />
        </div>
      </div>
    </WindowFrame>
  );
}

export default React.memo(Shop, (prev, next) => {
  return prev.stats === next.stats;
});
