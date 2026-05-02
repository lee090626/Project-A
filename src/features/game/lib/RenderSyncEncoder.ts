import { GameWorld } from '@/entities/world/model';

/**
 * GameLoop 내부의 렌더링 동기화 바이너리 통신 로직을 전담하는 인코더 클래스입니다.
 * 메인 스레드 HUD 보간에 필요한 최소 헤더 데이터만 Float32Array로 전송합니다.
 */
export class RenderSyncEncoder {
  /**
   * 버퍼에 현재 월드의 상태를 기록합니다.
   * Pixi 렌더링은 워커에서 직접 수행하므로 엔티티 본문 데이터는 전송하지 않습니다.
   */
  public static encodeAndSend(world: GameWorld, buffer: ArrayBuffer, now: number) {
    const view = new Float32Array(buffer);

    // Header 패킹
    view[0] = 0;
    view[1] = now;
    view[2] = world.player.visualPos.x;
    view[3] = world.player.visualPos.y;
    view[4] = world.shake;
    view[5] = world.player.stats.hp;
    view[6] = world.player.stats.maxHp;

    // 워커 환경에서 자체 Global Scope를 통해 전송
    (self as any).postMessage({ type: 'RENDER_SYNC', buffer }, [buffer]);
  }
}
