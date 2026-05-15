import { GameWorld } from '@/entities/world/model';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { MINERAL_MAP } from '@/shared/config/mineralData';
import {
  EQUIPMENT_MAIN_STAT_BONUS_MAX,
  getEquipmentQualityLabel,
  getEquipmentRerollCost,
  getMainStatBonusPct,
  rollEquipmentMainStatBonusPct,
} from '@/shared/lib/equipmentRefinement';
import { messageBus, TOPIC } from '@/shared/lib/MessageBus';
import { createInitialEquipmentState } from '@/shared/lib/masteryUtils';
import { hasEffectItemEffect } from '@/shared/lib/effectItemUtils';
import type { CraftRequirements, PlayerStats } from '@/shared/types/game';
import { showToast } from '../toastSystem';

const EQUIPMENT_RESULT_KEYS = [
  'DrillId',
  'HelmetId',
  'ArmorId',
  'BootsId',
  'drillId',
  'helmetId',
  'armorId',
  'bootsId',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function getInventoryAmount(stats: PlayerStats, resource: string): number | undefined {
  if (resource === 'goldCoins') return stats.goldCoins || 0;

  const amount = stats.inventory?.[resource];
  return typeof amount === 'number' ? amount : undefined;
}

function isValidRequirementAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && Number.isFinite(amount) && amount >= 0;
}

function canAffordRequirements(stats: PlayerStats, requirements: CraftRequirements): boolean {
  return Object.entries(requirements).every(([resource, amount]) => {
    const owned = getInventoryAmount(stats, resource);
    return owned !== undefined && isValidRequirementAmount(amount) && owned >= amount;
  });
}

function spendRequirements(stats: PlayerStats, requirements: CraftRequirements) {
  Object.entries(requirements).forEach(([resource, amount]) => {
    if (!isValidRequirementAmount(amount) || amount === 0) return;

    if (resource === 'goldCoins') {
      stats.goldCoins -= amount;
      return;
    }

    stats.inventory[resource] -= amount;
  });
}

function getEquipmentIdFromCraftResult(result: unknown): string | null {
  if (!isRecord(result)) return null;

  for (const key of EQUIPMENT_RESULT_KEYS) {
    const value = result[key];
    if (typeof value === 'string') return value;
  }

  return null;
}

/**
 * 업그레이드, 판매, 제작 등 경제 관련 액션을 처리합니다.
 */
export const handleEconomyAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;

  switch (action) {
    case 'upgrade':
      showToast('Legacy upgrade is unavailable.', 'warning', 1800);
      break;

    case 'sell': {
      const resource = typeof data?.resource === 'string' ? data.resource : '';
      const amount = typeof data?.amount === 'number' ? data.amount : 0;
      const mineral = MINERAL_MAP[resource];

      if (!mineral || mineral.collectible === false || !Number.isInteger(amount) || amount <= 0) {
        showToast('Invalid sell request.', 'warning', 1800);
        break;
      }

      const owned = getInventoryAmount(stats, resource);
      if (owned === undefined || owned < amount) {
        showToast('Not enough materials to sell.', 'warning', 1800);
        break;
      }

      stats.inventory[resource] = owned - amount;
      // [Effect] 파프니르의 황금 보물 (GOLD_SELL_BOOST): 판매가 2배
      const priceMultiplier = hasEffectItemEffect(stats, 'GOLD_SELL_BOOST') ? 2.0 : 1.0;
      stats.goldCoins += Math.floor(amount * mineral.basePrice * priceMultiplier);
      break;
    }

    case 'craft': {
      const equipId = getEquipmentIdFromCraftResult(data?.res);
      const equipment = equipId ? EQUIPMENTS[equipId] : null;
      if (!equipId || !equipment) {
        showToast('Invalid craft request.', 'warning', 1800);
        break;
      }

      if (!Array.isArray(stats.ownedEquipmentIds)) {
        stats.ownedEquipmentIds = [];
      }
      if (!stats.equipmentStates) {
        stats.equipmentStates = {};
      }

      if (stats.ownedEquipmentIds.includes(equipId)) {
        showToast('Equipment already owned.', 'info', 1800);
        break;
      }

      const requirements = (equipment.price || {}) as CraftRequirements;
      if (!canAffordRequirements(stats, requirements)) {
        showToast('Not enough materials to craft.', 'warning', 1800);
        break;
      }

      spendRequirements(stats, requirements);
      stats.ownedEquipmentIds.push(equipId);
      stats.equipmentStates[equipId] =
        stats.equipmentStates[equipId] || createInitialEquipmentState(equipId);

      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }

    case 'rerollEquipmentOption': {
      const equipmentId = typeof data?.equipmentId === 'string' ? data.equipmentId : '';
      const equipment = EQUIPMENTS[equipmentId];
      if (!equipment || !stats.ownedEquipmentIds.includes(equipmentId)) {
        showToast('Equipment not owned.', 'warning', 1800);
        break;
      }

      if (!stats.equipmentStates[equipmentId]) {
        stats.equipmentStates[equipmentId] = createInitialEquipmentState(equipmentId);
      }

      const state = stats.equipmentStates[equipmentId];
      const currentBonus = getMainStatBonusPct(state);
      if (currentBonus >= EQUIPMENT_MAIN_STAT_BONUS_MAX) {
        showToast('This option is already perfect.', 'info', 1800);
        break;
      }

      const cost = getEquipmentRerollCost(equipment, currentBonus);
      if ((stats.goldCoins || 0) < cost) {
        showToast('Not enough gold for refinement.', 'warning', 1800);
        break;
      }

      stats.goldCoins -= cost;
      const rolledBonus = rollEquipmentMainStatBonusPct();
      const finalBonus = Math.max(currentBonus, rolledBonus);
      state.mainStatBonusPct = finalBonus;

      if (finalBonus > currentBonus) {
        showToast(
          `${equipment.name} refined: ${getEquipmentQualityLabel(finalBonus)} +${finalBonus}%`,
          'success',
          2200,
        );
      } else {
        showToast(
          `Refinement held at ${getEquipmentQualityLabel(currentBonus)} +${currentBonus}%.`,
          'info',
          1800,
        );
      }

      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }
  }
};
