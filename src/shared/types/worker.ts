import { PlayerStats, Position } from './game';

/**
 * 메인 스레드 -> 워커 스레드 메시지 타입
 */
export type WorkerMessageType =
  | 'INIT'
  | 'UPDATE_ASSETS'
  | 'RESIZE'
  | 'INPUT'
  | 'ACTION'
  | 'EXPORT_DATA_REQUEST'
  | 'SAFE_RESET';

/**
 * 초기화 페이로드
 */
export interface InitPayload {
  seed?: number;
  offscreen?: OffscreenCanvas;
  saveData?: {
    stats: PlayerStats;
    position: Position;
    tileMap?: any; // Legacy
    tileMapData?: string; // Binary string
  };
}

/**
 * 에셋 업데이트 페이로드
 */
export interface UpdateAssetsPayload {
  atlasData: any[];
  layout: any;
  entities: any;
}

/**
 * 입력 핸들링 페이로드
 */
export interface InputPayload {
  keys?: { [key: string]: boolean };
  mobileJoystick?: { x: number; y: number; active: boolean };
}

/**
 * 액션 핸들링 페이로드
 */
export interface ActionPayload {
  action: string;
  data?: any;
  targetDepth?: number;
}

/**
 * 메인 -> 워커 통합 메시지 인터페이스
 */
export interface MainToWorkerMessage {
  type: WorkerMessageType;
  payload?: any;
}

/**
 * 워커 -> 메인 스레드 메시지 타입
 */
export type EngineMessageType =
  | 'ENGINE_READY'
  | 'RENDER_SYNC'
  | 'EXPORT_DATA'
  | 'DIMENSION_TRAVEL_COMPLETE'
  | 'SYNC_UI';

/**
 * 워커 -> 메인 통합 메시지 인터페이스
 */
export interface WorkerToMainMessage {
  type: EngineMessageType;
  payload?: any;
}
