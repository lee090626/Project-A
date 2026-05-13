import { GameWorld } from '@/entities/world/model';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { getCircleConfig } from '@/shared/config/circleData';
import { messageBus } from '@/shared/lib/MessageBus';

/**
 * 보스 처치 성공 시의 로직을 수행합니다 (클리어 기록, 보상 지급 등).
 */
export const handleBossDefeat = (world: GameWorld, x: number, y: number) => {
  const { player } = world;
  const config = getCircleConfig(player.stats.depth);
  const circleId = config.id;

  if (!Array.isArray(player.stats.clearedCircleIds)) {
    player.stats.clearedCircleIds = [];
  }

  if (!player.stats.clearedCircleIds.includes(circleId)) {
    player.stats.clearedCircleIds.push(circleId);
    player.stats.clearedCircleIds.sort((a, b) => a - b);
    createFloatingText(world, x, y - 40, `Circle ${circleId} Cleared`, '#a855f7');
  }

  // [심리스 개편] 포탈 생성을 생략하고 보상 지급 및 연출에 집중합니다.
  createFloatingText(world, x, y - 20, `Circle ${circleId} Boss Defeated!`, '#a855f7');
  messageBus.emit('game:boss_defeated', { circleId, x, y });
};
