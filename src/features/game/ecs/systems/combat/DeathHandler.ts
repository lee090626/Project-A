import { GameWorld } from '@/entities/world/model';
import { MONSTER_LIST } from '@/shared/config/monsterData';
import { TILE_SIZE } from '@/shared/config/constants';
import { modifierManager } from '@/features/game/lib/ModifierManager';
import { createFloatingText } from '@/shared/lib/effectUtils';
import { handleBossDefeat } from '../boss/bossDefeatHandler';
import { messageBus } from '@/shared/lib/MessageBus';

/**
 * 엔티티의 사망 여부를 확인하고, 사망 시 보상 정산 및 엔티티 제거를 처리합니다.
 */
export const deathHandler = (world: GameWorld, now: number) => {
  const { player, entities } = world;

  // 플레이어 생존 확인
  if (player.stats.hp <= 0) player.stats.hp = 0;

  // 몬스터/보스 사망 체크 (역순 루프로 안전하게 제거)
  for (let i = entities.soa.count - 1; i >= 0; i--) {
    const type = entities.soa.type[i];
    if ((type === 1 || type === 2) && entities.soa.hp[i] <= 0) {
      processDeath(world, i, now);
    }
  }
};

/**
 * 개별 엔티티의 사망 처리 로직
 */
function processDeath(world: GameWorld, index: number, now: number) {
  const { player, entities } = world;
  const type = entities.soa.type[index];
  const defIdx = entities.soa.monsterDefIndex[index];
  const monsterDef = MONSTER_LIST[defIdx];

  if (!monsterDef) {
    entities.destroy(index);
    return;
  }

  // 1. 기본 보상(Gold) 계산 및 지급
  const isBoss = type === 2;
  const multiplier = modifierManager.getRarityMultiplier(monsterDef.rarity, isBoss);
  const rewardGold = monsterDef.rewards?.gold ?? 0;
  const totalGold = Math.floor(rewardGold * multiplier);

  player.stats.goldCoins += totalGold;
  createFloatingText(
    world,
    entities.soa.x[index],
    entities.soa.y[index] - 60,
    `+${totalGold} G`,
    '#fde047',
    1.5
  );

  // 2. 경험치 정산 (유물 효과 적용)
  let expAmount = monsterDef.rewards.exp;
  expAmount = modifierManager.applyAll('onKill', 'exp', expAmount, { playerStats: player.stats });
  
  // NOTE: 경험치 실제 가산 로직은 PlayerStats 시스템에서 처리되거나 여기서 직접 가산 가능
  // 현재 구조에 따라 player.stats.exp += expAmount 로직 추가 여부 판단 필요 (레거시 코드 준수)

  // 3. 부수 효과 트리거 (Life Steal 등)
  modifierManager.triggerOnKillSideEffects({
    playerStats: player.stats,
    sideEffect: (effectType, payload) => {
      if (effectType === 'HEAL') {
        const healAmount = payload as number;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healAmount);
        createFloatingText(
          world,
          player.pos.x * TILE_SIZE,
          player.pos.y * TILE_SIZE - 40,
          `+${healAmount} HP`,
          '#4ade80',
        );
      }
    },
  });

  // 4. 보스 처치 특수 처리
  if (isBoss) {
    handleBossDefeat(world, entities.soa.x[index], entities.soa.y[index]);
    if (monsterDef.behavior.respawnMs) {
      if (!player.stats.bossRespawnTimers) player.stats.bossRespawnTimers = {};
      player.stats.bossRespawnTimers[monsterDef.id] = Date.now() + monsterDef.behavior.respawnMs;
    }
  }

  // 5. 처치 기록 및 이벤트 전파 (LootGenerator 등이 수신)
  if (!player.stats.killedMonsterIds) player.stats.killedMonsterIds = [];
  player.stats.killedMonsterIds.push(monsterDef.id);

  // 메시지 버스를 통한 비결합 통신: 사망한 위치와 몬스터 정보 전송
  messageBus.emit('ENTITY_DIED', {
    world,
    index,
    monsterDef,
    type
  });

  // 6. 엔티티 최종 제거
  entities.destroy(index);
}
