import { GameWorld } from '@/entities/world/model';
import { ID_TO_TILE_TYPE } from '@/shared/types/game';
import { addArtifactStack, isArtifactId } from '@/shared/lib/artifactUtils';


/**
 * 드롭된 아이템의 즉시 획득 로직을 관리합니다.
 *
 * 드롭 아이템을 장시간 물리 시뮬레이션하거나 렌더링하지 않고 같은 틱에서 정산하여
 * 드롭 스프라이트 누적, 자석 이동 계산, 아이템 렌더링 비용을 줄입니다.
 *
 * @param world - 게임 월드
 */
export const updateLootCollection = (world: GameWorld) => {
  const { droppedItemPool: dp } = world;

  for (let i = 0; i < dp.active.length; i++) {
    if (!dp.active[i]) continue;

    collectDroppedItem(world, i);
    dp.kill(i);
  }
};

/**
 * 드롭 아이템 풀의 특정 슬롯을 플레이어 보상으로 정산합니다.
 *
 * @param world - 게임 월드
 * @param index - 드롭 아이템 풀 슬롯 인덱스
 */
function collectDroppedItem(world: GameWorld, index: number): void {
  const { player, droppedItemPool: dp } = world;
  const id = ID_TO_TILE_TYPE[dp.typeId[index]];
  const amount = dp.amount[index];

  if (!id || amount <= 0) return;

  // 인벤토리 및 수집 기록 가산
  if (isArtifactId(id)) {
    const gained = addArtifactStack(player.stats, id, amount);
    if (gained > 0) {
      world.aggregationBuffer[id] = (world.aggregationBuffer[id] || 0) + gained;
    }
    return;
  }

  if (id.includes('stone') || id.includes('ite')) {
    player.stats.inventory[id] = (player.stats.inventory[id] || 0) + amount;
    world.aggregationBuffer[id] = (world.aggregationBuffer[id] || 0) + amount;
    return;
  }

  if (!player.stats.collectionHistory) player.stats.collectionHistory = {};
  player.stats.collectionHistory[id] = (player.stats.collectionHistory[id] || 0) + amount;
  world.aggregationBuffer[id] = (world.aggregationBuffer[id] || 0) + amount;
}
