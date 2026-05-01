import { PlayerStats, Position } from './game';
import type { ToastItem } from './game';

/**
 * 메인 스레드 -> 워커 스레드 메시지 타입
 */
export type WorkerMessageType =
  | 'INIT'
  | 'ASSETS_ATLAS'
  | 'SET_CANVAS'
  | 'RESIZE'
  | 'INPUT'
  | 'ACTION'
  | 'RETURN_BUFFER'
  | 'RETURN_SAVE_BUFFER'
  | 'SAVE_REQUEST'
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
    tileMapData?: string; // Legacy Base64
    tileMapBuffer?: ArrayBuffer; // New: IndexedDB 직접 로드한 바이너리 버퍼
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
  data?: unknown;
  targetDepth?: number;
}

/**
 * 메인 -> 워커 통합 메시지 인터페이스
 */
export type MainToWorkerMessage =
  | { type: 'INIT'; payload?: InitPayload }
  | { type: 'ASSETS_ATLAS'; payload: UpdateAssetsPayload }
  | { type: 'SET_CANVAS'; payload: { offscreen?: OffscreenCanvas } }
  | { type: 'RESIZE'; payload: { width: number; height: number } }
  | { type: 'INPUT'; payload: InputPayload }
  | { type: 'ACTION'; payload: ActionPayload }
  | { type: 'RETURN_BUFFER'; payload: { buffer?: ArrayBuffer } }
  | { type: 'RETURN_SAVE_BUFFER'; payload: { buffer?: ArrayBuffer } }
  | { type: 'SAVE_REQUEST'; payload: { type: 'export' } }
  | { type: 'SAFE_RESET'; payload?: undefined };

/**
 * 워커 -> 메인 스레드 메시지 타입
 */
export type EngineMessageType =
  | 'ENGINE_READY'
  | 'RENDER_SYNC'
  | 'EXPORT_DATA'
  | 'DIMENSION_TRAVEL_COMPLETE'
  | 'SYNC_UI'
  | 'SAVE'
  | 'PORTAL_TRIGGERED'
  | 'SHOW_TOAST'
  | 'OPEN_MODAL'
  | 'TUTORIAL_TRIGGER';

/**
 * 워커 -> 메인 통합 메시지 인터페이스
 */
export type WorkerToMainMessage =
  | { type: 'ENGINE_READY' }
  | { type: 'RENDER_SYNC'; buffer: ArrayBuffer }
  | { type: 'EXPORT_DATA'; payload?: unknown }
  | { type: 'DIMENSION_TRAVEL_COMPLETE' }
  | { type: 'SYNC_UI'; payload: unknown }
  | { type: 'SAVE'; payload: unknown }
  | { type: 'PORTAL_TRIGGERED'; payload: { nextDepth: number; nextCircleId: number } }
  | {
      type: 'SHOW_TOAST';
      payload: { message: string; type?: string; duration?: number; items?: ToastItem[] };
    }
  | { type: 'OPEN_MODAL'; payload: { target: string } }
  | { type: 'TUTORIAL_TRIGGER'; payload: { guideId: string } };

const mainToWorkerTypes = new Set<WorkerMessageType>([
  'INIT',
  'ASSETS_ATLAS',
  'SET_CANVAS',
  'RESIZE',
  'INPUT',
  'ACTION',
  'RETURN_BUFFER',
  'RETURN_SAVE_BUFFER',
  'SAVE_REQUEST',
  'SAFE_RESET',
]);

const workerToMainTypes = new Set<EngineMessageType>([
  'ENGINE_READY',
  'RENDER_SYNC',
  'EXPORT_DATA',
  'DIMENSION_TRAVEL_COMPLETE',
  'SYNC_UI',
  'SAVE',
  'PORTAL_TRIGGERED',
  'SHOW_TOAST',
  'OPEN_MODAL',
  'TUTORIAL_TRIGGER',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

export function isMainToWorkerMessage(value: unknown): value is MainToWorkerMessage {
  if (!isRecord(value) || typeof value.type !== 'string' || !mainToWorkerTypes.has(value.type as WorkerMessageType)) {
    return false;
  }

  const payload = value.payload;
  switch (value.type) {
    case 'RESIZE':
      return isRecord(payload) && typeof payload.width === 'number' && typeof payload.height === 'number';
    case 'INPUT':
      return isRecord(payload);
    case 'ACTION':
      return isRecord(payload) && typeof payload.action === 'string';
    case 'SAVE_REQUEST':
      return isRecord(payload) && payload.type === 'export';
    case 'RETURN_BUFFER':
    case 'RETURN_SAVE_BUFFER':
      return isRecord(payload) && (payload.buffer === undefined || payload.buffer instanceof ArrayBuffer);
    case 'SET_CANVAS':
      return isRecord(payload);
    case 'ASSETS_ATLAS':
      return isRecord(payload) && Array.isArray(payload.atlasData);
    case 'INIT':
    case 'SAFE_RESET':
      return payload === undefined || isRecord(payload);
    default:
      return false;
  }
}

export function isWorkerToMainMessage(value: unknown): value is WorkerToMainMessage {
  if (!isRecord(value) || typeof value.type !== 'string' || !workerToMainTypes.has(value.type as EngineMessageType)) {
    return false;
  }

  const payload = value.payload;
  switch (value.type) {
    case 'RENDER_SYNC':
      return value.buffer instanceof ArrayBuffer;
    case 'SYNC_UI':
    case 'SAVE':
    case 'EXPORT_DATA':
    case 'DIMENSION_TRAVEL_COMPLETE':
    case 'ENGINE_READY':
      return true;
    case 'PORTAL_TRIGGERED':
      return isRecord(payload) && typeof payload.nextDepth === 'number' && typeof payload.nextCircleId === 'number';
    case 'SHOW_TOAST':
      return isRecord(payload) && typeof payload.message === 'string';
    case 'OPEN_MODAL':
      return isRecord(payload) && typeof payload.target === 'string';
    case 'TUTORIAL_TRIGGER':
      return isRecord(payload) && typeof payload.guideId === 'string';
    default:
      return false;
  }
}
