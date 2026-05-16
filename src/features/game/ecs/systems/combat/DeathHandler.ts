import { GameWorld } from '@/entities/world/model';
import { MONSTER_LIST } from '@/shared/config/monsterData';
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

  const isBoss = type === 2;
  // 1. 설정된 기본 골드 보상 지급
  const rewardGold = Math.floor(monsterDef.rewards?.gold ?? 0);

  player.stats.goldCoins += rewardGold;
  createFloatingText(
    world,
    entities.soa.x[index],
    entities.soa.y[index] - 60,
    `+${rewardGold} G`,
    '#fde047',
    1.5
  );

  // 2. 보스 처치 특수 처리
  if (isBoss) {
    handleBossDefeat(world, entities.soa.x[index], entities.soa.y[index]);
    if (monsterDef.behavior.respawnMs) {
      if (!player.stats.bossRespawnTimers) player.stats.bossRespawnTimers = {};
      player.stats.bossRespawnTimers[monsterDef.id] = Date.now() + monsterDef.behavior.respawnMs;
    }
  }

  // 3. 처치 기록 및 이벤트 전파 (LootGenerator 등이 수신)
  if (!player.stats.killedMonsterIds) player.stats.killedMonsterIds = [];
  player.stats.killedMonsterIds.push(monsterDef.id);

  // 메시지 버스를 통한 비결합 통신: 사망한 위치와 몬스터 정보 전송
  messageBus.emit('ENTITY_DIED', {
    world,
    index,
    monsterDef,
    type
  });

  // 4. 엔티티 최종 제거
  entities.destroy(index);
}
