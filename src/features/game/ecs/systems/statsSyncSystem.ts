import { EQUIPMENTS } from '@/shared/config/equipmentData';
import {
  BASE_PLAYER_MAX_HP,
  BASE_PLAYER_MOVE_SPEED,
  BASE_PLAYER_POWER,
} from '@/shared/config/playerConstants';
import { getRefinedEquipmentStats } from '@/shared/lib/equipmentRefinement';
import { createInitialEquipmentState, getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { calculateEffectBonuses } from '@/shared/lib/effectItemUtils';
import { calculateLuckStatsFromBonuses } from '@/features/game/lib/playerCombatStats';

/**
 * 플레이어의 영구 스탯(체력, 이속 등)을 장비, 마스터리 및 Effect 보너스에 맞춰 동기화합니다.
 */
export function syncPermanentStats(player: any) {
  const masteryBonuses = getMasteryBonuses(player.stats);
  const effectBonuses = calculateEffectBonuses(player.stats);

  // 1. 장착 데이터 안전 추출 (레거시 데이터 대응)
  let { equipment } = player.stats;
  
  // 데이터 마이그레이션: 구버전 세이브 유저를 위해 필드가 없을 경우 자동 생성
  if (!equipment) {
    player.stats.equipment = {
      drillId: player.stats.equippedDrillId || null,
      helmetId: null,
      armorId: null,
      bootsId: null,
    };
    equipment = player.stats.equipment;
  }

  // 기타 누락된 컬렉션들 자동 복구
  if (!player.stats.ownedEquipmentIds) {
    player.stats.ownedEquipmentIds = player.stats.ownedDrillIds || [];
  }
  if (!player.stats.equipmentStates) {
    player.stats.equipmentStates = {};
  }
  if (!Array.isArray(player.stats.unlockedWaypoints)) {
    player.stats.unlockedWaypoints = [0];
  }
  if (!player.stats.unlockedWaypoints.includes(0)) {
    player.stats.unlockedWaypoints.push(0);
  }
  if (player.stats.defense === undefined) player.stats.defense = 0;
  if (player.stats.luck === undefined) player.stats.luck = 0;

  // 1. 장비 스탯 합계 계산 (초기값 0)
  let eqPower = 0;
  let eqMaxHp = 0;
  let eqMoveSpeed = 0;
  let eqDefense = 0;

  // 각 슬롯별 장착품 ID 수집
  const slotIds = [equipment.drillId, equipment.helmetId, equipment.armorId, equipment.bootsId];

  slotIds.forEach((id) => {
    if (!id) return;
    const eq = EQUIPMENTS[id];
    if (!eq) return;
    if (!player.stats.equipmentStates[id]) {
      player.stats.equipmentStates[id] = createInitialEquipmentState(id);
    }

    const refinedStats = getRefinedEquipmentStats(eq, player.stats.equipmentStates[id]);

    if (refinedStats.power) eqPower += refinedStats.power;
    if (refinedStats.maxHp) eqMaxHp += refinedStats.maxHp;
    if (refinedStats.moveSpeed) eqMoveSpeed += refinedStats.moveSpeed;
    if (refinedStats.defense) eqDefense += refinedStats.defense;
  });

  // 2. 최대 체력 동기화: (기본 체력 + 장비HP + 마스터리고정 + Effect 고정) * (1 + 마스터리배율)
  const baseHp = BASE_PLAYER_MAX_HP + eqMaxHp + masteryBonuses.maxHp + (effectBonuses?.maxHp || 0);
  const finalMaxHp = Math.floor(baseHp * (1 + masteryBonuses.maxHpMult));

  // Max HP가 변경되었을 때만 현재 HP를 비율에 맞춰 조정 (매 프레임 재계산 시 정밀도 문제로 회복이 씹히는 현상 방지)
  if (player.stats.maxHp !== finalMaxHp) {
    const hpRatio = player.stats.maxHp > 0 ? player.stats.hp / player.stats.maxHp : 1;
    player.stats.maxHp = finalMaxHp;
    player.stats.hp = Math.floor(finalMaxHp * hpRatio);
  }

  // 3. 이동 속도 동기화: (기본 이속 + 장비이속 + Effect 이속) * (기본 배율 1.0 + 마스터리 배율)
  const baseMoveSpeed =
    BASE_PLAYER_MOVE_SPEED + eqMoveSpeed + (effectBonuses?.moveSpeed || 0) + masteryBonuses.moveSpeed;
  const totalMoveSpeedMult = 1.0 + masteryBonuses.moveSpeedMult;
  player.stats.moveSpeed = Math.floor(baseMoveSpeed * totalMoveSpeedMult);

  // 4. 공격력(Power) 동기화: (기본 위력 + 장비Power + 숙련도 공격력) + Effect 공격력
  player.stats.power =
    BASE_PLAYER_POWER + eqPower + (masteryBonuses.miningPower || 0) + (effectBonuses?.power || 0);

  // 5. 방어력 적용 (장비방어 + Effect 방어)
  player.stats.defense = eqDefense + (effectBonuses?.defense || 0);

  // 6. 행운(Luck) 적용: 최종 보상 계산에 쓰는 단일 행운 값
  player.stats.luck = calculateLuckStatsFromBonuses(masteryBonuses, effectBonuses).finalLuck;
}

/**
 * 매 프레임 호출되어 플레이어의 스탯을 최신 보너스 상태와 동기화하는 시스템입니다.
 */
export const statsSyncSystem = (player: any) => {
  syncPermanentStats(player);
};
