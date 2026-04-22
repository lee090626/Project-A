import { GameWorld } from '@/entities/world/model';
import { BossPattern, BossPatternType } from '@/shared/config/monsterData';
import { EntityManager } from '@/shared/lib/ecs/EntityManager';
import { applyStatusEffect } from '../status';

// ============================================================
// 내부 타입 정의
// ============================================================

export interface PatternContext {
  world: GameWorld;
  entities: EntityManager;
  bossIdx: number;
  phase: number;
  bx: number;
  by: number;
  px: number;
  py: number;
  now: number;
  pattern: BossPattern;
}

export type PatternHandler = (ctx: PatternContext) => boolean;

/**
 * 보스 투사체를 생성하고 초기화하는 공통 헬퍼 함수
 */
function spawnBossProjectile(
  entities: EntityManager,
  x: number,
  y: number,
  vx: number,
  vy: number,
  power: number,
  size: number,
  now: number,
  lifespan: number = 5000
) {
  const pIdx = entities.create(5, x, y);
  if (pIdx === -1) return -1;

  const idx = entities.getIndex(pIdx);
  const { soa } = entities;
  soa.vx[idx] = vx;
  soa.vy[idx] = vy;
  soa.attack[idx] = power;
  soa.createdAt[idx] = now;
  soa.lastAttackTime[idx] = 0;
  soa.width[idx] = size;
  soa.height[idx] = size;
  soa.lifespan[idx] = lifespan;

  return idx;
}

// ============================================================
// 전역 타이머 맵 (instanceId 기반)
// ============================================================

export const patternTimers = new Map<string, number>();

// ============================================================
// 패턴 핸들러 구현
// ============================================================

const handleShot: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, px, py, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 1;
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 5;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 10;
  const size = pattern.projectileSize ?? 128;

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 0) return false;

  const baseVx = (dx / dist) * speed;
  const baseVy = (dy / dist) * speed;

  for (let j = 0; j < count; j++) {
    const offset = count > 1 ? (j - (count - 1) / 2) * 0.2 : 0;
    const cos = Math.cos(offset);
    const sin = Math.sin(offset);
    const finalVx = baseVx * cos - baseVy * sin;
    const finalVy = baseVx * sin + baseVy * cos;

    spawnBossProjectile(entities, bx, by, finalVx, finalVy, power, size, now);
  }
  return true;
};

const handleCross: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 7;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 15;
  const size = pattern.projectileSize ?? 128;

  const directions = [
    { vx: 0,      vy: -speed },
    { vx: 0,      vy:  speed },
    { vx: -speed, vy: 0      },
    { vx:  speed, vy: 0      },
  ];

  for (const dir of directions) {
    spawnBossProjectile(entities, bx, by, dir.vx, dir.vy, power, size, now);
  }
  return true;
};

const handleAoe: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 12;
  const speed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 5;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 10;
  const size = pattern.projectileSize ?? 128;

  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const finalVx = Math.cos(angle) * speed;
    const finalVy = Math.sin(angle) * speed;

    spawnBossProjectile(entities, bx, by, finalVx, finalVy, power, size, now);
  }
  return true;
};

const handleLure: PatternHandler = (ctx) => {
  const { world, now, pattern } = ctx;
  const { player } = world;

  const lureDuration = pattern.lureDuration ?? 2000;
  const lureCycle = pattern.lureCycle ?? 5000;
  const cycleTime = now % lureCycle;

  if (cycleTime < lureDuration) {
    applyStatusEffect(world, { type: 'CONFUSION' }, lureDuration, now);
    return true;
  }
  return false;
};

