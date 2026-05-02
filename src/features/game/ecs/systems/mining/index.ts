import { GameWorld } from '@/entities/world/model';
import { getMasteryBonuses } from '@/shared/lib/masteryUtils';
import { getTotalRuneStat } from '@/shared/lib/runeUtils';
import { calculateArtifactBonuses, hasArtifactEffect } from '@/shared/lib/artifactUtils';
import { miningTargeter } from './MiningTargeter';
import { miningExecutor } from './MiningExecutor';
import { masteryService } from './MasteryService';

/**
 * 플레이어의 채굴 로직을 관리하는 메인 시스템(오케스트레이터)입니다.
 * 관심사의 분리에 따라 타겟팅, 실행, 보상 처리를 전문 시스템에 위임합니다.
 */
export const miningSystem = (world: GameWorld, now: number) => {
  const { player } = world;

  // 1. [SoC: 타겟팅] 무엇을 조준할 것인가?
  const { hasMonsterTarget } = miningTargeter(world);
  const miningTarget = world.intent.miningTarget;
  if (!player.isDrilling || !miningTarget || hasMonsterTarget) return;

  // 2. [SoC: 실행] 타격 및 파괴 수행
  const result = miningExecutor(world, now, false);
  if (!result || !result.destroyed) return;

  // 3. [SoC: 보상] 파괴 성공 시 필요한 보너스만 계산
  const masteryBonuses = getMasteryBonuses(player.stats);
  const artifactBonuses = calculateArtifactBonuses(player.stats);

  let masteryExpMultiplier = 1.0 + masteryBonuses.masteryExpMult;
  if (hasArtifactEffect(player.stats, 'MASTERY_BOOST')) {
    masteryExpMultiplier += 3.0;
  }

  const luck = Math.max(
    0,
    (getTotalRuneStat(player.stats, 'luck') * 100 +
      masteryBonuses.luck +
      artifactBonuses.luck * 100) *
      (1 + masteryBonuses.luckMult),
  );
  const masteryExpGain = Math.floor(10 * masteryExpMultiplier);

  masteryService(
    world,
    miningTarget.x,
    miningTarget.y,
    result.targetType,
    luck,
    masteryExpGain
  );
};
