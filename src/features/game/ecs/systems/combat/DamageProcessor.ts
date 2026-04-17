import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { MONSTER_LIST } from '@/shared/config/monsterData';
import { calculateMiningDamage } from '../../../lib/miningCalculator';
import { createFloatingText } from '@/shared/lib/effectUtils';

/**
 * 플레이어와 몬스터 간의 상호 대미지 판정 및 시각 효과를 처리합니다.
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
        if (now - entities.soa.lastAttackTime[idx] > cooldown) {
          const attack = entities.soa.attack[idx];
          const damage = Math.max(1, attack - (player.stats.defense || 0));
          
          player.stats.hp -= damage;
          player.lastHitTime = now;

          createFloatingText(world, px, py - 20, `-${damage}`, '#ef4444');
          entities.soa.lastAttackTime[idx] = now;
          world.shake = Math.max(world.shake, 5);
        }
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

    const ex = entities.soa.x[idx];
    const ey = entities.soa.y[idx];
    const ew = entities.soa.width[idx] || TILE_SIZE;
    const eh = entities.soa.height[idx] || TILE_SIZE;

    const tx = target.x * TILE_SIZE;
    const ty = target.y * TILE_SIZE;

    const isHit = tx < ex + ew && tx + TILE_SIZE > ex && ty < ey + eh && ty + TILE_SIZE > ey;

    if (isHit) {
      const defIdx = entities.soa.monsterDefIndex[idx];
      const monsterDef = MONSTER_LIST[defIdx];
      const monsterDefense = monsterDef?.stats?.defense || 0;

      const { finalDamage, attackInterval, isCrit } = calculateMiningDamage(
        player.stats,
        type === 2 ? 'boss' : 'monster',
        monsterDefense
      );

      if (now - player.lastAttackTime > attackInterval) {
        let actualDamage = finalDamage;
        let text = isCrit ? `Crit! -${finalDamage}` : `-${finalDamage}`;
        let color = isCrit ? '#f87171' : '#ffffff';

        // 특수 기믹: 크리티컬 온리 몬스터
        if (monsterDef?.mechanic === 'critical_only' && !isCrit) {
          actualDamage = 0;
          text = 'BLOCK!';
          color = '#3b82f6';
        }

        if (actualDamage > 0 || text === 'BLOCK!') {
          entities.soa.hp[idx] -= actualDamage;
          entities.markDirty(idx);
          createFloatingText(world, ex, ey - 30, text, color);
        }

        player.lastAttackTime = now;
        if (isCrit && actualDamage > 0) world.shake = Math.max(world.shake, 8);
      }
    }
  });
}
