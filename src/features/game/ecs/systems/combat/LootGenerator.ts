import { GameWorld } from '@/entities/world/model';
import { TILE_SIZE } from '@/shared/config/constants';
import { calculateArtifactBonuses } from '@/shared/lib/artifactUtils';
import { modifierManager } from '@/features/game/lib/ModifierManager';
import { messageBus } from '@/shared/lib/MessageBus';

/**
 * 엔티티 사망 시 전리품(Dropped Items) 생성을 담당하는 시스템입니다.
 * MessageBus를 통해 'ENTITY_DIED' 이벤트를 구독하여 작동합니다.
 */
export class LootGenerator {
  /**
   * 시스템 초기화 및 이벤트 구독 등록
   */
  public static init() {
    messageBus.on('ENTITY_DIED', (payload: any) => {
      const { world, index, monsterDef } = payload;
      this.generateLoot(world, index, monsterDef);
    });
  }

  /**
   * 몬스터 정의 및 플레이어 스탯을 기반으로 아이템 드롭 실행
   */
  private static generateLoot(world: GameWorld, index: number, monsterDef: any) {
    const { player, entities } = world;
    if (!monsterDef.rewards.drops) return;

    const artifactBonuses = calculateArtifactBonuses(player.stats);
    const luckBonus = artifactBonuses.luck; // 0.01 = 1% 증가

    // 유물 효과 적용 (수량 보너스 등)
    const lootMultiplier = modifierManager.applyAll(
      'onKill',
      'loot',
      1.0,
      { playerStats: player.stats }
    );

    monsterDef.rewards.drops.forEach((drop: any) => {
      const rand = Math.random();
      if (rand < drop.chance) {
        // 기본 수량 결정
        const baseAmount = Math.floor(Math.random() * (drop.maxAmount - drop.minAmount + 1)) + drop.minAmount;
        
        // 행운 및 유물 보너스 적용
        const finalAmount = Math.max(
          1,
          Math.floor(baseAmount * (1 + luckBonus) * lootMultiplier)
        );

        // 시각적 분산 스폰 (엔티티 중심 좌표 기준)
        const vx = (Math.random() - 0.5) * 10;
        const vy = -Math.random() * 8 - 4;

        world.droppedItemPool.spawn(
          drop.itemId as any,
          entities.soa.x[index] + (entities.soa.width[index] || TILE_SIZE) / 2,
          entities.soa.y[index] + (entities.soa.height[index] || TILE_SIZE) / 2,
          vx,
          vy,
          finalAmount
        );
      }
    });
  }
}
