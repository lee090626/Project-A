import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { createFloatingText, createParticles } from '@/shared/lib/effectUtils';
import { getCircleConfig } from '@/shared/config/circleData';
import { messageBus } from '@/shared/lib/MessageBus';

/**
 * 보스 처치 성공 시의 로직을 수행합니다 (코어 기록, 보상 지급 등).
 */
export const handleBossDefeat = (world: GameWorld, x: number, y: number) => {
  const { player, tileMap } = world;
  const config = getCircleConfig(player.stats.depth);
  const circleId = config.id;

  // 레거시 진행 기록: 보스 처치 코어 보유 상태를 저장합니다.
  const coreId = `circle_${circleId}_core`;
  if (!player.stats.artifacts.includes(coreId)) {
    player.stats.artifacts.push(coreId);

    if (!player.stats.equippedArtifactId) {
      player.stats.equippedArtifactId = coreId;
    }

    createFloatingText(world, x, y - 40, `Core Recorded: Circle ${circleId}`, '#a855f7');
  }

  // 보스 전용 유니크 룬 지급
  if (!player.stats.inventoryRunes) {
    player.stats.inventoryRunes = [];
  }
  player.stats.inventoryRunes.push({
    id: `rune_${Date.now()}_unique`,
    runeId: 'lucky_charm_rune',
    rarity: 'Unique',
  });
  createFloatingText(world, x, y - 60, 'Unique Skill Rune Acquired!', '#22d3ee');

  // [심리스 개편] 포탈 생성을 생략하고 보상 지급 및 연출에 집중합니다.
  createFloatingText(world, x, y - 20, `Circle ${circleId} Boss Defeated!`, '#a855f7');
  messageBus.emit('game:boss_defeated', { circleId, x, y });
};
