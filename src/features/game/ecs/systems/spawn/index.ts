import { GameWorld } from '@/entities/world/model';
import { CIRCLES, SPAWN_RULE_VERSION } from '@/shared/config/circleData';
import { bossDirector } from './BossDirector';
import { mobSpawner } from './MobSpawner';
import { spawnCleaner } from './SpawnCleaner';

const LEGACY_BOSS_ARENA_RESTORE_VERSION = 10;
const LEGACY_BOSS_ARENA_RADIUS = 15;
const LEGACY_BOSS_SPAWN_X = 15;

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
 * 일반몹 엔티티와 좌표 캐시를 초기화하고, 필요한 레거시 지형 보정만 수행합니다.
 *
 * @param world - 현재 게임 월드 상태
 */
function refreshSpawnRulesIfNeeded(world: GameWorld): void {
  const previousVersion = world.player.stats.spawnRulesVersion;
  if (previousVersion === SPAWN_RULE_VERSION) return;

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

  if (previousVersion < LEGACY_BOSS_ARENA_RESTORE_VERSION) {
    restoreLegacyBossArenaTiles(world);
  }

  world.player.stats.spawnRulesVersion = SPAWN_RULE_VERSION;
}

/**
 * 이전 보스 아레나 시스템이 저장해 둔 강제 빈칸을 원본 지형 생성 대상으로 되돌립니다.
 *
 * @param world - 현재 게임 월드 상태
 */
function restoreLegacyBossArenaTiles(world: GameWorld): void {
  for (const circle of CIRCLES) {
    if (!circle.boss) continue;

    // 레거시 보스 아레나는 depth 값을 월드 타일 Y처럼 사용해서 이 좌표에 저장되었습니다.
    const spawnY = circle.depthEnd - 8;
    const startX = LEGACY_BOSS_SPAWN_X - LEGACY_BOSS_ARENA_RADIUS;
    const startY = spawnY - LEGACY_BOSS_ARENA_RADIUS;
    const size = LEGACY_BOSS_ARENA_RADIUS * 2;

    world.tileMap.restoreModifiedEmptyArea(
      startX,
      startY,
      size,
      size,
    );
    world.tileMap.invalidateGeneratedUnmodifiedArea(startX, startY, size, size);
  }
}
