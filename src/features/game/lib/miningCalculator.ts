import { PlayerStats } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERAL_MAP } from '@/shared/config/mineralData';
import { COMBAT_CONSTANTS } from '@/shared/config/combatConstants';
import { CIRCLES } from '@/shared/config/circleData';
import {
  BOSS_RELIC_DEFENSE_IGNORE_CAP,
  BOSS_RELIC_DEFENSE_IGNORE_PER_STACK,
  BOSS_RELIC_DEFENSE_IGNORE_RULES,
} from '@/shared/config/effects/relics';
import {
  getMasteryMultiplier,
  createInitialMasteryState,
  getMasteryBonuses,
} from '@/shared/lib/masteryUtils';
import { getEffectStackByEffectId } from '@/shared/lib/effectItemUtils';
import { calculateCriticalStats, calculateMiningSpeedStats } from './playerCombatStats';

/**
 * 채굴 대미지 계산 결과 인터페이스
 */
export interface DamageResult {
  finalDamage: number;
  totalPower: number;
  isCrit: boolean;
  attackInterval: number;
}

const bossRelicDefenseIgnoreTargets = BOSS_RELIC_DEFENSE_IGNORE_RULES.map((rule) => ({
  effectId: rule.effectId,
  targetMinerals: new Set<string>(
    CIRCLES.find((circle) => circle.id === rule.targetCircleId)?.minerals.map(
      (mineralRule) => mineralRule.type,
    ) ?? [],
  ),
}));

/**
 * 보스 relic 중첩에 따라 다음 Circle 광물 방어력 무시 효과를 적용합니다.
 *
 * @param stats - 현재 플레이어 스탯
 * @param targetTileType - 현재 채굴 대상 타일 타입
 * @param defense - 보정 전 대상 방어력
 * @returns 보스 relic 효과가 반영된 최종 방어력
 */
function applyBossRelicDefenseIgnore(
  stats: PlayerStats,
  targetTileType: string,
  defense: number,
): number {
  const ignoreRate = bossRelicDefenseIgnoreTargets.reduce((total, rule) => {
    if (!rule.targetMinerals.has(targetTileType)) return total;

    const stacks = getEffectStackByEffectId(stats, rule.effectId);
    if (stacks <= 0) return total;

    return total + Math.min(
      stacks * BOSS_RELIC_DEFENSE_IGNORE_PER_STACK,
      BOSS_RELIC_DEFENSE_IGNORE_CAP,
    );
  }, 0);

  if (ignoreRate <= 0) return defense;

  return defense * (1 - Math.min(ignoreRate, 1));
}

/**
 * 플레이어의 현재 스탯과 장비를 기반으로 채굴 대미지를 계산합니다.
 */
export const calculateMiningDamage = (
  stats: PlayerStats,
  targetTileType: string,
  customDefense?: number,
): DamageResult => {
  const currentDrill = stats.equipment.drillId ? EQUIPMENTS[stats.equipment.drillId] : null;
  const masteryBonuses = getMasteryBonuses(stats);

  // 1. 공격 속도 배율 계산
  const { attackInterval } = calculateMiningSpeedStats(stats);

  // 2. 숙련도 배율 계산 (기본 숙련도 레벨 보너스)
  const tileMastery =
    (stats.tileMastery && stats.tileMastery[targetTileType]) ||
    createInitialMasteryState(targetTileType);
  const masteryMult = getMasteryMultiplier(tileMastery.level);

  // 3. 치명타 계산
  const { critRate, critDamage } = calculateCriticalStats(stats);

  // stats.power는 이미 statsSyncSystem에서 (기본20 + 장비파워)가 합산된 결과입니다.
  // 숙련도는 '기초 드릴 파워'에 비례하여 추가 보너스를 줍니다.
  const drillPower = currentDrill?.stats.power || 0;
  const tileMasteryBonus = Math.round(drillPower * (masteryMult - 1));

  // --- 최종 위력 계산 ---
  const basePower =
    stats.power +
    tileMasteryBonus;

  const totalPowerMult = 1 + masteryBonuses.miningPowerMult;

  let totalPower = Math.floor(basePower * totalPowerMult);

  // 상태 이상에 따른 위력 변조
  if (stats.activeEffects) {
    if (stats.activeEffects.some((e) => e.type === 'BUFF_POWER'))
      totalPower = Math.floor(totalPower * COMBAT_CONSTANTS.BUFF_POWER_MULTIPLIER);
    if (stats.activeEffects.some((e) => e.type === 'WEAKEN'))
      totalPower = Math.floor(totalPower * COMBAT_CONSTANTS.WEAKEN_POWER_MULTIPLIER);
  }

  let isCrit = false;
  if (Math.random() < critRate) {
    totalPower = Math.floor(totalPower * critDamage);
    isCrit = true;
  }

  // 4. 방어력 적용 및 최종 대미지 (지수 공식)
  let defense = customDefense !== undefined ? customDefense : 0;
  if (customDefense === undefined) {
    const mineralDef = MINERAL_MAP[targetTileType];
    defense = mineralDef ? mineralDef.defense : 0;
    defense = applyBossRelicDefenseIgnore(stats, targetTileType, defense);
  }

  const netPower = Math.max(0, totalPower - defense);
  const exponent = COMBAT_CONSTANTS.DEFENSE_EXPONENT;
  const finalDamage = Math.floor(Math.pow(netPower, exponent));

  return {
    finalDamage,
    totalPower,
    isCrit,
    attackInterval,
  };
};
