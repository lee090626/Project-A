import { GameEngineInstance } from './GameEngineInstance';
import { isMainToWorkerMessage } from '@/shared/types/worker';

/**
 * 워커 스레드의 메인 진입점에서 메시지를 수신하여 GameEngineInstance로 라우팅하는 책임을 가집니다.
 * 이 라우터를 통해 game.worker.ts의 거대한 switch-case 스파게티를 방지합니다.
 */
export class WorkerMessageRouter {
  constructor(private engine: GameEngineInstance) {}

  public handleMessage(e: MessageEvent) {
    if (!isMainToWorkerMessage(e.data)) {
      console.warn('[WorkerMessageRouter] Dropping invalid message:', e.data);
      return;
    }

    const { type, payload } = e.data;

    switch (type) {
      case 'INIT':
        this.engine.init(payload || {});
        break;
      case 'ASSETS_ATLAS':
        this.engine.updateAssetsFromAtlas(payload);
        break;
      case 'SET_CANVAS':
        if (payload?.offscreen) {
          this.engine.setCanvas(payload.offscreen);
        }
        break;
      case 'INPUT':
        this.engine.handleInput(payload);
        break;
      case 'RESIZE':
        this.engine.resize(payload.width, payload.height);
        break;
      case 'ACTION':
        this.engine.handleAction(payload);
        break;
      case 'RETURN_BUFFER':
        if (payload?.buffer) {
          this.engine.returnBuffer(payload.buffer);
        }
        break;
      case 'RETURN_SAVE_BUFFER':
        // Zero-Copy 흐름: 메인이 IndexedDB에 저장 후 반환한 버퍼를 사용 가능한 상태로 유지
        // (현재는 그대로 멏 쓰지만, 추후 pre-allocated 저장 버퍼로 확장 가능)
        break;
      case 'SAVE_REQUEST':
        if (payload?.type === 'export') {
          this.engine.handleSaveRequest();
        }
        break;
      default:
        console.warn(`[WorkerMessageRouter] Unknown message type: ${type}`);
    }
  }
}
