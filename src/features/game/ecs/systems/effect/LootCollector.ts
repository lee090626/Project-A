import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 드롭된 아이템의 물리(중력, 마그넷) 및 플레이어의 획득 로직을 관리합니다.
 * @param world - 게임 월드
 * @param deltaTime - 프레임 델타 시간 (ms)
 */
export const updateLootCollection = (world: GameWorld, deltaTime: number) => {
  const { player, droppedItemPool: dp } = world;
  const dtFactor = deltaTime / 16.6;

  for (let i = 0; i < dp.active.length; i++) {
    if (!dp.active[i]) continue;

    // 1. 물리 업데이트
    dp.x[i] += dp.vx[i] * dtFactor;
    dp.y[i] += dp.vy[i] * dtFactor;
    dp.vy[i] += 0.2 * dtFactor; // 중력
    dp.vx[i] *= 0.95; // 공기 저항

    // 2. 플레이어 자석 효과 (Magnet)
    const dx = player.visualPos.x * TILE_SIZE + TILE_SIZE / 2 - dp.x[i];
    const dy = player.visualPos.y * TILE_SIZE + TILE_SIZE / 2 - dp.y[i];
    const distSq = dx * dx + dy * dy;
    const magnetRange = 80;

    if (distSq < magnetRange * magnetRange) {
      const dist = Math.sqrt(distSq);
      const force = 0.5 * dtFactor;
      dp.vx[i] += (dx / dist) * force;
      dp.vy[i] += (dy / dist) * force;
    }

    // 3. 획득 판정 (Collision)
    const pickupRange = 20;
    if (distSq < pickupRange * pickupRange) {
      const type = dp.type[i];
      const amount = dp.amount[i];
      const id = dp.id[i];

      // 인벤토리 가산
      if (type === 'ESSENCE') {
        player.inventory.essences[id] = (player.inventory.essences[id] || 0) + amount;
        // UI 토스트 취합용 버퍼 업데이트
        world.aggregationBuffer[id] = (world.aggregationBuffer[id] || 0) + amount;
      } else if (type === 'ARTIFACT') {
        player.inventory.collectionHistory[id] = (player.inventory.collectionHistory[id] || 0) + amount;
        world.aggregationBuffer[id] = (world.aggregationBuffer[id] || 0) + amount;
      } else if (type === 'MINERAL') {
        player.inventory.minerals[id] = (player.inventory.minerals[id] || 0) + amount;
        world.aggregationBuffer[id] = (world.aggregationBuffer[id] || 0) + amount;
      }

      // 아이템 제거 (비활성화)
      dp.active[i] = 0;
    }
  }
};
