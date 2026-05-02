import { GameWorld } from '@/entities/world/model';
import { SPAWN_RULE_VERSION } from '@/shared/config/circleData';
import { bossDirector } from './BossDirector';
import { mobSpawner } from './MobSpawner';
import { spawnCleaner } from './SpawnCleaner';

/**
 * 플레이어의 위치를 기반으로 주변 서클의 보스, 일반 몬스터를 스폰하고
 * 자원을 관리하는 메인 시스템(오케스트레이터)입니다.
 */
export const spawnSystem = (world: GameWorld) => {
  refreshSpawnRulesIfNeeded(world);

  // 1. [SoC: 보스] 서클 보스 소환 관리
  bossDirector(world);

  // 2. [SoC: 일반 몹] 그리드 탐색 기반 몬스터 스폰
  mobSpawner(world);

  // 3. [SoC: 정리] 사거리 밖 엔티티 및 좌표 데이터 최적화
  spawnCleaner(world);
};

/**
 * 저장 데이터의 스폰 규칙 버전이 현재 코드와 다르면 주변 일반몹 스폰 상태를 한 번 재평가합니다.
 * 일반몹 엔티티와 좌표 캐시만 초기화하고 보스, 채굴로 수정된 타일, 세이브 진행도는 유지합니다.
 *
 * @param world - 현재 게임 월드 상태
 */
function refreshSpawnRulesIfNeeded(world: GameWorld): void {
  if (world.player.stats.spawnRulesVersion === SPAWN_RULE_VERSION) return;

  for (let i = world.entities.soa.count - 1; i >= 0; i--) {
    if (world.entities.soa.type[i] === 1) {
      world.entities.destroy(i);
    }
  }

  world.spawnedCoords.clear();

  const rangeX = 16;
  const rangeY = 13;
  const startX = Math.floor(world.player.pos.x - rangeX);
  const startY = Math.floor(world.player.pos.y - rangeY);
  world.tileMap.invalidateGeneratedUnmodifiedArea(startX, startY, rangeX * 2 + 1, rangeY * 2 + 1);

  world.player.stats.spawnRulesVersion = SPAWN_RULE_VERSION;
}
