import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTER_LIST, MonsterDefinition } from '@/shared/config/monsterData';
import {
  patternTimers,
  patternRegistry,
  PatternContext,
} from './bossPatternHandlers';

/**
 * [ECS] 보스 AI 및 패턴 제어 시스템 (Data-Driven 리팩토링)
 *
 * 동작 원리:
 * 1. SOA에서 살아 있는 type=2(보스) 엔티티를 탐색합니다.
 * 2. 보스의 monsterDefIndex로 `MONSTERS` 데이터를 조회합니다.
 * 3. AABB 거리 기준으로 전투 진입/해제를 판정합니다.
 * 4. 전투 중일 때만 패턴과 기본 공격 전조를 처리합니다.
 *
 * @param world - 현재 게임 월드 상태
 * @param deltaTime - 이전 프레임과의 시간 차 (ms)
 * @param now - 현재 타임스탬프 (ms)
 */
export const bossBehaviorSystem = (world: GameWorld, _deltaTime: number, now: number) => {
  const { entities, player } = world;
  const { soa } = entities;

  // --- 1. 보스 엔티티 탐색 (type === 2 && hp > 0) ---
  let bossIdx = -1;
  for (let i = 0; i < soa.count; i++) {
    if (soa.type[i] === 2 && soa.hp[i] > 0) {
      bossIdx = i;
      break;
    }
  }

  // 보스가 없으면 모든 전투 상태 해제 (혹은 개별 해제 로직으로 확장 가능)
  if (bossIdx === -1) {
    if (Object.keys(world.bossCombatStatus).length > 0) {
      world.bossCombatStatus = {};
    }
    world.environmentalForce = { vx: 0, vy: 0 };
    return;
  }

  // 매 프레임 보스에 의한 환경 외력 초기화 (핸들러에서 다시 설정 가능하도록)
  world.environmentalForce = { vx: 0, vy: 0 };

  const instanceId = soa.instanceId[bossIdx].toString();

  // 현재 보스 시스템은 단일 활성 보스를 처리하므로 이전 인스턴스의 UI 상태를 정리합니다.
  for (const key of Object.keys(world.bossCombatStatus)) {
    if (key !== instanceId) {
      delete world.bossCombatStatus[key];
    }
  }

  // --- 2. 데이터 조회 ---
  const defIndex = soa.monsterDefIndex[bossIdx];
  const bossDef: MonsterDefinition | undefined = MONSTER_LIST[defIndex];
  if (!bossDef) return;

  // --- 3. 좌표 및 사거리 계산 ---
  const bx = soa.x[bossIdx] + (soa.width[bossIdx] || TILE_SIZE * 5) / 2;
  const by = soa.y[bossIdx] + (soa.height[bossIdx] || TILE_SIZE * 5) / 2;
  const px = player.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const py = player.pos.y * TILE_SIZE + TILE_SIZE / 2;

  const distToPlayer = getAabbDistanceToPlayerTiles(world, bossIdx);
  const attackRange = bossDef.behavior.attackRange || 2;
  const aggroRange = bossDef.behavior.aggroRange || soa.aggroRange[bossIdx] || 10;
  const deaggroRange = aggroRange + 4;
  const wasEngaged = Boolean(world.bossCombatStatus[instanceId]?.active);
  const isEngaged = distToPlayer <= (wasEngaged ? deaggroRange : aggroRange);

  if (!isEngaged) {
    delete world.bossCombatStatus[instanceId];
    clearPatternTimersForBoss(instanceId);
    soa.state[bossIdx] = 0;
    soa.lastAttackTime[bossIdx] = now;
    return;
  }

  // --- 4. UI 동기화 ---
  world.bossCombatStatus[instanceId] = {
    active: true,
    id: bossDef.id,
    name: bossDef.nameKo ?? bossDef.name,
    hp: soa.hp[bossIdx],
    maxHp: soa.maxHp[bossIdx],
  };

  // --- 5. 패턴 루프 및 전조(Warning) 상태 체크 ---
  const patterns = bossDef.patterns ?? [];
  let anyWarning = false;

  for (let pi = 0; pi < patterns.length; pi++) {
    const pattern = patterns[pi];
    const timerKey = `${instanceId}:${pi}`;
    const warningLead = pattern.warningLeadTime ?? 1000;

    if (!patternTimers.has(timerKey)) {
      patternTimers.set(timerKey, now - pattern.cooldown + warningLead);
    }

    const lastTime = patternTimers.get(timerKey)!;
    const elapsed = now - lastTime;

    const inWarning = elapsed > pattern.cooldown - warningLead;
    const shouldFire = elapsed > pattern.cooldown;

    if (inWarning) anyWarning = true;

    if (shouldFire) {
      patternTimers.set(timerKey, now);

      const handler = patternRegistry.get(pattern.type);
      if (handler) {
        const ctx: PatternContext = {
          world,
          entities,
          bossIdx,
          bx,
          by,
          px,
          py,
          now,
          pattern,
        };
        handler(ctx);
      }
    }
  }

  // --- 6. 평타 차징(Basic Attack Charging) 로직 통합 ---
  const lastAttack = soa.lastAttackTime[bossIdx];
  const attackElapsed = now - lastAttack;
  
  // 사거리 내에 있을 때 기본 공격 전조를 표시합니다.
  const isBasicAttacking = distToPlayer <= attackRange && attackElapsed > 0;
  
  if (isBasicAttacking) {
    anyWarning = true;
  }

  // 렌더러에 시전 상태 알림 (시전 바 노출)
  soa.state[bossIdx] = anyWarning ? 1 : 0;
};

/**
 * 보스의 타일 단위 AABB와 플레이어 사이의 최단 거리를 계산합니다.
 *
 * @param world - 현재 게임 월드 상태
 * @param bossIdx - 보스 엔티티 인덱스
 * @returns 플레이어와 보스 히트박스 사이의 타일 단위 거리
 */
function getAabbDistanceToPlayerTiles(world: GameWorld, bossIdx: number): number {
  const { entities, player } = world;
  const { soa } = entities;
  const bx = soa.x[bossIdx] / TILE_SIZE;
  const by = soa.y[bossIdx] / TILE_SIZE;
  const bw = (soa.width[bossIdx] || TILE_SIZE) / TILE_SIZE;
  const bh = (soa.height[bossIdx] || TILE_SIZE) / TILE_SIZE;
  const closestX = Math.max(bx, Math.min(player.pos.x, bx + bw - 1));
  const closestY = Math.max(by, Math.min(player.pos.y, by + bh - 1));
  const dx = player.pos.x - closestX;
  const dy = player.pos.y - closestY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 지정 보스 인스턴스의 패턴 쿨타임을 초기화합니다.
 *
 * @param instanceId - 보스 엔티티 인스턴스 ID
 */
function clearPatternTimersForBoss(instanceId: string): void {
  const prefix = `${instanceId}:`;
  for (const key of patternTimers.keys()) {
    if (key.startsWith(prefix)) {
      patternTimers.delete(key);
    }
  }
}
