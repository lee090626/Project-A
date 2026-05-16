import { PlayerStats } from '../types/game';
import { EFFECT_DATA } from '../config/effectData';

/**
 * 보유형 Effect 시스템에 의해 계산된 보너스 스탯 인터페이스입니다.
 */
export interface EffectBonuses {
  maxHp: number;
  power: number;
  moveSpeed: number;
  luck: number;
  critRate: number;
  critDamage: number;
  defense: number;
  miningSpeed: number;
  masteryExp: number;
  masteryExpFlat: number;
}

const DEFAULT_EFFECT_STACK_LIMIT = 1000;

/**
 * 특정 특수 효과의 총 중첩(Stack) 수를 반환합니다.
 */
export function getEffectStackByEffectId(stats: PlayerStats, effectId: string): number {
  if (!stats.collectionHistory) return 0;

  let totalStack = 0;
  for (const [id, count] of Object.entries(stats.collectionHistory)) {
    const data = EFFECT_DATA[id];
    if (data && data.effectId === effectId) {
      totalStack += count;
    }
  }
  return totalStack;
}

/**
 * 특정 특수 효과가 활성화되어 있는지 확인합니다.
 */
export function hasEffectItemEffect(stats: PlayerStats, effectId: string): boolean {
  return getEffectStackByEffectId(stats, effectId) > 0;
}

/**
 * 특정 아이템 ID가 Effect 데이터에 존재하는지 확인합니다.
 */
export function isEffectItemId(itemId: string): boolean {
  return !!EFFECT_DATA[itemId];
}

/**
 * Effect 아이템의 최대 중첩 수량을 반환합니다.
 */
export function getEffectItemStackLimit(effectItemId: string): number {
  const effect = EFFECT_DATA[effectItemId];
  if (!effect) return Number.POSITIVE_INFINITY;
  return effect.maxStack ?? DEFAULT_EFFECT_STACK_LIMIT;
}

/**
 * Effect 아이템 스택을 상한선까지 안전하게 누적합니다.
 * @returns 실제로 증가한 스택 수량
 */
export function addEffectStack(stats: PlayerStats, effectItemId: string, amount: number): number {
  if (amount <= 0) return 0;
  if (!isEffectItemId(effectItemId)) return 0;

  if (!stats.collectionHistory) stats.collectionHistory = {};
  const current = stats.collectionHistory[effectItemId] || 0;
  const limit = getEffectItemStackLimit(effectItemId);
  const next = Math.min(limit, current + amount);
  const gained = Math.max(0, next - current);

  if (gained > 0) {
    stats.collectionHistory[effectItemId] = next;
  }

  return gained;
}

/**
 * 인벤토리 및 수집 기록을 기반으로 현재 적용 중인 총 Effect 보너스를 계산합니다.
 * @param stats 플레이어 정보
 * @returns 합산된 보너스 수치
 */
export function calculateEffectBonuses(stats: PlayerStats): EffectBonuses {
  const bonuses: EffectBonuses = {
    maxHp: 0,
    power: 0,
    moveSpeed: 0,
    luck: 0,
    critRate: 0,
    critDamage: 0,
    defense: 0,
    miningSpeed: 0,
    masteryExp: 0,
    masteryExpFlat: 0,
  };

  if (!stats.collectionHistory) return bonuses;

  // 1. 모든 Effect (Essence, Relic, Crafted) 보너스 통합 계산
  for (const [itemId, count] of Object.entries(stats.collectionHistory)) {
    const data = EFFECT_DATA[itemId];
    // 모든 Effect는 이제 stackable 타입을 전제로 함
    if (data && data.bonus) {
      const totalBonus = count * data.bonus.value;
      bonuses[data.bonus.stat] += totalBonus;
    }
  }

  return bonuses;
}

/**
 * 특정 스탯 명칭에 해당하는 Effect 보너스 값을 가져옵니다.
 */
export function getEffectStat(stats: PlayerStats, statName: keyof EffectBonuses): number {
  const allBonuses = calculateEffectBonuses(stats);
  return allBonuses[statName] || 0;
}
