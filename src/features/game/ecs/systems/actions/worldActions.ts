import { EFFECT_DATA } from '@/shared/config/effectData';
import { EQUIPMENTS } from '@/shared/config/equipmentData';
import { GameWorld } from '@/entities/world/model';
import { messageBus, TOPIC } from '@/shared/lib/MessageBus';
import { addEffectStack } from '@/shared/lib/effectItemUtils';
import { EquipmentPart } from '@/shared/types/game';
import { showToast } from '../toastSystem';

const EQUIPMENT_SLOT_BY_PART: Record<EquipmentPart, keyof GameWorld['player']['stats']['equipment']> = {
  Drill: 'drillId',
  Helmet: 'helmetId',
  Armor: 'armorId',
  Boots: 'bootsId',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isEquipmentPart(value: unknown): value is EquipmentPart {
  return value === 'Drill' || value === 'Helmet' || value === 'Armor' || value === 'Boots';
}

/**
 * 부활, 웨이포인트 이동, Effect 합성 등 월드 관련 액션을 처리합니다.
 */
export const handleWorldAction = (world: GameWorld, action: string, data: any) => {
  const stats = world.player.stats;

  switch (action) {
    case 'respawn': {
      stats.hp = stats.maxHp;
      world.player.pos = { x: 15, y: 8 };
      world.player.visualPos = { x: 15, y: 8 };

      // 보스 전투 상태 및 환경 물리력 강제 초기화
      // [Rebase Resolve] bossCombatStatus가 Record로 변경됨에 따라 빈 객체로 초기화
      world.bossCombatStatus = {};
      world.environmentalForce = { vx: 0, vy: 0 };
      world.shake = 0;
      
      console.log('[Worker] Player respawned at Base Camp. Combat status reset.');
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }

    case 'rewardRevive': {
      if (stats.hp > 0) {
        showToast('Reward revive is only available after defeat.', 'warning', 1800);
        break;
      }

      stats.hp = stats.maxHp;
      world.environmentalForce = { vx: 0, vy: 0 };
      world.shake = 0;

      console.log('[Worker] Player revived at current position through rewarded ad.');
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }

    case 'selectCheckpoint': {
      const depth = isRecord(data) && typeof data.depth === 'number' ? data.depth : -1;
      if (!Number.isInteger(depth) || depth < 0) {
        showToast('Invalid waypoint', 'warning', 1800);
        break;
      }

      if (!Array.isArray(stats.unlockedWaypoints)) {
        stats.unlockedWaypoints = [0];
      }
      if (!stats.unlockedWaypoints.includes(depth)) {
        showToast('Locked waypoint', 'warning', 1800);
        break;
      }

      world.player.pos.x = 15;
      world.player.pos.y = depth + 10;
      world.player.visualPos.x = 15;
      world.player.visualPos.y = depth + 10;
      stats.depth = depth;
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }

    case 'synthesizeEffect': {
      if (!isRecord(data)) {
        showToast('Invalid effect request.', 'warning', 1800);
        break;
      }

      const effectId = typeof data.effectId === 'string' ? data.effectId : '';
      const effect = EFFECT_DATA[effectId];
      if (effect && effect.requirements) {
        const hasEnough = Object.entries(effect.requirements).every(([res, amt]) => {
          const owned = res === 'goldCoins' ? stats.goldCoins : stats.inventory[res as any] || 0;
          return owned >= (amt as number);
        });

        if (!hasEnough) break;

        // 자원 소모
        Object.entries(effect.requirements).forEach(([res, amt]) => {
          if (res === 'goldCoins') stats.goldCoins -= amt as number;
          else (stats.inventory[res as any] as number) -= amt as number;
        });

        // 결과 반영: 모든 Effect 아이템은 스택 누적 규칙을 따릅니다.
        addEffectStack(stats, effectId, 1);
      }
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }

    case 'equip': {
      const id = isRecord(data) && typeof data.id === 'string' ? data.id : '';
      const part = isRecord(data) ? data.part : undefined;
      const equipment = EQUIPMENTS[id];
      if (!id || !isEquipmentPart(part) || !equipment || equipment.part !== part) {
        showToast('Invalid equipment request.', 'warning', 1800);
        break;
      }

      if (!Array.isArray(stats.ownedEquipmentIds) || !stats.ownedEquipmentIds.includes(id)) {
        showToast('Equipment not owned.', 'warning', 1800);
        break;
      }

      if (!stats.equipment) {
        stats.equipment = {
          drillId: null,
          helmetId: null,
          armorId: null,
          bootsId: null,
        };
      }

      stats.equipment[EQUIPMENT_SLOT_BY_PART[part]] = id;
      messageBus.emit(TOPIC.RECALCULATE_PLAYER_STATS);
      break;
    }
  }
};
