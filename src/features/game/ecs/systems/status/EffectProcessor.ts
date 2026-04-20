import { GameWorld } from '@/entities/world/model';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 전역적인 상태 이상(BURN, POISON 등)의 틱 대미지 및 효과를 처리합니다.
 * @param world - 게임 월드
 * @param now - 현재 시간
 */
export const processActiveEffects = (world: GameWorld, now: number) => {
  const { player } = world;

  if (!player.stats.activeEffects) {
    player.stats.activeEffects = [];
    return;
  }

  player.stats.activeEffects = player.stats.activeEffects.filter((effect) => {
    const isExpired = now >= effect.endTime;
    if (isExpired) {
      // 스턴이 만료될 때 면역 시작 시간 기록
      if (effect.type === 'STUN') {
        (player.stats as any).lastStunEndTime = now;
      }
      return false;
    }

    const startTime = effect.startTime || now;
    const elapsed = now - startTime;

    // BURN (화상): 0.5초마다 최대 HP의 2% 대미지
    if (effect.type === 'BURN') {
      const interval = 500;
      const currentTicks = Math.floor(elapsed / interval);
      const prevTicks = Math.floor((elapsed - 20) / interval);

      if (currentTicks > prevTicks && currentTicks > 0) {
        const damage = Math.max(1, Math.floor(player.stats.maxHp * 0.02));
        player.stats.hp -= damage;
        createFloatingText(
          world,
          player.visualPos.x * TILE_SIZE,
          player.visualPos.y * TILE_SIZE - 20,
          '-' + damage,
          '#f97316',
        );
      }
    }

    // POISON (독): 1초마다 고정 대미지 (차원 비례)
    if (effect.type === 'POISON') {
      const interval = 1000;
      const currentTicks = Math.floor(elapsed / interval);
      const prevTicks = Math.floor((elapsed - 20) / interval);

      if (currentTicks > prevTicks && currentTicks > 0) {
        const damage = 5 + (player.stats.dimension || 0) * 2;
        player.stats.hp -= damage;
        createFloatingText(
          world,
          player.visualPos.x * TILE_SIZE,
          player.visualPos.y * TILE_SIZE - 20,
          '-' + damage,
          '#a855f7',
        );
      }
    }

    return true;
  });
};
