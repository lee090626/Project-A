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
    <div className="pointer-events-none w-56 max-w-[calc(100vw-8rem)] rounded-lg border border-cyan-300/25 bg-zinc-950/70 px-3 py-2 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.85)] backdrop-blur-md md:w-64">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black tracking-wide text-cyan-300">Guide</span>
        <span className="font-mono text-[10px] font-black text-white/80">{progressText}</span>
      </div>
      <div className="truncate text-xs font-black leading-4 text-white md:text-sm">
        {quest.title}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-md border border-white/10 bg-black/45">
        <div
          className="h-full rounded-md bg-linear-to-r from-cyan-400 to-emerald-300 transition-all duration-500"
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
