/**
 * 게임의 기본 타일 크기 (픽셀 단위)
 * @description 모든 타일은 64x64 픽셀로 렌더링됩니다.
 */
export const TILE_SIZE = 64;

/**
 * 카메라 줌 배율
 * @description 게임 화면의 기본 확대/축소 레벨입니다.
 */
export const CAMERA_SCALE = 1.5;

/**
 * 기본 깊이 레벨
 * @description 게임 시작 시 플레이어의 초기 깊이입니다.
 */
export const BASE_DEPTH = 10;

/**
 * 이동 딜레이 (밀리초)
 * @description 플레이어 이동 입력 간의 최소 간격입니다.
 */
export const MOVEMENT_DELAY_MS = 120;

/**
 * 저장 데이터 난독화 키
 * @description 로컬 저장소에 저장된 게임 데이터를 사람이 바로 읽기 어렵게 변환할 때 사용합니다. 클라이언트 번들에 포함되므로 보안 비밀값이 아닙니다.
 */
export const SAVE_OBFUSCATION_KEY = 'DRILLING_SAVE_OBFUSCATION_V1';

/**
 * 이전 저장 난독화 키 목록
 * @description 기존 LocalStorage 저장과 export 코드를 읽기 위한 호환용 값입니다. 새 저장에는 사용하지 않습니다.
 */
export const LEGACY_SAVE_OBFUSCATION_KEYS = ['DRILLING_SECRET_KEY!'] as const;

/**
 * 성능 및 동기화 관련 상수
 */
export const UI_SYNC_INTERVAL = 500; // UI 동기화 주기 (ms)
export const SPATIAL_HASH_INTERVAL = 33.3; // 공간 분할 그리드 업데이트 주기 (ms, ~30Hz)
