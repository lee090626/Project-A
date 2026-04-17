import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';

/**
 * 활성화된 엔티티 및 스폰 좌표 데이터의 메모리 점유를 최적화합니다.
 */
export const spawnCleaner = (world: GameWorld) => {
  const { player, spawnedCoords, entities } = world;

  // 1. 너무 멀어진 몬스터 제거 ($O(1)$ Swap-and-Pop 활용)
  // 매 프레임 실행될 수 있으므로 임계치(Count > 50)를 기준으로 체크하거나 주기적으로 실행
  if (entities.soa.count > 50) {
    for (let i = entities.soa.count - 1; i >= 0; i--) {
      // 보스(Type 2)는 멀어져도 유지, 일반 몹(Type 1)만 제거
      if (entities.soa.type[i] !== 1) continue;

      const dx = player.pos.x * TILE_SIZE - entities.soa.x[i];
      const dy = player.pos.y * TILE_SIZE - entities.soa.y[i];

      // 픽셀 기준 거리 체크 (플레이어 주변 약 40-50타일 범위 밖이면 제거)
      if (Math.abs(dx) > 50 * TILE_SIZE || Math.abs(dy) > 40 * TILE_SIZE) {
        entities.destroy(i);
      }
    }
  }

  // 2. 좌표 추적 데이터(spawnedCoords) 정리
  // 데이터 개수가 일정 수준(1000개)을 넘어가면 멀리 떨어진 좌표 데이터 삭제
  if (spawnedCoords.size > 1000) {
    const MAX_DIST = 50;
    for (const coord of spawnedCoords) {
      const [cx, cy] = coord.split(',').map(Number);
      if (Math.abs(player.pos.x - cx) > MAX_DIST || Math.abs(player.pos.y - cy) > MAX_DIST) {
        spawnedCoords.delete(coord);
      }
    }
  }
};
