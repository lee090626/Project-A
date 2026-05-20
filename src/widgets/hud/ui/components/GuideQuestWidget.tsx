import React, { useMemo } from 'react';
import {
  formatGuideQuestReward,
  getActiveGuideQuest,
  getGuideQuestProgress,
} from '@/shared/config/guideQuestData';
import { PlayerStats } from '@/shared/types/game';

interface GuideQuestWidgetProps {
  stats: PlayerStats;
}

/**
 * 현재 C2 가이드 목표를 플레이필드를 가리지 않는 작은 HUD 칩으로 표시합니다.
 */
export const GuideQuestWidget: React.FC<GuideQuestWidgetProps> = React.memo(({ stats }) => {
  const quest = getActiveGuideQuest(stats.guideQuest);
  const progress = useMemo(
    () => (quest ? getGuideQuestProgress(stats, quest) : null),
    [quest, stats],
  );

  if (!quest || !progress) return null;

  const ratio = progress.target > 0 ? Math.min(1, progress.current / progress.target) : 0;
  const rewardText = formatGuideQuestReward(quest.reward);
  const progressText = quest.unit
    ? `${progress.current}${quest.unit} / ${progress.target}${quest.unit}`
    : `${progress.current} / ${progress.target}`;

  return (
    <div className="pixel-panel pixel-font pixel-panel-muted pointer-events-none w-56 max-w-[calc(100vw-8rem)] px-3 py-2 md:w-64">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black text-[#38d5e8]">Guide</span>
        <span className="text-[10px] font-black text-white/80">{progressText}</span>
      </div>
      <div className="truncate text-xs font-black leading-4 text-white md:text-sm">
        {quest.title}
      </div>
      <div className="pixel-bar mt-2 h-2">
        <div
          className="pixel-bar-fill h-full bg-[#38d5e8] transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {rewardText && (
        <div className="mt-1 truncate text-[10px] font-bold text-amber-200/90">
          Reward {rewardText}
        </div>
      )}
    </div>
  );
});
