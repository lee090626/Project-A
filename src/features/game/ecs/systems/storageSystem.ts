import { GameWorld } from '@/entities/world/model';

/**
 * 주기적으로 게임 상태를 직렬화하여 메인 스레드에 자동 저장 패킷을 방출합니다.
 */
export function autoSaveSystem(world: GameWorld, lastSaveTime: number, now: number): number {
  if (now - lastSaveTime > 10000) {
    const shouldSerializeTileMap = world.tileMap.hasPendingTileMapSave();
    const tileMapBuffer = shouldSerializeTileMap ? world.tileMap.serializeToBuffer() : undefined;

    const payload: {
      version: number;
      timestamp: number;
      stats: GameWorld['player']['stats'];
      position: GameWorld['player']['pos'];
      tileMapBuffer?: Uint32Array;
    } = {
      version: 1,
      timestamp: Date.now(),
      stats: world.player.stats,
      position: world.player.pos,
    };

    if (tileMapBuffer) {
      payload.tileMapBuffer = tileMapBuffer;
    }

    // Use (self as any) to bypass TypeScript WorkerGlobalScope inference issues
    (self as any).postMessage(
      {
        type: 'SAVE',
        payload,
      },
      tileMapBuffer ? [tileMapBuffer.buffer] : []
    );

    if (shouldSerializeTileMap) {
      world.tileMap.markTileMapSaved();
    }

    return now;
  }
  return lastSaveTime;
}
