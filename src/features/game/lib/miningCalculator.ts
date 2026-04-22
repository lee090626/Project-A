import { PlayerStats, EquipmentPart } from '@/shared/types/game';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERAL_MAP } from '@/shared/config/mineralData';
import { COMBAT_CONSTANTS } from '@/shared/config/combatConstants';
import {
  getMasteryMultiplier,
  createInitialMasteryState,
  getMasteryBonuses,
} from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { calculateArtifactBonuses, hasArtifactEffect } from '@/shared/lib/artifactUtils';

/**
 * 채굴 대미지 계산 결과 인터페이스
 */
export interface DamageResult {
  finalDamage: number;
  totalPower: number;
  isCrit: boolean;
  attackInterval: number;
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
  const artifactBonuses = calculateArtifactBonuses(stats);
  const masteryBonuses = getMasteryBonuses(stats);

  // A. 유물 기반 동적 속도 배율
  const speedBoostFactor = artifactBonuses.speedMultiplier || 0;

  // 1. 공격 속도 계산 (상수화 적용)
  const baseInterval = COMBAT_CONSTANTS.BASE_MINING_INTERVAL;
  const runeSpeedBonus = getTotalRuneStat(stats, 'miningSpeed');
  const totalSpeedBonusMult = Math.min(
    COMBAT_CONSTANTS.MAX_ATTACK_SPEED_CAP,
    artifactBonuses.miningSpeed +
      runeSpeedBonus +
      masteryBonuses.miningSpeedMult +
      speedBoostFactor,
  );
  let attackInterval = baseInterval * (1 - totalSpeedBonusMult);

  // FATIGUE (피로): 채굴 속도 50% 감소
  if (stats.activeEffects?.some((e) => e.type === 'FATIGUE')) {
    attackInterval *= COMBAT_CONSTANTS.FATIGUE_COOLDOWN_MULTIPLIER;
  }

  // 2. 숙련도 배율 계산 (기본 숙련도 레벨 보너스)
  const tileMastery =
    (stats.tileMastery && stats.tileMastery[targetTileType]) ||
    createInitialMasteryState(targetTileType);
  const masteryMult = getMasteryMultiplier(tileMastery.level);

  // 3. 룬 보너스 및 치명타 계산
  const runeAttackBonus = getTotalRuneStat(stats, 'power');
  const baseCritRate = 0; // 행운은 크리티컬 확률에 영향을 주지 않음
  const critRate = Math.min(COMBAT_CONSTANTS.MAX_CRIT_RATE_CAP, baseCritRate + getTotalRuneStat(stats, 'critRate'));
  const critDamage = COMBAT_CONSTANTS.BASE_CRIT_DAMAGE + getTotalRuneStat(stats, 'critDmg');

  // stats.power는 이미 statsSyncSystem에서 (기본20 + 장비파워)가 합산된 결과입니다.
  // 숙련도는 '기초 드릴 파워'에 비례하여 추가 보너스를 줍니다.
  const drillPower = currentDrill?.stats.power || 0;
  const tileMasteryBonus = Math.round(drillPower * (masteryMult - 1));

  // --- 최종 위력 계산 ---
  const basePower =
    stats.power +
    tileMasteryBonus +
    Math.floor(runeAttackBonus);

  const totalPowerMult = 1 + masteryBonuses.miningPowerMult;

  let totalPower = Math.floor(basePower * totalPowerMult);

  // 상태 이상에 따른 위력 변조
  if (stats.activeEffects) {
    if (stats.activeEffects.some((e) => e.type === 'BUFF_POWER'))
      totalPower = Math.floor(totalPower * COMBAT_CONSTANTS.BUFF_POWER_MULTIPLIER);
    if (stats.activeEffects.some((e) => e.type === 'WEAKEN'))
      totalPower = Math.floor(totalPower * COMBAT_CONSTANTS.WEAKEN_POWER_MULTIPLIER);
  }

  // B. 유물 기반 동적 대미지 배율 (TWISTED_PROJECTION 등)
  const damageBoostFactor = artifactBonuses.damageMultiplier || 0;
  if (damageBoostFactor > 0) {
    totalPower = Math.floor(totalPower * (1 + damageBoostFactor));
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

