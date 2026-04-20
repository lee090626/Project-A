import { GameWorld } from '@/entities/world/model';
import { messageBus } from '@/shared/lib/MessageBus';
import { calculateMiningDamage } from '../../../lib/miningCalculator';

/**
 * 조준된 타일에 실제 드릴링 대미지를 입히고 이벤트를 발행하여 시각 효과를 요청합니다.
 */
export const miningExecutor = (
  world: GameWorld, 
  now: number, 
  hasMonsterTarget: boolean
): { destroyed: boolean; targetType: any; totalPower: number } | null => {
  const { player, tileMap, intent } = world;

  // 채굴 중이 아니거나 타겟이 없으면 종료
  if (!player.isDrilling || !intent.miningTarget) {
    player.isDrilling = false;
    return null;
  }

  // 몬스터를 조준 중이면 타일 채굴은 생략 (전투 시스템 담당)
  if (hasMonsterTarget) {
    return null;
  }

  const { x, y } = intent.miningTarget;
  const targetTile = tileMap.getTile(x, y);
  if (!targetTile) return null;

  // 1. 대미지 계산
  const { finalDamage, totalPower, isCrit, attackInterval } = calculateMiningDamage(
    player.stats,
    targetTile.type as any,
  );

  // 2. 쿨타임 체크 (연사 속도 제어)
  if (now - world.timestamp.lastMiningTime < attackInterval) return null;

  // 3. 타격 실행
  const destroyed = finalDamage > 0 ? tileMap.damageTile(x, y, finalDamage) : false;
  world.timestamp.lastMiningTime = now;

  if (finalDamage > 0) {
    player.lastHitTime = now;

    // [Juice: 역경직] 타일 파괴 시 순간적인 멈춤은 핵심 타격감이므로 물리 상태로 유지
    if (destroyed) {
      const isRare = targetTile.type !== 'stone';
      world.hitStopUntil = now + (isRare ? 100 : 50);
    }

    // [SoC: 이벤트 발행] 시각 효과(흔들림, 파편, 텍스트)는 VfxSystem에서 처리하도록 위임
    messageBus.emit('game:tile_hit', {
      x,
      y,
      damage: finalDamage,
      isCrit,
      destroyed,
      tileType: targetTile.type
    });
  }

  return { destroyed, targetType: targetTile.type, totalPower };
};
