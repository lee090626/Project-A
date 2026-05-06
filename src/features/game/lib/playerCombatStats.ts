import { COMBAT_CONSTANTS } from '@/shared/config/combatConstants';
import { calculateArtifactBonuses } from '@/shared/lib/artifactUtils';
import { getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { PlayerStats } from '@/shared/types/game';

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
 * 플레이어 스탯을 기준으로 실제 전투에 사용되는 치명타 수치를 계산합니다.
 *
 * @param stats - 현재 플레이어 스탯
 * @returns 최종 치명타 확률과 피해 배율
 */
export function calculateCriticalStats(stats: PlayerStats): CriticalStats {
  const artifactBonuses = calculateArtifactBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);
  const runeCritRate = getTotalRuneStat(stats, 'critRate');
  const runeCritDmg = getTotalRuneStat(stats, 'critDmg');

  const critRate = Math.min(
    COMBAT_CONSTANTS.MAX_CRIT_RATE_CAP,
    runeCritRate + masteryBonuses.critRate + artifactBonuses.critRate,
  );
  const critDamage =
    COMBAT_CONSTANTS.BASE_CRIT_DAMAGE +
    runeCritDmg +
    masteryBonuses.critDmg +
    artifactBonuses.critDamage;

  return {
    critRate,
    critDamage,
  };
}
