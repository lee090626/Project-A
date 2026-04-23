import { GameWorld } from '@/entities/world/model';

/**
 * UI 레이어로 정기적인 상태 동기화 패킷을 방출합니다.
 */
export function syncUiSystem(world: GameWorld, lastUiSyncTime: number, now: number, uiSyncInterval: number): number {
  if (now - lastUiSyncTime > uiSyncInterval) {
    self.postMessage({
      type: 'SYNC_UI',
      payload: {
        stats: world.player.stats,
        ui: world.ui,
        boss: world.bossCombatStatus,
        // Optimization Monitoring
        metrics: {
          blockedDrops: world.droppedItemPool.blockedDropCount,
        },
      },
    });
    return now;
  }
  return lastUiSyncTime;
}

/**
 * 대기 시간 없이 즉시 UI 동기화를 강제 실행합니다.
 * 장비 교체 등 즉각적인 반응이 필요한 시점에 사용합니다.
 */
export function forceSyncUi(world: GameWorld) {
  self.postMessage({
    type: 'SYNC_UI',
    payload: {
      stats: world.player.stats,
      ui: world.ui,
      boss: world.bossCombatStatus,
      metrics: {
        blockedDrops: world.droppedItemPool.blockedDropCount,
      },
    },
  });
}
