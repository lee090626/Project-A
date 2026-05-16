import { PlayerStats, Position } from './game';
import { isGameSfxId } from './game/audio';
import type { PlaySfxPayload } from './game/audio';
import type { ToastItem } from './game';
import { isRequirementsRecord } from '@/shared/lib/resourceRequirements';
import { isEquipmentPart, isFiniteNumber, isNonEmptyString, isRecord } from '@/shared/lib/validation';

/**
 * 메인 스레드 -> 워커 스레드 메시지 타입
 */
export type WorkerMessageType =
  | 'INIT'
  | 'ASSETS_ATLAS'
  | 'SET_CANVAS'
  | 'RESIZE'
  | 'INPUT'
  | 'UI_STATE'
  | 'ACTION'
  | 'RETURN_BUFFER'
  | 'RETURN_SAVE_BUFFER'
  | 'SAVE_REQUEST';

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
 * 메인 스레드 UI 상태 중 워커 입력 차단에 필요한 값입니다.
 */
export interface UiStatePayload {
  ui: Record<string, boolean>;
}

/**
 * 액션 핸들링 페이로드
 */
export type ActionType =
  | 'sell'
  | 'craft'
  | 'rerollEquipmentOption'
  | 'equip'
  | 'synthesizeEffect'
  | 'selectCheckpoint'
  | 'respawn'
  | 'rewardRevive';

export interface ActionPayload {
  action: ActionType;
  data?: unknown;
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
  | { type: 'UI_STATE'; payload: UiStatePayload }
  | { type: 'ACTION'; payload: ActionPayload }
  | { type: 'RETURN_BUFFER'; payload: { buffer?: ArrayBuffer } }
  | { type: 'RETURN_SAVE_BUFFER'; payload: { buffer?: ArrayBuffer } }
  | { type: 'SAVE_REQUEST'; payload: { type: 'export' } };

/**
 * 워커 -> 메인 스레드 메시지 타입
 */
export type EngineMessageType =
  | 'ENGINE_READY'
  | 'RENDER_SYNC'
  | 'EXPORT_DATA'
  | 'SYNC_UI'
  | 'SAVE'
  | 'SHOW_TOAST'
  | 'PLAY_SFX'
  | 'OPEN_MODAL'
  | 'TUTORIAL_TRIGGER';

/**
 * 워커 -> 메인 통합 메시지 인터페이스
 */
export type WorkerToMainMessage =
  | { type: 'ENGINE_READY' }
  | { type: 'RENDER_SYNC'; buffer: ArrayBuffer }
  | { type: 'EXPORT_DATA'; payload?: unknown }
  | { type: 'SYNC_UI'; payload: unknown }
  | { type: 'SAVE'; payload: unknown }
  | {
      type: 'SHOW_TOAST';
      payload: { message: string; type?: string; duration?: number; items?: ToastItem[] };
    }
  | { type: 'PLAY_SFX'; payload: PlaySfxPayload }
  | { type: 'OPEN_MODAL'; payload: { target: string } }
  | { type: 'TUTORIAL_TRIGGER'; payload: { guideId: string } };

const mainToWorkerTypes = new Set<WorkerMessageType>([
  'INIT',
  'ASSETS_ATLAS',
  'SET_CANVAS',
  'RESIZE',
  'INPUT',
  'UI_STATE',
  'ACTION',
  'RETURN_BUFFER',
  'RETURN_SAVE_BUFFER',
  'SAVE_REQUEST',
]);

const workerToMainTypes = new Set<EngineMessageType>([
  'ENGINE_READY',
  'RENDER_SYNC',
  'EXPORT_DATA',
  'SYNC_UI',
  'SAVE',
  'SHOW_TOAST',
  'PLAY_SFX',
  'OPEN_MODAL',
  'TUTORIAL_TRIGGER',
]);

function isActionPayload(value: unknown): value is ActionPayload {
  if (!isRecord(value) || typeof value.action !== 'string') return false;

  const data = value.data;
  switch (value.action) {
    case 'sell':
      return (
        isRecord(data) &&
        isNonEmptyString(data.resource) &&
        isFiniteNumber(data.amount) &&
        Number.isInteger(data.amount) &&
        data.amount > 0 &&
        (data.price === undefined || (isFiniteNumber(data.price) && data.price >= 0))
      );
    case 'craft':
      return (
        isRecord(data) &&
        isRecord(data.res) &&
        (data.req === undefined || isRequirementsRecord(data.req))
      );
    case 'rerollEquipmentOption':
      return isRecord(data) && isNonEmptyString(data.equipmentId);
    case 'equip':
      return isRecord(data) && isNonEmptyString(data.id) && isEquipmentPart(data.part);
    case 'synthesizeEffect':
      return isRecord(data) && isNonEmptyString(data.effectId);
    case 'selectCheckpoint':
      return (
        isRecord(data) &&
        isFiniteNumber(data.depth) &&
        Number.isInteger(data.depth) &&
        data.depth >= 0
      );
    case 'respawn':
    case 'rewardRevive':
      return data === undefined || isRecord(data);
    default:
      return false;
  }
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
    case 'UI_STATE':
      return (
        isRecord(payload) &&
        isRecord(payload.ui) &&
        Object.values(payload.ui).every((value) => typeof value === 'boolean')
      );
    case 'ACTION':
      return isActionPayload(payload);
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
    case 'ENGINE_READY':
      return true;
    case 'SHOW_TOAST':
      return isRecord(payload) && typeof payload.message === 'string';
    case 'PLAY_SFX':
      return (
        isRecord(payload) &&
        isGameSfxId(payload.id) &&
        (payload.intensity === undefined || typeof payload.intensity === 'number')
      );
    case 'OPEN_MODAL':
      return isRecord(payload) && typeof payload.target === 'string';
    case 'TUTORIAL_TRIGGER':
      return isRecord(payload) && typeof payload.guideId === 'string';
    default:
      return false;
  }
}
