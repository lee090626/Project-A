import React, { useState, useMemo, useCallback } from 'react';

import { PlayerStats } from '@/shared/types/game';
import { MINERALS } from '@/shared/config/mineralData';
import { MONSTER_LIST } from '@/shared/config/monsterData';
import { CIRCLES } from '@/shared/config/circleData';
import AtlasIcon from '../hud/ui/AtlasIcon';
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
        name: m.nameKo || m.name,
        icon: m.imagePath,
        depth: circle ? circle.depthEnd : 0,
        description: m.description,
        imagePath: m.imagePath,
        stats: m.stats,
      };
    });
  }, []);

  const discoveredCount = stats.discoveredMinerals.length;
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
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">📖</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-purple-400 leading-none">
                Books
              </h2>
              <span className="text-[10px] text-zinc-600 font-bold tracking-widest mt-1">
                Discovery Archive
              </span>
            </div>
          </div>

          <EncyclopediaTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center justify-center gap-2 md:gap-4 bg-zinc-950 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-zinc-800 shadow-inner">
            <div className="flex items-center justify-center">
              <AtlasIcon name="GoldIcon" size={32} />
            </div>
            <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tighter">
              {stats.goldCoins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-purple-400 hover:text-black hover:border-purple-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

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
        <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 h-auto lg:h-full flex flex-col bg-[#252526] rounded-2xl md:rounded-4xl p-5 md:p-8 border border-zinc-800 relative shadow-2xl overflow-y-auto custom-scrollbar min-h-0">
          {selectedId ? (
            <EncyclopediaDetail id={selectedId} tab={activeTab} stats={stats} bossesData={bossesData} />
          ) : (
            <div className="h-full py-8 md:py-0 flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-6xl mb-4 md:mb-6 opacity-20 animate-pulse">📡</div>
              <h3 className="text-base md:text-lg font-black text-zinc-700 tracking-widest">
                Scanning Database...
              </h3>
              <p className="text-[9px] md:text-[10px] text-zinc-800 mt-2 font-bold tracking-widest">
                Select an entry for analysis
              </p>

              <div className="mt-8 md:mt-12 w-full space-y-3">
                <ProgressBox
                  label="Minerals Discovery"
                  current={discoveredCount}
                  total={totalMinerals}
                  color="#a855f7"
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
    </div>
  );
}

export default React.memo(Encyclopedia, (prev, next) => {
  return prev.stats === next.stats;
});
