import { EQUIPMENTS } from './equipmentData';
import type { GuideQuestState, PlayerStats } from '../types/game';

export const C2_GUIDE_LUST_ORE_IDS = ['crimsonstone', 'galestone', 'fervorstone'] as const;
export const C2_GUIDE_MONSTER_IDS = ['c2_whisperer', 'c2_wind_soul', 'c2_gale_bat'] as const;
export const C2_GUIDE_ASMODEUS_ID = 'c2_asmodeus';
export const C2_GUIDE_MASTERY_SEAL_ID = 'mastery_seal';

const C2_GUIDE_COUNTER_LUST_ORES = 'lustOresCollected';
const C2_GUIDE_COUNTER_MONSTER_KILLS = 'lustMonstersDefeated';

export interface GuideQuestReward {
  goldCoins?: number;
  inventory?: Record<string, number>;
}

export interface GuideQuestDefinition {
  id: string;
  title: string;
  target: number;
  unit?: string;
  reward?: GuideQuestReward;
}

export const C2_GUIDE_QUESTS: GuideQuestDefinition[] = [
  {
    id: 'mine_lust_ore_1',
    title: 'Mine 1 Lust ore',
    target: 1,
    reward: { goldCoins: 50 },
  },
  {
    id: 'collect_lust_ores_10',
    title: 'Collect 10 Lust ores',
    target: 10,
    reward: {
      goldCoins: 250,
      inventory: { crimsonstone: 5, galestone: 3 },
    },
  },
  {
    id: 'craft_c2_equipment',
    title: 'Craft C2 equipment',
    target: 1,
    reward: { goldCoins: 200 },
  },
  {
    id: 'defeat_lust_monster_1',
    title: 'Defeat 1 Lust monster',
    target: 1,
    reward: {
      goldCoins: 250,
      inventory: { crimsonstone: 3, galestone: 2 },
    },
  },
  {
    id: 'descend_100m',
    title: 'Descend to 100m',
    target: 100,
    unit: 'm',
    reward: {
      goldCoins: 400,
      inventory: { crimsonstone: 5, galestone: 5, fervorstone: 4 },
    },
  },
  {
    id: 'craft_mastery_seal',
    title: 'Craft Mastery Seal',
    target: 1,
    reward: { goldCoins: 250 },
  },
  {
    id: 'reach_250m',
    title: 'Reach 250m',
    target: 250,
    unit: 'm',
    reward: { goldCoins: 300 },
  },
  {
    id: 'find_asmodeus',
    title: 'Find Asmodeus',
    target: 1,
    reward: { goldCoins: 500 },
  },
];

export const C2_GUIDE_QUEST_IDS = C2_GUIDE_QUESTS.map((quest) => quest.id);
export const C2_GUIDE_QUEST_ID_SET = new Set(C2_GUIDE_QUEST_IDS);

const RESOURCE_LABELS: Record<string, string> = {
  goldCoins: 'Gold',
  crimsonstone: 'Crimsonstone',
  galestone: 'Galestone',
  fervorstone: 'Fervorstone',
};

/**
 * 플레이어의 현재 상태를 기준으로 가이드 퀘스트 관측값을 생성합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns 신규/기존 진행을 구분하기 위한 관측값
 */
export function createGuideQuestObserved(stats?: PlayerStats): GuideQuestState['observed'] {
  return {
    lustOreTotal: stats ? getC2LustOreTotal(stats) : 0,
    c2MonsterKills: stats ? getC2MonsterKillCount(stats) : 0,
    c2EquipmentCount: stats ? getC2EquipmentCount(stats) : 0,
    masterySealStack: stats ? getMasterySealStack(stats) : 0,
    asmodeusEncountered: stats ? hasAsmodeusEncountered(stats) : false,
  };
}

/**
 * 신규 가이드 퀘스트 상태를 생성합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns 첫 목표부터 시작하는 가이드 퀘스트 상태
 */
export function createInitialGuideQuestState(stats?: PlayerStats): GuideQuestState {
  return {
    activeId: C2_GUIDE_QUESTS[0]?.id ?? null,
    completedIds: [],
    claimedRewardIds: [],
    counters: {},
    observed: createGuideQuestObserved(stats),
  };
}

/**
 * 이미 완료된 가이드 퀘스트 상태를 생성합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns 모든 목표와 보상이 완료 처리된 가이드 상태
 */
export function createCompletedGuideQuestState(stats?: PlayerStats): GuideQuestState {
  return {
    activeId: null,
    completedIds: [...C2_GUIDE_QUEST_IDS],
    claimedRewardIds: [...C2_GUIDE_QUEST_IDS],
    counters: {
      [C2_GUIDE_COUNTER_LUST_ORES]: 10,
      [C2_GUIDE_COUNTER_MONSTER_KILLS]: 1,
    },
    observed: createGuideQuestObserved(stats),
  };
}

/**
 * 현재 활성화된 가이드 목표 정의를 반환합니다.
 *
 * @param state - 가이드 퀘스트 상태
 * @returns 활성 목표 정의 또는 null
 */
