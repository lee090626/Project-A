import { COMBAT_CONSTANTS } from '@/shared/config/combatConstants';
import { calculateEffectBonuses, type EffectBonuses } from '@/shared/lib/effectItemUtils';
import { getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { PlayerStats } from '@/shared/types/game';
import { modifierManager } from './ModifierManager';

/**
 * 플레이어의 현재 치명타 관련 최종 수치를 나타냅니다.
 */
export interface CriticalStats {
  /** 최종 치명타 확률 (0~1) */
  critRate: number;
  /** 최종 치명타 피해 배율 */
  critDamage: number;
}

/**
 * 플레이어의 현재 채굴 속도 관련 계산 결과입니다.
 */
export interface MiningSpeedStats {
  /** 기준 채굴 간격 */
  baseInterval: number;
  /** 마스터리에서 오는 채굴 속도 배율 */
  masterySpeedBonusMult: number;
  /** Effect 기본 보너스에서 오는 채굴 속도 배율 */
  effectSpeedBonus: number;
  /** 모디파이어가 추가로 더한 채굴 속도 배율 */
  modifierSpeedBonus: number;
  /** 상한 적용 후 최종 채굴 속도 배율 */
  totalSpeedBonusMult: number;
  /** 피로 상태까지 반영한 최종 채굴 간격 */
  attackInterval: number;
}

/**
 * 플레이어의 현재 행운 관련 최종 수치를 나타냅니다.
 */
export interface LuckStats {
  /** 고정 보너스를 합산한 배율 적용 전 행운 */
  flatLuck: number;
  /** 마스터리로 얻는 행운 배율 */
  luckMultiplier: number;
  /** 최종 행운 */
  finalLuck: number;
}

type LuckMasteryBonuses = Pick<ReturnType<typeof getMasteryBonuses>, 'luck' | 'luckMult'>;
type LuckEffectBonuses = Pick<EffectBonuses, 'luck'>;

/**
 * 플레이어 스탯을 기준으로 실제 전투에 사용되는 치명타 수치를 계산합니다.
 *
 * @param stats - 현재 플레이어 스탯
 * @returns 최종 치명타 확률과 피해 배율
 */
export function calculateCriticalStats(stats: PlayerStats): CriticalStats {
  const effectBonuses = calculateEffectBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);

  const critRate = Math.min(
    COMBAT_CONSTANTS.MAX_CRIT_RATE_CAP,
    masteryBonuses.critRate + effectBonuses.critRate,
  );
  const critDamage =
    COMBAT_CONSTANTS.BASE_CRIT_DAMAGE +
    masteryBonuses.critDmg +
    effectBonuses.critDamage;

  return {
    critRate,
    critDamage,
  };
}

/**
 * 플레이어 스탯을 기준으로 실제 채굴 간격과 속도 배율 구성 요소를 계산합니다.
 *
 * @param stats - 현재 플레이어 스탯
 * @returns 채굴 속도 계산 상세 정보
 */
export function calculateMiningSpeedStats(stats: PlayerStats): MiningSpeedStats {
  const effectBonuses = calculateEffectBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);
  const baseInterval = COMBAT_CONSTANTS.BASE_MINING_INTERVAL;

  const rawSpeedBonusMult =
    effectBonuses.miningSpeed + masteryBonuses.miningSpeedMult;
  const modifiedSpeedBonusMult = modifierManager.applyAll(
    'onMining',
    'miningSpeed',
    rawSpeedBonusMult,
    { playerStats: stats },
  );
  const totalSpeedBonusMult = Math.min(
    COMBAT_CONSTANTS.MAX_ATTACK_SPEED_CAP,
    modifiedSpeedBonusMult,
  );

  let attackInterval = baseInterval * (1 - totalSpeedBonusMult);
  if (stats.activeEffects?.some((effect) => effect.type === 'FATIGUE')) {
    attackInterval *= COMBAT_CONSTANTS.FATIGUE_COOLDOWN_MULTIPLIER;
  }

  return {
    baseInterval,
    masterySpeedBonusMult: masteryBonuses.miningSpeedMult,
    effectSpeedBonus: effectBonuses.miningSpeed,
    modifierSpeedBonus: modifiedSpeedBonusMult - rawSpeedBonusMult,
    totalSpeedBonusMult,
    attackInterval,
  };
}

/**
 * 플레이어 스탯을 기준으로 실제 보상 계산에 사용되는 최종 행운을 계산합니다.
 *
 * @param stats - 현재 플레이어 스탯
 * @returns 행운 계산 상세 정보
 */
export function calculateLuckStats(stats: PlayerStats): LuckStats {
  const effectBonuses = calculateEffectBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);

  return calculateLuckStatsFromBonuses(masteryBonuses, effectBonuses);
}

/**
 * 이미 계산된 mastery 및 Effect 보너스를 기준으로 최종 행운을 계산합니다.
 */
export function calculateLuckStatsFromBonuses(
  masteryBonuses: LuckMasteryBonuses,
  effectBonuses: LuckEffectBonuses,
): LuckStats {
  const flatLuck = masteryBonuses.luck + effectBonuses.luck * 100;
  const luckMultiplier = 1 + masteryBonuses.luckMult;
  const finalLuck = Math.max(0, flatLuck * luckMultiplier);

  return {
    flatLuck,
    luckMultiplier,
    finalLuck,
  };
}
