import React, { useCallback } from 'react';
import { PlayerStats } from '@/shared/types/game';
import { WindowFrame, WindowHeader } from '@/shared/ui/window';
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
    <WindowFrame>
      <WindowHeader
        icon={<span className="text-2xl md:text-3xl">👤</span>}
        title="Status"
        titleClassName="text-emerald-400"
        gold={stats.goldCoins}
        onClose={onClose}
        closeButtonClassName="hover:bg-emerald-400 hover:text-black hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/50"
      />

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
    </WindowFrame>
  );
}

export default React.memo(StatusWindow, (prev, next) => {
  return prev.stats === next.stats;
});
