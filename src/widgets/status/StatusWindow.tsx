import React, { useCallback } from 'react';
import { PlayerStats } from '@/shared/types/game';
import AtlasIcon from '@/widgets/hud/ui/AtlasIcon';
import { useStatusStats } from './useStatusStats';
import StatTooltip from './StatTooltip';

// 새롭게 분리된 하위 컴포넌트들
import StatSection from './components/StatSection';
import VitalityRelicSection from './components/VitalityRelicSection';
import GearRuneSection from './components/GearRuneSection';
import MasterySection from './components/MasterySection';

interface StatusWindowProps {
  stats: PlayerStats;
  onClose: () => void;
  onUnequipRune?: (drillId: string, slotIndex: number) => void;
  onEquipArtifact?: (id: string) => void;
}

/**
 * 플레이어의 상세 정보를 표시하는 상태창 컴포넌트입니다.
 * 각 섹션은 도메인별로 분리된 하위 컴포넌트로 구성됩니다.
 */
function StatusWindow({ stats, onClose, onUnequipRune }: StatusWindowProps) {
  const [hoveredTooltip, setHoveredTooltip] = React.useState<{
    type: 'perk' | 'stat';
    id: string;
    name: string;
    desc: string;
    details?: { label: string; value: string | number; color?: string }[];
    x: number;
    y: number;
  } | null>(null);

  const {
    equipped,
    finalPower,
    finalDefense,
    finalMaxHp,
    finalCritRate,
    finalCritDmg,
    finalMiningInterval,
    finalMoveSpeedMult,
    finalLuck,
    statBreakdowns,
  } = useStatusStats(stats);

  const handleStatHover = useCallback((e: React.MouseEvent, id: string, name: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const details = statBreakdowns[id];
    if (details) {
      setHoveredTooltip({
        type: 'stat',
        id,
        name,
        desc: '',
        details,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  }, [statBreakdowns]);

  const handleHoverPerk = useCallback(
    (e: React.MouseEvent, perkId: string, name: string, desc: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredTooltip({
        type: 'perk',
        id: perkId,
        name,
        desc,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    },
    [],
  );

  const onLeaveTooltip = useCallback(() => setHoveredTooltip(null), []);

  return (
    <div className="flex flex-col w-full h-full text-[#d1d5db] font-sans p-4 md:p-8 bg-[#1a1a1b] border border-zinc-800 rounded-xl md:rounded-3xl shadow-2xl relative overflow-hidden">
      {/* HEADER SECTION - Bento Style Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl">👤</span>
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-emerald-400 leading-none">
                Status
              </h2>
            </div>
          </div>
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
            className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-emerald-400 hover:text-black hover:border-emerald-400 transition-all active:scale-90 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
          >
            <span className="text-lg md:text-xl font-bold">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-8">
        {/* TOP SECTION: 3 COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* COLUMN 1: COMBAT & MINING */}
          <StatSection 
            stats={{
              power: finalPower,
              defense: finalDefense,
              maxHp: finalMaxHp,
              critRate: finalCritRate,
              critDmg: finalCritDmg,
              miningInterval: finalMiningInterval,
              moveSpeedMult: finalMoveSpeedMult,
              luck: finalLuck,
            }}
            onHoverStat={handleStatHover}
            onLeaveStat={onLeaveTooltip}
          />

          {/* COLUMN 2: HP & RECORDS */}
          <VitalityRelicSection 
            stats={stats}
            finalMaxHp={finalMaxHp}
          />

          {/* COLUMN 3: EQUIPPED HARDWARE (4-SLOT GRID) */}
          <GearRuneSection 
            equipped={equipped}
            stats={stats}
            onUnequipRune={onUnequipRune}
          />
        </div>

        {/* BOTTOM SECTION: TILE MASTERY (FULL WIDTH) */}
        <MasterySection 
          stats={stats}
          hoveredTooltipId={hoveredTooltip?.id}
          onHoverPerk={handleHoverPerk}
          onLeavePerk={onLeaveTooltip}
        />
      </div>

      <StatTooltip tooltip={hoveredTooltip} />
    </div>
  );
}

export default React.memo(StatusWindow, (prev, next) => {
  return prev.stats === next.stats;
});
