import React, { useState, useMemo, useCallback } from 'react';

import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { MONSTER_LIST } from '@/shared/config/monsterData';
import { CIRCLES } from '@/shared/config/circleData';
import { WindowFrame, WindowHeader } from '@/shared/ui/window';
import { EncyclopediaDetail, ProgressBox } from './EncyclopediaDetail';

// 새롭게 분리된 하위 컴포넌트들
import EncyclopediaTabs, { EncyclopediaTab } from './components/EncyclopediaTabs';
import EncyclopediaGrid from './components/EncyclopediaGrid';

interface EncyclopediaProps {
  stats: PlayerStats;
  onClose: () => void;
}

function Encyclopedia({ stats, onClose }: EncyclopediaProps) {
  const [activeTab, setActiveTab] = useState<EncyclopediaTab>('minerals');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** 보스 데이터 가공 (MONSTER_LIST + CIRCLES) */
  const bossesData = useMemo(() => {
    return MONSTER_LIST.filter((m) => m.type === 'boss').map((m) => {
      const circle = CIRCLES.find((c) => c.boss?.id === m.id);
      return {
        id: m.id,
        name: m.name,
        icon: m.imagePath,
        depth: circle ? circle.depthEnd : 0,
        description: m.description,
        imagePath: m.imagePath,
        stats: m.stats,
      };
    });
  }, []);

  const discoveredCount = useMemo(() => {
    const discoveredMineralKeys = new Set(stats.discoveredMinerals);
    return MINERALS.filter((m) => discoveredMineralKeys.has(m.key)).length;
  }, [stats.discoveredMinerals]);
  const totalMinerals = MINERALS.length;
  const encounteredBossCount = stats.encounteredBossIds.length;
  const totalBosses = bossesData.length;

  const handleTabChange = useCallback((tab: EncyclopediaTab) => {
    setActiveTab(tab);
    setSelectedId(null);
  }, []);

  const handleSelectId = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  return (
    <WindowFrame>
      <WindowHeader
        icon={<span className="text-2xl md:text-3xl">📖</span>}
        title="Books"
        subtitle="Discovery Archive"
        titleClassName="text-[#2c8f87]"
        gold={stats.goldCoins}
        onClose={onClose}
        closeButtonClassName="hover:bg-[#2c8f87] hover:text-[#fff1bf] hover:border-[#d8a84f] focus-visible:ring-2 focus-visible:ring-[#2c8f87]/50"
      >
        <EncyclopediaTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </WindowHeader>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-hidden pr-0 lg:pr-2">
        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar pb-10 pt-1">
          <EncyclopediaGrid 
            activeTab={activeTab}
            stats={stats}
            selectedId={selectedId}
            onSelectId={handleSelectId}
            mineralsData={MINERALS}
            bossesData={bossesData}
          />
        </div>

        {/* DETAIL SECTION */}
        <div className="pixel-card w-full lg:w-[350px] xl:w-[400px] shrink-0 h-auto lg:h-full flex flex-col p-5 md:p-8 relative overflow-y-auto custom-scrollbar min-h-0">
          {selectedId ? (
            <EncyclopediaDetail id={selectedId} tab={activeTab} stats={stats} bossesData={bossesData} />
          ) : (
            <div className="h-full py-8 md:py-0 flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-20 animate-pulse">📡</div>
              <h3 className="text-base md:text-lg font-black text-[#7d6648]">
                Scanning Database...
              </h3>
              <p className="text-[9px] md:text-[10px] text-[#a89065] mt-2 font-bold">
                Select an entry for analysis
              </p>

              <div className="mt-8 md:mt-12 w-full space-y-3">
                <ProgressBox
                  label="Minerals Discovery"
                  current={discoveredCount}
                  total={totalMinerals}
                  color="#2c8f87"
                />
                <ProgressBox
                  label="Boss Encounters"
                  current={encounteredBossCount}
                  total={totalBosses}
                  color="#ef4444"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

export default React.memo(Encyclopedia, (prev, next) => {
  return prev.stats === next.stats;
});
