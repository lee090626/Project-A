import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTER_LIST } from '@/shared/config/monsterData';
import { calculateMiningDamage } from '../../../lib/miningCalculator';
import { messageBus } from '@/shared/lib/MessageBus';

/**
 * 플레이어와 몬스터 간의 상호 대미지 판정 분석 및 이벤트를 발행합니다.
 */
export const damageProcessor = (world: GameWorld, now: number) => {
  processMonsterToPlayerDamage(world, now);
  processPlayerToMonsterDamage(world, now);
};

/**
 * 상하좌우 및 사거리 내의 몬스터가 플레이어를 공격하는 로직
 */
function processMonsterToPlayerDamage(world: GameWorld, now: number) {
  const { player, entities } = world;

  const nearbyMonsters = world.spatialHash.query(
    player.pos.x * TILE_SIZE,
    player.pos.y * TILE_SIZE,
    TILE_SIZE * 2,
  );

  nearbyMonsters.forEach((idx) => {
    const type = entities.soa.type[idx];
    if (type !== 1 && type !== 2) return; // 1: monster, 2: boss
    if (entities.soa.hp[idx] <= 0) return;

    const ex = entities.soa.x[idx];
    const ey = entities.soa.y[idx];
    const ew = entities.soa.width[idx] || TILE_SIZE;
    const eh = entities.soa.height[idx] || TILE_SIZE;

    const px = player.pos.x * TILE_SIZE;
    const py = player.pos.y * TILE_SIZE;

    const rangePadding = TILE_SIZE * 1.2;
    const isInRange =
      px >= ex - rangePadding &&
      px < ex + ew + rangePadding &&
      py >= ey - rangePadding &&
      py < ey + eh + rangePadding;

    if (isInRange) {
      // 잡몹(Type 1)은 대각선 공격 제한 기믹
      const dx = Math.abs(px - (ex + ew / 2));
      const dy = Math.abs(py - (ey + eh / 2));
      const isDiagonal = dx > TILE_SIZE * 0.8 && dy > TILE_SIZE * 0.8;
      const canDamage = type === 2 || !isDiagonal;

      if (canDamage) {
        const cooldown = entities.soa.attackCooldown[idx];
        const lastTime = entities.soa.lastAttackTime[idx];
        const elapsed = now - lastTime;

        // [Charging Combat 구현]
        // 쿨타임이 완료된 시점에만 대미지를 입힘 (전조 시간 = 공속)
        if (elapsed >= cooldown) {
          const attack = entities.soa.attack[idx];
          const damage = Math.max(1, attack - (player.stats.defense || 0));
          
          player.stats.hp -= damage;
          player.lastHitTime = now;
          entities.soa.lastAttackTime[idx] = now; // 다음 차징 시작

          // [Juice: 이벤트 발행] 플레이어 피격 연출 요청
          messageBus.emit('game:player_hit', {
            x: px,
            y: py,
            damage
          });
        }
      }
    } else {
      // [Kiting 지원] 사거리 밖으로 나가면 공격 타이머를 최신화하여, 
      // 다시 사거리 진입 시 즉시 타격이 발생하지 않고 처음부터 차징하게 함.
      // (단, 이미 쿨타임이 돌고 있는 상태에서만 갱신)
      const cooldown = entities.soa.attackCooldown[idx];
      if (now - entities.soa.lastAttackTime[idx] > cooldown) {
         entities.soa.lastAttackTime[idx] = now;
      }
    }
  });
}

/**
 * 플레이어가 드릴로 몬스터를 타격하는 로직
 */
function processPlayerToMonsterDamage(world: GameWorld, now: number) {
  const { player, entities, intent } = world;

  if (!player.isDrilling || !intent.miningTarget) return;

  const target = intent.miningTarget;
  const hitEntities = world.spatialHash.query(
    target.x * TILE_SIZE + TILE_SIZE / 2,
    target.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE * 0.5,
  );

  hitEntities.forEach((idx) => {
    const type = entities.soa.type[idx];
    if (type !== 1 && type !== 2) return;
    if (entities.soa.hp[idx] <= 0) return;

    // 1. 엔티티 영역 (AABB)
    const ex = entities.soa.x[idx];
    const ey = entities.soa.y[idx];
    const ew = entities.soa.width[idx] || TILE_SIZE;
    const eh = entities.soa.height[idx] || TILE_SIZE;

    // 2. 공격 영역 (현재는 1x1 타일을 기준으로 하되, 향후 drillStats 등으로 확장 가능)
    const tx = target.x * TILE_SIZE;
    const ty = target.y * TILE_SIZE;
    const tw = TILE_SIZE; // 기본적으로 1x1 타일 공격
    const th = TILE_SIZE;

    // 3. 교차 영역(Intersection) 계산
    const interX1 = Math.max(ex, tx);
    const interY1 = Math.max(ey, ty);
    const interX2 = Math.min(ex + ew, tx + tw);
    const interY2 = Math.min(ey + eh, ty + th);

    const interW = Math.max(0, interX2 - interX1);
    const interH = Math.max(0, interY2 - interY1);

    // 4. 중첩된 타일 수 계산 (Area / TILE_SIZE^2)
    // 1x1 드릴은 항상 1 이하의 값이 나오므로 Math.max(1, ...)로 최소 배율 보장
    const overlapTilesX = Math.ceil(interW / TILE_SIZE);
    const overlapTilesY = Math.ceil(interH / TILE_SIZE);
    const multiplier = overlapTilesX * overlapTilesY;

    if (multiplier > 0) {
      const defIdx = entities.soa.monsterDefIndex[idx];
      const monsterDef = MONSTER_LIST[defIdx];
      const monsterDefense = monsterDef?.stats?.defense || 0;

      const { finalDamage, attackInterval, isCrit } = calculateMiningDamage(
        player.stats,
        type === 2 ? 'boss' : 'monster',
        monsterDefense
      );

      if (now - player.lastAttackTime > attackInterval) {
        // [Multi-Hit] 중첩 타일 수만큼 대미지 배수 적용
        const actualDamage = finalDamage * multiplier;
        let text = isCrit ? `Crit! -${actualDamage}` : `-${actualDamage}`;
        let color = isCrit ? '#f87171' : '#ffffff';

        // 보스에게 다중 타격 시 배수 표시 (예: "x15")
        if (multiplier > 1) {
          text += ` (x${multiplier})`;
        }

        // 특수 기믹: 크리티컬 온리 몬스터
        if (monsterDef?.mechanic === 'critical_only' && !isCrit) {
          text = 'BLOCK!';
          color = '#3b82f6';
          
          if (now - player.lastAttackTime > attackInterval) {
            entities.soa.hp[idx] -= 0;
          }
        } else if (actualDamage > 0) {
          entities.soa.hp[idx] -= actualDamage;
          entities.markDirty(idx);
          
          // [Juice: 이벤트 발행] 몬스터 타격 연출 요청
          messageBus.emit('game:entity_hit', {
            x: interX1 + interW / 2, // 타격 발생 지점 중심
            y: interY1,
            damage: actualDamage,
            isCrit,
            text,
            color
          });
        }

        player.lastAttackTime = now;
      }
    }
  });
}
