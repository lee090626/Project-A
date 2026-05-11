import { GameWorld } from '@/entities/world/model';
import {
  C2_GUIDE_QUESTS,
  GUIDE_COUNTER_KEYS,
  createCompletedGuideQuestState,
  createInitialGuideQuestState,
  formatGuideQuestReward,
  getC2EquipmentCount,
  getC2LustOreTotal,
  getC2MonsterKillCount,
  getGuideQuestProgress,
  getMasterySealStack,
  hasAsmodeusEncountered,
  shouldSkipGuideForLegacySave,
  type GuideQuestDefinition,
  type GuideQuestReward,
} from '@/shared/config/guideQuestData';
import { PlayerStats } from '@/shared/types/game';
import { showToast } from './toastSystem';

/**
 * C2 초반 가이드 퀘스트의 진행, 완료, 보상 지급을 처리합니다.
 *
 * @param world - 현재 게임 월드
 */
export const guideQuestSystem = (world: GameWorld) => {
  const stats = world.player.stats;
  const state = ensureGuideQuestState(stats);
  if (!state.activeId) return;

  updateGuideQuestObservations(stats);

  for (let guard = 0; guard < C2_GUIDE_QUESTS.length; guard++) {
    const quest = C2_GUIDE_QUESTS.find((entry) => entry.id === state.activeId);
    if (!quest) {
      state.activeId = null;
      return;
    }

    const progress = getGuideQuestProgress(stats, quest);
    if (progress.current < progress.target) return;

    completeGuideQuest(stats, quest);
    state.activeId = getNextGuideQuestId(stats, quest.id);

    if (!state.activeId) {
      showToast('C2 guide complete', 'success', 2600);
      return;
    }
  }
};

/**
 * 가이드 퀘스트 상태를 보장하고, 기존 후반 세이브는 완료 처리합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns 보정된 가이드 퀘스트 상태
 */
function ensureGuideQuestState(stats: PlayerStats) {
  if (!stats.guideQuest) {
    stats.guideQuest = shouldSkipGuideForLegacySave(stats)
      ? createCompletedGuideQuestState(stats)
      : createInitialGuideQuestState(stats);
  }

  const state = stats.guideQuest;
  if (!state.activeId && state.completedIds.length < C2_GUIDE_QUESTS.length) {
    state.activeId = getNextGuideQuestId(stats, null);
  }

  return state;
}

/**
 * 현재 진행 상태를 관측하고 증가분 기반 카운터를 갱신합니다.
 *
 * @param stats - 플레이어 진행 상태
 */
function updateGuideQuestObservations(stats: PlayerStats): void {
  const state = stats.guideQuest;
  if (!state) return;

  const currentOreTotal = getC2LustOreTotal(stats);
  const previousOreTotal = toNumber(state.observed.lustOreTotal);
  if (currentOreTotal > previousOreTotal) {
    addCounter(stats, GUIDE_COUNTER_KEYS.lustOres, currentOreTotal - previousOreTotal);
  }
  state.observed.lustOreTotal = currentOreTotal;

  const currentMonsterKills = getC2MonsterKillCount(stats);
  const previousMonsterKills = toNumber(state.observed.c2MonsterKills);
  if (currentMonsterKills > previousMonsterKills) {
    addCounter(stats, GUIDE_COUNTER_KEYS.monsterKills, currentMonsterKills - previousMonsterKills);
  }
  state.observed.c2MonsterKills = currentMonsterKills;

  state.observed.c2EquipmentCount = getC2EquipmentCount(stats);
  state.observed.masterySealStack = getMasterySealStack(stats);
  state.observed.asmodeusEncountered = hasAsmodeusEncountered(stats);
}

/**
 * 특정 가이드 목표를 완료 처리하고 보상을 지급합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @param quest - 완료할 목표 정의
 */
function completeGuideQuest(stats: PlayerStats, quest: GuideQuestDefinition): void {
  const state = stats.guideQuest;
  if (!state) return;

  if (!state.completedIds.includes(quest.id)) {
    state.completedIds.push(quest.id);
  }

  if (!state.claimedRewardIds.includes(quest.id)) {
    applyGuideQuestReward(stats, quest.reward);
    state.claimedRewardIds.push(quest.id);

    const rewardText = formatGuideQuestReward(quest.reward);
    showToast(
      rewardText ? `Guide complete: ${quest.title} (${rewardText})` : `Guide complete: ${quest.title}`,
      'success',
      2600,
    );
  }
}

/**
 * 완료되지 않은 다음 목표 ID를 반환합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @param currentId - 방금 완료한 목표 ID
 * @returns 다음 목표 ID 또는 null
 */
function getNextGuideQuestId(stats: PlayerStats, currentId: string | null): string | null {
  const completedIds = stats.guideQuest?.completedIds ?? [];
  const currentIndex = currentId
    ? C2_GUIDE_QUESTS.findIndex((quest) => quest.id === currentId)
    : -1;

  for (let i = currentIndex + 1; i < C2_GUIDE_QUESTS.length; i++) {
    if (!completedIds.includes(C2_GUIDE_QUESTS[i].id)) {
      return C2_GUIDE_QUESTS[i].id;
    }
  }

  return null;
}

/**
 * 가이드 목표 보상을 플레이어에게 지급합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @param reward - 지급할 보상
 */
function applyGuideQuestReward(stats: PlayerStats, reward?: GuideQuestReward): void {
  if (!reward) return;

  if (reward.goldCoins) {
    stats.goldCoins = (stats.goldCoins || 0) + reward.goldCoins;
  }

  Object.entries(reward.inventory ?? {}).forEach(([id, amount]) => {
    if (amount <= 0) return;
    stats.inventory[id] = (stats.inventory[id] || 0) + amount;
  });
}

/**
 * 가이드 카운터를 안전하게 증가시킵니다.
 *
 * @param stats - 플레이어 진행 상태
 * @param key - 카운터 키
 * @param amount - 증가량
 */
function addCounter(stats: PlayerStats, key: string, amount: number): void {
  if (!stats.guideQuest) return;
  stats.guideQuest.counters[key] = (stats.guideQuest.counters[key] || 0) + amount;
}

/**
 * 관측값을 숫자로 변환합니다.
 *
 * @param value - 관측값
 * @returns 숫자 관측값
 */
function toNumber(value: number | boolean | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