export function getActiveGuideQuest(state?: GuideQuestState): GuideQuestDefinition | null {
  if (!state?.activeId) return null;
  return C2_GUIDE_QUESTS.find((quest) => quest.id === state.activeId) ?? null;
}

/**
 * 주어진 목표의 현재 진행도를 계산합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @param quest - 목표 정의
 * @returns 현재 진행도와 목표치
 */
export function getGuideQuestProgress(
  stats: PlayerStats,
  quest: GuideQuestDefinition,
): { current: number; target: number } {
  const counters = stats.guideQuest?.counters ?? {};

  switch (quest.id) {
    case 'mine_lust_ore_1':
    case 'collect_lust_ores_10':
      return {
        current: Math.min(counters[C2_GUIDE_COUNTER_LUST_ORES] || 0, quest.target),
        target: quest.target,
      };
    case 'craft_c2_equipment':
      return { current: getC2EquipmentCount(stats) > 0 ? 1 : 0, target: quest.target };
    case 'defeat_lust_monster_1':
      return {
        current: Math.min(
          Math.max(counters[C2_GUIDE_COUNTER_MONSTER_KILLS] || 0, getC2MonsterKillCount(stats)),
          quest.target,
        ),
        target: quest.target,
      };
    case 'descend_100m':
    case 'reach_250m':
      return {
        current: Math.min(Math.max(0, Math.floor(stats.maxDepthReached || 0)), quest.target),
        target: quest.target,
      };
    case 'craft_mastery_seal':
      return { current: getMasterySealStack(stats) > 0 ? 1 : 0, target: quest.target };
    case 'find_asmodeus':
      return { current: hasAsmodeusEncountered(stats) ? 1 : 0, target: quest.target };
    default:
      return { current: 0, target: quest.target };
  }
}

/**
 * 가이드 퀘스트 보상을 짧은 텍스트로 포맷합니다.
 *
 * @param reward - 목표 완료 보상
 * @returns HUD에 표시할 보상 요약
 */
export function formatGuideQuestReward(reward?: GuideQuestReward): string {
  if (!reward) return '';

  const parts: string[] = [];
  if (reward.goldCoins) {
    parts.push(`+${reward.goldCoins}G`);
  }

  Object.entries(reward.inventory ?? {}).forEach(([id, amount]) => {
    if (amount > 0) {
      parts.push(`+${amount} ${RESOURCE_LABELS[id] ?? id}`);
    }
  });

  return parts.join(' ');
}

/**
 * 현재 보유한 C2 광물 총량을 반환합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns C2 광물 보유량 합계
 */
export function getC2LustOreTotal(stats: PlayerStats): number {
  return C2_GUIDE_LUST_ORE_IDS.reduce(
    (total, id) => total + Math.max(0, stats.inventory?.[id] || 0),
    0,
  );
}

/**
 * C2 일반몹 처치 기록 수를 반환합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns C2 일반몹 처치 기록 수
 */
export function getC2MonsterKillCount(stats: PlayerStats): number {
  const killedMonsterIds = Array.isArray(stats.killedMonsterIds) ? stats.killedMonsterIds : [];
  return killedMonsterIds.filter((id) => C2_GUIDE_MONSTER_IDS.includes(id as any)).length;
}

/**
 * 보유한 C2 장비 수를 반환합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns C2 장비 보유 수
 */
export function getC2EquipmentCount(stats: PlayerStats): number {
  const ownedEquipmentIds = Array.isArray(stats.ownedEquipmentIds) ? stats.ownedEquipmentIds : [];
  return ownedEquipmentIds.filter((id) => EQUIPMENTS[id]?.circle === 2).length;
}

/**
 * 숙련의 인장 보유 스택 수를 반환합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns 숙련의 인장 보유 수
 */
export function getMasterySealStack(stats: PlayerStats): number {
  return Math.max(0, stats.collectionHistory?.[C2_GUIDE_MASTERY_SEAL_ID] || 0);
}

/**
 * 아스모데우스 조우 여부를 반환합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns 조우 기록이 있으면 true
 */
export function hasAsmodeusEncountered(stats: PlayerStats): boolean {
  return Array.isArray(stats.encounteredBossIds) &&
    stats.encounteredBossIds.includes(C2_GUIDE_ASMODEUS_ID);
}

/**
 * 가이드 퀘스트가 없는 기존 세이브를 완료 처리할지 판정합니다.
 *
 * @param stats - 플레이어 진행 상태
 * @returns C2 후반 이상이면 true
 */
export function shouldSkipGuideForLegacySave(stats: PlayerStats): boolean {
  return (stats.maxDepthReached || 0) >= 250 ||
    (stats.depth || 0) >= 250 ||
    hasAsmodeusEncountered(stats);
}

export const GUIDE_COUNTER_KEYS = {
  lustOres: C2_GUIDE_COUNTER_LUST_ORES,
  monsterKills: C2_GUIDE_COUNTER_MONSTER_KILLS,
} as const;
