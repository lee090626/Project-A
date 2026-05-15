import { Equipment, EquipmentPart, EquipmentState, EquipmentStats } from '../types/game';
import { UNRELEASED_CIRCLE_REROLL_COST } from '../config/lateCircleLock';

export const EQUIPMENT_MAIN_STAT_BONUS_MIN = -20;
export const EQUIPMENT_MAIN_STAT_BONUS_MAX = 20;

const EQUIPMENT_MAIN_STAT_BY_PART: Record<EquipmentPart, keyof EquipmentStats> = {
  Drill: 'power',
  Helmet: 'defense',
  Armor: 'maxHp',
  Boots: 'moveSpeed',
};

const REROLL_COST_BY_CIRCLE: Record<number, number> = {
  2: 500,
  3: 2500,
  4: 8000,
  5: UNRELEASED_CIRCLE_REROLL_COST,
  6: UNRELEASED_CIRCLE_REROLL_COST,
  7: UNRELEASED_CIRCLE_REROLL_COST,
  8: UNRELEASED_CIRCLE_REROLL_COST,
  9: UNRELEASED_CIRCLE_REROLL_COST,
};

const BONUS_BUCKETS = [
  { min: -20, max: -16, weight: 3 },
  { min: -15, max: -11, weight: 7 },
  { min: -10, max: -6, weight: 15 },
  { min: -5, max: 5, weight: 50 },
  { min: 6, max: 10, weight: 15 },
  { min: 11, max: 15, weight: 7 },
  { min: 16, max: 20, weight: 3 },
];

/**
 * 장비 부위별 재련 대상 주스탯을 반환합니다.
 *
 * @param equipment - 주스탯을 확인할 장비 정의
 * @returns 장비 부위에 대응되는 주스탯 키
 */
export const getEquipmentMainStat = (equipment: Equipment): keyof EquipmentStats => {
  return EQUIPMENT_MAIN_STAT_BY_PART[equipment.part];
};

/**
 * 장비 주스탯 보정률을 안전한 범위로 제한합니다.
 *
 * @param value - 제한할 보정률
 * @returns -20~20 범위의 정수 보정률
 */
export const clampMainStatBonusPct = (value: unknown): number => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.max(
    EQUIPMENT_MAIN_STAT_BONUS_MIN,
    Math.min(EQUIPMENT_MAIN_STAT_BONUS_MAX, Math.trunc(numeric)),
  );
};

/**
 * 저장된 장비 재련 상태에서 주스탯 보정률을 읽습니다.
 *
 * @param state - 장비 재련 상태
 * @returns 정규화된 주스탯 보정률
 */
export const getMainStatBonusPct = (state?: Partial<EquipmentState> | null): number => {
  return clampMainStatBonusPct(state?.mainStatBonusPct);
};

/**
 * 현재 품질에서 다음 재련 시도에 필요한 골드를 계산합니다.
 *
 * @param equipment - 재련 대상 장비
 * @param currentBonusPct - 현재 주스탯 보정률
 * @returns 재련 시도 비용
 */
export const getEquipmentRerollCost = (
  equipment: Equipment,
  currentBonusPct: number = 0,
): number => {
  const baseCost =
    REROLL_COST_BY_CIRCLE[equipment.circle] ??
    Math.floor(500 * Math.max(1, equipment.circle - 1) ** 2.2);
  const qualityPremium = 1 + Math.max(0, clampMainStatBonusPct(currentBonusPct)) / 10;
  return Math.floor(baseCost * qualityPremium);
};

/**
 * 확률 가중치에 따라 새 주스탯 보정률을 산정합니다.
 *
 * @param random - 테스트에서 주입 가능한 0 이상 1 미만 난수 함수
 * @returns -20~20 범위의 정수 보정률
 */
export const rollEquipmentMainStatBonusPct = (random: () => number = Math.random): number => {
  const totalWeight = BONUS_BUCKETS.reduce((sum, bucket) => sum + bucket.weight, 0);
  let roll = random() * totalWeight;

  for (const bucket of BONUS_BUCKETS) {
    roll -= bucket.weight;
    if (roll <= 0) {
      return randomInt(bucket.min, bucket.max, random);
    }
  }

  const lastBucket = BONUS_BUCKETS[BONUS_BUCKETS.length - 1];
  return randomInt(lastBucket.min, lastBucket.max, random);
};

/**
 * 장비 주스탯 보정률에 대응되는 품질 라벨을 반환합니다.
 *
 * @param bonusPct - 장비 주스탯 보정률
 * @returns UI 표시용 품질 라벨
 */
export const getEquipmentQualityLabel = (bonusPct: number): string => {
  const clamped = clampMainStatBonusPct(bonusPct);
  if (clamped <= -11) return 'Low';
  if (clamped <= -1) return 'Below';
  if (clamped === 0) return 'Standard';
  if (clamped <= 10) return 'High';
  if (clamped <= 19) return 'Superior';
  return 'Perfect';
};

/**
 * 장비 정의와 재련 상태를 합산한 표시/계산용 스탯을 반환합니다.
 *
 * @param equipment - 기본 장비 정의
 * @param state - 장비 재련 상태
 * @returns 주스탯 보정이 반영된 장비 스탯
 */
export const getRefinedEquipmentStats = (
  equipment: Equipment,
  state?: Partial<EquipmentState> | null,
): EquipmentStats => {
  const mainStat = getEquipmentMainStat(equipment);
  const baseValue = equipment.stats[mainStat];
  if (typeof baseValue !== 'number') return { ...equipment.stats };

  const bonusPct = getMainStatBonusPct(state);
  return {
    ...equipment.stats,
    [mainStat]: Math.floor(baseValue * (1 + bonusPct / 100)),
  };
};

const randomInt = (min: number, max: number, random: () => number): number => {
  return Math.floor(random() * (max - min + 1)) + min;
};