const handleSwarm: PatternHandler = (ctx) => {
  const { entities, phase, bx, by, now, pattern } = ctx;
  const { soa } = entities;

  const override = pattern.phaseOverrides?.[phase - 1];
  const count = override?.projectileCount ?? pattern.projectileCount ?? 15;
  const baseSpeed = override?.projectileSpeed ?? pattern.projectileSpeed ?? 4;
  const power = override?.projectilePower ?? pattern.projectilePower ?? 8;
  const size = pattern.projectileSize ?? 64; // 파리 떼이므로 작게 설정 가능

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = baseSpeed * (0.8 + Math.random() * 0.4); // 속도에 변주를 줌
    const finalVx = Math.cos(angle) * speed;
    const finalVy = Math.sin(angle) * speed;

    spawnBossProjectile(entities, bx, by, finalVx, finalVy, power, size, now, 5000);
  }
  return true;
};

const handleGravity: PatternHandler = (ctx) => {
  const { world, bx, by, px, py, pattern } = ctx;

  const dx = bx - px;
  const dy = by - py;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 10) return false; // 너무 가까우면 인력 중단

  // 인력 세기 (기본값 0.1 타일/틱)
  const strength = 0.08;
  world.environmentalForce = {
    vx: (dx / dist) * strength,
    vy: (dy / dist) * strength
  };

  return true;
};

/**
 * [돌진] 플레이어 방향으로 강하게 가속합니다.
 */
const handleDash: PatternHandler = (ctx) => {
  const { world, entities, bossIdx, bx, by, px, py, now, pattern } = ctx;
  const speed = pattern.projectileSpeed ?? 8;
  const duration = pattern.dashDuration ?? 1500;
  const instanceId = entities.soa.instanceId[bossIdx].toString();

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 0) return false;

  // 대시 속도 및 종료 시간 기록 (bossBehaviorSystem에서 참조)
  entities.soa.vx[bossIdx] = (dx / dist) * speed;
  entities.soa.vy[bossIdx] = (dy / dist) * speed;

  if (world.bossCombatStatus[instanceId]) {
    (world.bossCombatStatus[instanceId] as any).dashEndTime = now + duration;
  }

  return true;
};

/**
 * [포효] 주변 플레이어에게 피해를 주고 스턴을 부여합니다.
 */
const handleRoar: PatternHandler = (ctx) => {
  const { world, bx, by, px, py, now, pattern } = ctx;
  const radius = pattern.roarRadius ?? 200;
  const power = pattern.projectilePower ?? 50;

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < radius) {
    const { player } = world;
    const damage = Math.max(1, power - (player.stats.defense || 0));
    player.stats.hp -= damage;
    player.lastHitTime = now;

    applyStatusEffect(world, { type: 'STUN' }, 1000, now);
    world.shake = Math.max(world.shake, 10);
  }

  return true;
};

/**
 * [지옥불 브레스] 부채꼴 모양으로 느리고 오래가는 투사체를 발사합니다.
 */
const handleHellfire: PatternHandler = (ctx) => {
  const { entities, bx, by, px, py, now, pattern } = ctx;
  const { soa } = entities;

  const count = pattern.projectileCount ?? 7;
  const speed = pattern.projectileSpeed ?? 3;
  const spread = Math.PI / 4; // 45도 부채꼴
  const lifespan = 10000; // 10초 잔류

  const dx = px - bx;
  const dy = py - by;
  const baseAngle = Math.atan2(dy, dx);

  for (let i = 0; i < count; i++) {
    const angle = baseAngle - spread / 2 + (spread / (count - 1)) * i;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    spawnBossProjectile(
      entities,
      bx,
      by,
      vx,
      vy,
      pattern.projectilePower ?? 15,
      pattern.projectileSize ?? 64,
      now,
      lifespan,
    );
  }
  return true;
};

export const patternRegistry: Map<BossPatternType, PatternHandler> = new Map([
  ['shot', handleShot],
  ['cross', handleCross],
  ['aoe', handleAoe],
  ['lure', handleLure],
  ['swarm', handleSwarm],
  ['gravity', handleGravity],
  ['dash', handleDash],
  ['roar', handleRoar],
  ['hellfire', handleHellfire],
]);