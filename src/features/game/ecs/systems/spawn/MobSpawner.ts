import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTER_LIST } from '@/shared/config/monsterData';

/**
 * 플레이어 주변의 몬스터 스폰 지점을 탐색하여 엔티티를 생성합니다.
 */
export const mobSpawner = (world: GameWorld) => {
  const { player, tileMap, spawnedCoords, entities } = world;

  // 1. 보스전 중에는 잡몹 소환을 차단하여 성능 및 가시성 확보
  if (isBossPresent(world)) return;

  // 2. 플레이어 주변 일정 범위(뷰포트보다 약간 넓게) 탐색 범위 설정
  const rangeX = 15;
  const rangeY = 12;

  const startX = Math.floor(player.pos.x - rangeX);
  const endX = Math.ceil(player.pos.x + rangeX);
  const startY = Math.floor(player.pos.y - rangeY);
  const endY = Math.ceil(player.pos.y + rangeY);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const coordKey = `${x},${y}`;

      // 이미 체크했거나 스폰된 좌표는 건너뜀
      if (spawnedCoords.has(coordKey)) continue;

      // 해당 좌표의 초기 몬스터 데이터 확인
      const initialMonster = tileMap.getInitialMonster(x, y);
      if (initialMonster) {
        trySpawnMob(world, initialMonster);
      }

      // 체크 완료 표시
      spawnedCoords.add(coordKey);
    }
  }
};

/**
 * 개별 몬스터 엔티티 생성 시도
 */
function trySpawnMob(world: GameWorld, monster: any) {
  const { player, entities } = world;

  // 처치 여부 및 중복 생성 체크
  if (player.stats.killedMonsterIds?.includes(monster.id)) return;
  if (entities.hasId(monster.id)) return;

  // ID 파싱 (mob_{x}_{y}_{definitionId} -> definitionId)
  const idParts = monster.id.split('_');
  const definitionId = idParts.slice(3).join('_');
  const defIdx = MONSTER_LIST.findIndex((m: any) => m.id === definitionId);

  // 엔티티 생성
  entities.create(
    1, // type: monster
    monster.x * TILE_SIZE,
    monster.y * TILE_SIZE,
    monster.id,
    defIdx !== -1 ? defIdx : 0,
  );

  // 상세 스탯 설정 (SoA 직접 접근)
  const idx = entities.soa.count - 1;
  const config = MONSTER_LIST[defIdx !== -1 ? defIdx : 0];
  
  entities.soa.hp[idx] = monster.stats?.maxHp || 100;
  entities.soa.maxHp[idx] = monster.stats?.maxHp || 100;
  entities.soa.attack[idx] = monster.stats?.attack || 5;
  entities.soa.attackCooldown[idx] = monster.stats?.attackCooldown ?? 1000;
  entities.soa.aggroRange[idx] = config.behavior.aggroRange || 8;
  entities.soa.speed[idx] = monster.stats?.speed || 50;
  entities.soa.width[idx] = monster.width || TILE_SIZE;
  entities.soa.height[idx] = monster.height || TILE_SIZE;
}

/**
 * 월드 내에 보스 엔티티가 생존해 있는지 확인
 */
function isBossPresent(world: GameWorld): boolean {
  for (let i = 0; i < world.entities.soa.count; i++) {
    if (world.entities.soa.type[i] === 2) return true;
  }
  return false;
}
