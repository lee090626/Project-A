import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { getCircleConfig } from '@/shared/config/circleData';
import { MONSTER_LIST } from '@/shared/config/monsterData';

/**
 * 특정 서클(Circle)의 보스 소환 및 라이프사이클을 관리합니다.
 */
export const bossDirector = (world: GameWorld) => {
  const { player, tileMap, entities } = world;
  const config = getCircleConfig(player.stats.depth);

  if (!config.boss) return;

  const bossId = config.boss.id;
  const isKilled = player.stats.killedMonsterIds?.includes(bossId);
  const respawnTime = player.stats.bossRespawnTimers?.[bossId] || 0;
  const canSpawn = !isKilled || Date.now() >= respawnTime;

  // 이미 소환되어 있거나 소환 조건이 안 맞으면 종료
  if (!canSpawn || entities.hasId(bossId)) return;

  // 보스 존 설정 (최하단 15m 구역 내 고정 스폰)
  const spawnY = config.depthEnd - 8;
  const spawnX = 15; // 중앙

  // 플레이어가 보스 구역 근처(15m 이내)에 도달했을 때만 소환
  const distY = Math.abs(player.stats.depth - spawnY);
  if (distY < 15) {
    spawnBoss(world, bossId, spawnX, spawnY);
  }
};

/**
 * 실제 보스 엔티티 생성 및 주변 환경 정리
 */
function spawnBoss(world: GameWorld, bossId: string, x: number, y: number) {
  const { player, tileMap, entities } = world;
  const defIdx = MONSTER_LIST.findIndex((m: any) => m.id === bossId);
  if (defIdx === -1) return;

  const bossDef = MONSTER_LIST[defIdx];

  // 2. 보스 엔티티 생성 (가변 크기 반영)
  const width = bossDef.width || 5;
  const height = bossDef.height || 5;
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  // 1. 보스 스폰 지점의 타일 및 일반 몹 정리 (Boss Zone Cleanup - 크기에 맞게 자동 확장)
  tileMap.clearArea(x - halfW - 1, y - halfH - 1, width + 2, height + 2);
  
  for (let i = entities.soa.count - 1; i >= 0; i--) {
    if (entities.soa.type[i] === 1) { // 1: monster (일반 몹)
      const mdx = Math.abs(entities.soa.x[i] - x * TILE_SIZE);
      const mdy = Math.abs(entities.soa.y[i] - y * TILE_SIZE);
      // 보스 크기에 따라 정리 거리 동적 조정
      const clearRange = (Math.max(width, height) + 4) * TILE_SIZE;
      if (mdx < clearRange && mdy < clearRange) {
        entities.destroy(i);
      }
    }
  }

  entities.create(
    2, // type: boss
    x * TILE_SIZE - halfW * TILE_SIZE,
    y * TILE_SIZE - halfH * TILE_SIZE,
    bossId,
    defIdx,
  );

  const idx = entities.soa.count - 1;
  entities.soa.hp[idx] = bossDef.stats.maxHp;
  entities.soa.maxHp[idx] = bossDef.stats.maxHp;
  entities.soa.attack[idx] = bossDef.stats.power;
  entities.soa.attackCooldown[idx] = bossDef.stats.attackCooldown ?? 2500;
  entities.soa.aggroRange[idx] = bossDef.behavior.aggroRange ?? 20;
  entities.soa.width[idx] = TILE_SIZE * width;
  entities.soa.height[idx] = TILE_SIZE * height;
  entities.soa.lastAttackTime[idx] = performance.now();

  // 최초 조우 기록
  if (!player.stats.encounteredBossIds.includes(bossId)) {
    player.stats.encounteredBossIds.push(bossId);
  }
}
