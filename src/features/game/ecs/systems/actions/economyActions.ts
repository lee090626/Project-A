import { GameWorld } from '@/entities/world/model';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
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
import { showToast } from '../toastSystem';

/**
 * 업그레이드, 판매, 제작 등 경제 관련 액션을 처리합니다.
 */
export const handleEconomyAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;

  switch (action) {
    case 'upgrade':
      if (data.type === 'power') stats.power += 5;
      else if (data.type === 'maxHp') stats.maxHp += 20;
      if (data.requirements) {
        Object.entries(data.requirements).forEach(([res, amt]) => {
          const amount = amt as number;
          if (res === 'goldCoins') stats.goldCoins -= amount;
          else if (stats.inventory[res as any] !== undefined) {
            (stats.inventory as any)[res] -= amount;
          }
        });
      }
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;

    case 'sell':
      if (stats.inventory[data.resource] >= data.amount) {
        stats.inventory[data.resource] -= data.amount;
        // [Effect] 마몬의 황금 주화 (GOLD_SELL_BOOST): 판매가 2배
        const priceMultiplier = hasEffectItemEffect(stats, 'GOLD_SELL_BOOST') ? 2.0 : 1.0;
        stats.goldCoins += Math.floor(data.price * priceMultiplier);
      }
      break;

    case 'craft':
      if (data.req) {
        Object.entries(data.req).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else if (stats.inventory[res as any] !== undefined)
            (stats.inventory as any)[res] -= amt as number;
        });
      }
      if (data.res) {
        const equipId = data.res.DrillId || data.res.HelmetId || data.res.ArmorId || data.res.BootsId || 
                       data.res.drillId || data.res.helmetId || data.res.armorId || data.res.bootsId;
        if (equipId && !stats.ownedEquipmentIds.includes(equipId)) {
          stats.ownedEquipmentIds.push(equipId);
          if (!stats.equipmentStates[equipId]) {
            stats.equipmentStates[equipId] = createInitialEquipmentState(equipId);
          }
        }
      }
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;

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
